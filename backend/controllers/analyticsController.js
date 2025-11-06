import Analytics from '../models/Analytics.js';
import Result from '../models/Result.js';
import Assessment from '../models/Assessment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Question from '../models/Question.js';

/**
 * @desc    Get dashboard analytics
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let analytics = {};

    if (userRole === 'student') {
      // Student dashboard
      const results = await Result.find({ student: userId, status: 'completed' });
      const assessments = await Assessment.countDocuments({
        status: 'published',
        $or: [
          { targetStudents: userId },
          { targetBatches: req.user.batch }
        ]
      });

      const totalAttempts = results.length;
      const passedTests = results.filter(r => r.isPassed).length;
      const avgScore = results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.score.percentage, 0) / results.length)
        : 0;

      // Get recent performance trend (last 10 tests)
      const recentResults = results.slice(-10);
      const performanceTrend = recentResults.map(r => ({
        date: r.submittedAt,
        score: r.score.percentage,
        assessment: r.assessment
      }));

      // Get topic strengths from user context
      const user = await User.findById(userId);
      const topicStrengths = Array.from(user.context.topicStrengths || new Map())
        .map(([topic, strength]) => ({ topic, strength }))
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 5);

      const weakTopics = Array.from(user.context.topicStrengths || new Map())
        .map(([topic, strength]) => ({ topic, strength }))
        .filter(t => t.strength < 60)
        .sort((a, b) => a.strength - b.strength)
        .slice(0, 5);

      analytics = {
        overview: {
          totalAttempts,
          passedTests,
          failedTests: totalAttempts - passedTests,
          averageScore: avgScore,
          passRate: totalAttempts > 0 ? Math.round((passedTests / totalAttempts) * 100) : 0,
          availableAssessments: assessments,
          inProgressTests: await Result.countDocuments({ 
            student: userId, 
            status: 'in-progress' 
          })
        },
        performanceTrend,
        topStrengths: topicStrengths,
        weakAreas: weakTopics,
        learningMetrics: {
          averageTimePerQuestion: user.context.averageTimePerQuestion,
          preferredDifficulty: user.context.difficultyPreference,
          totalStudyTime: user.context.totalTimeSpent,
          questionsAttempted: user.context.questionsAttempted
        }
      };

    } else if (userRole === 'faculty') {
      // Faculty dashboard
      const courses = await Course.find({ faculty: userId });
      const courseIds = courses.map(c => c._id);

      const assessments = await Assessment.find({ createdBy: userId });
      const assessmentIds = assessments.map(a => a._id);

      const totalStudents = await User.countDocuments({
        role: 'student',
        courses: { $in: courseIds }
      });

      const totalResults = await Result.countDocuments({
        assessment: { $in: assessmentIds },
        status: 'completed'
      });

      const results = await Result.find({
        assessment: { $in: assessmentIds },
        status: 'completed'
      });

      const avgScore = results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.score.percentage, 0) / results.length)
        : 0;

      // Course-wise performance
      const coursePerformance = await Promise.all(
        courses.map(async (course) => {
          const courseAssessments = assessments.filter(
            a => a.course.toString() === course._id.toString()
          );
          const courseAssessmentIds = courseAssessments.map(a => a._id);
          
          const courseResults = await Result.find({
            assessment: { $in: courseAssessmentIds },
            status: 'completed'
          });

          const avgCourseScore = courseResults.length > 0
            ? Math.round(courseResults.reduce((sum, r) => sum + r.score.percentage, 0) / courseResults.length)
            : 0;

          return {
            courseId: course._id,
            courseName: course.title,
            courseCode: course.code,
            totalAssessments: courseAssessments.length,
            totalAttempts: courseResults.length,
            averageScore: avgCourseScore,
            studentsEnrolled: course.studentsEnrolled?.length || 0
          };
        })
      );

      analytics = {
        overview: {
          totalCourses: courses.length,
          totalAssessments: assessments.length,
          totalStudents,
          totalAttempts: totalResults,
          averageScore: avgScore,
          activeAssessments: assessments.filter(a => a.status === 'published').length
        },
        coursePerformance,
        recentActivity: await getRecentActivity(userId, 'faculty')
      };

    } else if (userRole === 'admin') {
      // Admin dashboard
      const totalUsers = await User.countDocuments();
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalFaculty = await User.countDocuments({ role: 'faculty' });
      const totalCourses = await Course.countDocuments();
      const totalAssessments = await Assessment.countDocuments();
      const totalQuestions = await Question.countDocuments();

      const allResults = await Result.find({ status: 'completed' });
      const avgSystemScore = allResults.length > 0
        ? Math.round(allResults.reduce((sum, r) => sum + r.score.percentage, 0) / allResults.length)
        : 0;

      // System-wide trends
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const recentResults = await Result.find({
        status: 'completed',
        submittedAt: { $gte: last30Days }
      });

      const dailyActivity = {};
      recentResults.forEach(r => {
        const date = r.submittedAt.toISOString().split('T')[0];
        if (!dailyActivity[date]) {
          dailyActivity[date] = { date, count: 0, avgScore: 0, total: 0 };
        }
        dailyActivity[date].count++;
        dailyActivity[date].total += r.score.percentage;
        dailyActivity[date].avgScore = Math.round(dailyActivity[date].total / dailyActivity[date].count);
      });

      analytics = {
        overview: {
          totalUsers,
          totalStudents,
          totalFaculty,
          totalCourses,
          totalAssessments,
          totalQuestions,
          totalAttempts: allResults.length,
          averageScore: avgSystemScore,
          activeUsers: await User.countDocuments({ 
            lastLogin: { $gte: last30Days } 
          })
        },
        activityTrend: Object.values(dailyActivity).sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        ),
        departmentStats: await getDepartmentStats(),
        topPerformers: await getTopPerformers(10),
        systemHealth: await getSystemHealth()
      };
    }

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student analytics
 * @route   GET /api/analytics/student/:id
 * @access  Private
 */
export const getStudentAnalytics = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    // Authorization: students can only view their own analytics
    if (
      req.user.role === 'student' &&
      req.user._id.toString() !== studentId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this analytics'
      });
    }

    const student = await User.findById(studentId).populate('courses');
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get all results
    const results = await Result.find({ 
      student: studentId, 
      status: 'completed' 
    })
      .populate('assessment', 'title type course')
      .populate({
        path: 'assessment',
        populate: { path: 'course', select: 'title code' }
      })
      .sort({ submittedAt: -1 });

    // Overall statistics
    const totalAttempts = results.length;
    const passedTests = results.filter(r => r.isPassed).length;
    const avgScore = totalAttempts > 0
      ? Math.round(results.reduce((sum, r) => sum + r.score.percentage, 0) / totalAttempts)
      : 0;

    // Performance by course
    const coursePerformance = {};
    results.forEach(r => {
      const courseId = r.assessment?.course?._id?.toString();
      const courseName = r.assessment?.course?.title || 'Unknown';
      
      if (courseId) {
        if (!coursePerformance[courseId]) {
          coursePerformance[courseId] = {
            courseName,
            attempts: 0,
            passed: 0,
            scores: []
          };
        }
        coursePerformance[courseId].attempts++;
        if (r.isPassed) coursePerformance[courseId].passed++;
        coursePerformance[courseId].scores.push(r.score.percentage);
      }
    });

    const courseStats = Object.entries(coursePerformance).map(([courseId, data]) => ({
      courseId,
      courseName: data.courseName,
      attempts: data.attempts,
      passed: data.passed,
      passRate: Math.round((data.passed / data.attempts) * 100),
      averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      highestScore: Math.max(...data.scores),
      lowestScore: Math.min(...data.scores)
    }));

    // Performance trend (last 20 tests)
    const performanceTrend = results.slice(0, 20).reverse().map(r => ({
      date: r.submittedAt,
      score: r.score.percentage,
      assessmentTitle: r.assessment?.title,
      isPassed: r.isPassed
    }));

    // Topic analysis
    const topicStats = new Map();
    results.forEach(r => {
      r.topicPerformance.forEach(tp => {
        if (!topicStats.has(tp.topic)) {
          topicStats.set(tp.topic, {
            topic: tp.topic,
            totalAttempted: 0,
            totalCorrect: 0,
            attempts: []
          });
        }
        const stat = topicStats.get(tp.topic);
        stat.totalAttempted += tp.attempted;
        stat.totalCorrect += tp.correct;
        stat.attempts.push(tp.accuracy);
      });
    });

    const topicPerformance = Array.from(topicStats.values()).map(stat => ({
      topic: stat.topic,
      totalAttempted: stat.totalAttempted,
      totalCorrect: stat.totalCorrect,
      accuracy: Math.round((stat.totalCorrect / stat.totalAttempted) * 100),
      averageAccuracy: Math.round(
        stat.attempts.reduce((a, b) => a + b, 0) / stat.attempts.length
      ),
      trend: calculateTrend(stat.attempts),
      status: stat.totalCorrect / stat.totalAttempted >= 0.7 ? 'strong' : 
              stat.totalCorrect / stat.totalAttempted >= 0.5 ? 'average' : 'weak'
    })).sort((a, b) => b.accuracy - a.accuracy);

    // Difficulty analysis
    const difficultyStats = { easy: [], medium: [], hard: [] };
    results.forEach(r => {
      r.difficultyPerformance.forEach(dp => {
        if (difficultyStats[dp.difficulty]) {
          difficultyStats[dp.difficulty].push(dp.accuracy);
        }
      });
    });

    const difficultyPerformance = Object.entries(difficultyStats).map(([difficulty, accuracies]) => ({
      difficulty,
      averageAccuracy: accuracies.length > 0
        ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length)
        : 0,
      attempts: accuracies.length
    }));

    // Time management
    const avgTimePerQuestion = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + (r.timeTaken / r.answers.length), 0) / results.length)
      : 0;

    // Get analytics record if exists
    let analyticsRecord = await Analytics.findOne({
      entityType: 'student',
      entityId: studentId
    });

    const analytics = {
      studentInfo: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        department: student.department,
        batch: student.batch
      },
      overallStats: {
        totalAttempts,
        passedTests,
        failedTests: totalAttempts - passedTests,
        averageScore: avgScore,
        passRate: totalAttempts > 0 ? Math.round((passedTests / totalAttempts) * 100) : 0,
        highestScore: results.length > 0 ? Math.max(...results.map(r => r.score.percentage)) : 0,
        lowestScore: results.length > 0 ? Math.min(...results.map(r => r.score.percentage)) : 0
      },
      performanceTrend,
      coursePerformance: courseStats,
      topicPerformance,
      difficultyPerformance,
      timeManagement: {
        averageTimePerQuestion: avgTimePerQuestion,
        averageTestDuration: results.length > 0
          ? Math.round(results.reduce((sum, r) => sum + r.timeTaken, 0) / results.length)
          : 0
      },
      learningProfile: {
        topicStrengths: Array.from(student.context.topicStrengths || new Map())
          .map(([topic, strength]) => ({ topic, strength })),
        difficultyPreference: student.context.difficultyPreference,
        averageTimePerQuestion: student.context.averageTimePerQuestion,
        totalTimeSpent: student.context.totalTimeSpent,
        questionsAttempted: student.context.questionsAttempted,
        lastUpdated: student.context.lastUpdated
      },
      recommendations: generateStudentRecommendations(
        avgScore,
        topicPerformance,
        difficultyPerformance,
        avgTimePerQuestion
      ),
      analyticsMetadata: analyticsRecord
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get course analytics
 * @route   GET /api/analytics/course/:id
 * @access  Private/Faculty/Admin
 */
export const getCourseAnalytics = async (req, res, next) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findById(courseId)
      .populate('faculty', 'name email')
      .populate('studentsEnrolled.student', 'name email rollNumber');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Authorization check for faculty
    if (
      req.user.role === 'faculty' &&
      course.faculty._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this course analytics'
      });
    }

    // Get all assessments for this course
    const assessments = await Assessment.find({ course: courseId });
    const assessmentIds = assessments.map(a => a._id);

    // Get all results
    const results = await Result.find({
      assessment: { $in: assessmentIds },
      status: 'completed'
    }).populate('student', 'name rollNumber');

    // Overall statistics
    const totalStudents = course.studentsEnrolled.length;
    const totalAssessments = assessments.length;
    const totalAttempts = results.length;
    const avgScore = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.score.percentage, 0) / results.length)
      : 0;

    // Score distribution
    const scoreRanges = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      '50-59': 0,
      '0-49': 0
    };

    results.forEach(r => {
      const score = r.score.percentage;
      if (score >= 90) scoreRanges['90-100']++;
      else if (score >= 80) scoreRanges['80-89']++;
      else if (score >= 70) scoreRanges['70-79']++;
      else if (score >= 60) scoreRanges['60-69']++;
      else if (score >= 50) scoreRanges['50-59']++;
      else scoreRanges['0-49']++;
    });

    // Student performance
    const studentPerformance = {};
    results.forEach(r => {
      const studentId = r.student._id.toString();
      if (!studentPerformance[studentId]) {
        studentPerformance[studentId] = {
          studentName: r.student.name,
          rollNumber: r.student.rollNumber,
          attempts: 0,
          scores: []
        };
      }
      studentPerformance[studentId].attempts++;
      studentPerformance[studentId].scores.push(r.score.percentage);
    });

    const studentStats = Object.values(studentPerformance).map(data => ({
      studentName: data.studentName,
      rollNumber: data.rollNumber,
      attempts: data.attempts,
      averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      highestScore: Math.max(...data.scores),
      trend: calculateTrend(data.scores)
    })).sort((a, b) => b.averageScore - a.averageScore);

    // Topic-wise performance
    const topicStats = new Map();
    results.forEach(r => {
      r.topicPerformance.forEach(tp => {
        if (!topicStats.has(tp.topic)) {
          topicStats.set(tp.topic, {
            totalAttempted: 0,
            totalCorrect: 0
          });
        }
        const stat = topicStats.get(tp.topic);
        stat.totalAttempted += tp.attempted;
        stat.totalCorrect += tp.correct;
      });
    });

    const topicPerformance = Array.from(topicStats.entries()).map(([topic, data]) => ({
      topic,
      accuracy: Math.round((data.totalCorrect / data.totalAttempted) * 100),
      totalAttempted: data.totalAttempted,
      status: data.totalCorrect / data.totalAttempted >= 0.7 ? 'strong' : 
              data.totalCorrect / data.totalAttempted >= 0.5 ? 'average' : 'weak'
    })).sort((a, b) => a.accuracy - b.accuracy);

    // Assessment-wise stats
    const assessmentStats = await Promise.all(
      assessments.map(async (assessment) => {
        const assessmentResults = results.filter(
          r => r.assessment.toString() === assessment._id.toString()
        );

        return {
          assessmentId: assessment._id,
          assessmentTitle: assessment.title,
          type: assessment.type,
          attempts: assessmentResults.length,
          averageScore: assessmentResults.length > 0
            ? Math.round(assessmentResults.reduce((sum, r) => sum + r.score.percentage, 0) / assessmentResults.length)
            : 0,
          passRate: assessmentResults.length > 0
            ? Math.round((assessmentResults.filter(r => r.isPassed).length / assessmentResults.length) * 100)
            : 0
        };
      })
    );

    const analytics = {
      courseInfo: {
        id: course._id,
        title: course.title,
        code: course.code,
        faculty: course.faculty.name,
        department: course.department,
        semester: course.semester
      },
      overallStats: {
        totalStudents,
        totalAssessments,
        totalAttempts,
        averageScore: avgScore,
        participationRate: totalStudents > 0
          ? Math.round((new Set(results.map(r => r.student._id.toString())).size / totalStudents) * 100)
          : 0
      },
      scoreDistribution: Object.entries(scoreRanges).map(([range, count]) => ({
        range,
        count,
        percentage: totalAttempts > 0 ? Math.round((count / totalAttempts) * 100) : 0
      })),
      studentPerformance: studentStats,
      topicPerformance,
      assessmentStats,
      weakAreas: topicPerformance.filter(tp => tp.status === 'weak').slice(0, 5),
      recommendations: generateCourseRecommendations(topicPerformance, avgScore, studentStats)
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get batch analytics
 * @route   GET /api/analytics/batch/:batch
 * @access  Private/Faculty/Admin
 */
export const getBatchAnalytics = async (req, res, next) => {
  try {
    const batch = req.params.batch;

    const students = await User.find({ 
      role: 'student', 
      batch 
    }).select('name email rollNumber department');

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No students found for this batch'
      });
    }

    const studentIds = students.map(s => s._id);

    // Get all results for batch students
    const results = await Result.find({
      student: { $in: studentIds },
      status: 'completed'
    }).populate('student', 'name rollNumber department');

    // Overall statistics
    const totalStudents = students.length;
    const activeStudents = new Set(results.map(r => r.student._id.toString())).size;
    const totalAttempts = results.length;
    const avgScore = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.score.percentage, 0) / results.length)
      : 0;

    // Department-wise breakdown
    const deptStats = {};
    students.forEach(s => {
      if (!deptStats[s.department]) {
        deptStats[s.department] = {
          totalStudents: 0,
          activeStudents: 0,
          scores: []
        };
      }
      deptStats[s.department].totalStudents++;
    });

    results.forEach(r => {
      const dept = r.student.department;
      if (deptStats[dept]) {
        deptStats[dept].scores.push(r.score.percentage);
      }
    });

    results.forEach(r => {
      const dept = r.student.department;
      if (deptStats[dept]) {
        deptStats[dept].activeStudents = new Set(
          results
            .filter(res => res.student.department === dept)
            .map(res => res.student._id.toString())
        ).size;
      }
    });

    const departmentPerformance = Object.entries(deptStats).map(([dept, data]) => ({
      department: dept,
      totalStudents: data.totalStudents,
      activeStudents: data.activeStudents,
      averageScore: data.scores.length > 0
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : 0,
      attempts: data.scores.length
    }));

    // Top performers
    const studentPerformance = {};
    results.forEach(r => {
      const studentId = r.student._id.toString();
      if (!studentPerformance[studentId]) {
        studentPerformance[studentId] = {
          student: r.student,
          scores: []
        };
      }
      studentPerformance[studentId].scores.push(r.score.percentage);
    });

    const topPerformers = Object.values(studentPerformance)
      .map(data => ({
        name: data.student.name,
        rollNumber: data.student.rollNumber,
        department: data.student.department,
        averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        attempts: data.scores.length
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10);

    const analytics = {
      batchInfo: {
        batch,
        totalStudents,
        activeStudents,
        participationRate: Math.round((activeStudents / totalStudents) * 100)
      },
      overallStats: {
        totalAttempts,
        averageScore: avgScore,
        passRate: results.length > 0
          ? Math.round((results.filter(r => r.isPassed).length / results.length) * 100)
          : 0
      },
      departmentPerformance,
      topPerformers,
      performanceTrend: calculateBatchTrend(results)
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get assessment analytics
 * @route   GET /api/analytics/assessment/:id
 * @access  Private/Faculty/Admin
 */
export const getAssessmentAnalytics = async (req, res, next) => {
  try {
    const assessmentId = req.params.id;

    const assessment = await Assessment.findById(assessmentId)
      .populate('course', 'title code')
      .populate('createdBy', 'name email')
      .populate('questions.question');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Get all results
    const results = await Result.find({
      assessment: assessmentId,
      status: 'completed'
    }).populate('student', 'name rollNumber department');

    const totalAttempts = results.length;
    const uniqueStudents = new Set(results.map(r => r.student._id.toString())).size;
    const avgScore = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.score.percentage, 0) / results.length)
      : 0;
    const passRate = results.length > 0
      ? Math.round((results.filter(r => r.isPassed).length / results.length) * 100)
      : 0;

    // Question-wise analysis
    const questionStats = assessment.questions.map(q => {
      const question = q.question;
      let correctCount = 0;
      let totalAttempted = 0;

      results.forEach(r => {
        const answer = r.answers.find(
          a => a.question.toString() === question._id.toString()
        );
        if (answer && answer.submittedAnswer) {
          totalAttempted++;
          if (answer.isCorrect) correctCount++;
        }
      });

      return {
        questionId: question._id,
        questionText: question.questionText.substring(0, 100),
        difficulty: question.difficulty,
        topic: question.topic,
        attempted: totalAttempted,
        correctAnswers: correctCount,
        accuracy: totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0,
        discriminationIndex: calculateDiscriminationIndex(question._id, results)
      };
    }).sort((a, b) => a.accuracy - b.accuracy);

    const analytics = {
      assessmentInfo: {
        id: assessment._id,
        title: assessment.title,
        type: assessment.type,
        course: assessment.course?.title,
        createdBy: assessment.createdBy.name,
        totalQuestions: assessment.questions.length,
        totalMarks: assessment.config.totalMarks,
        duration: assessment.config.duration
      },
      overallStats: {
        totalAttempts,
        uniqueStudents,
        averageScore: avgScore,
        passRate,
        averageTime: results.length > 0
          ? Math.round(results.reduce((sum, r) => sum + r.timeTaken, 0) / results.length)
          : 0
      },
      scoreDistribution: calculateScoreDistribution(results),
      questionAnalysis: questionStats,
      difficultQuestions: questionStats.filter(q => q.accuracy < 50).slice(0, 5),
      easyQuestions: questionStats.filter(q => q.accuracy > 80).slice(0, 5),
      recommendations: generateAssessmentRecommendations(questionStats, avgScore, passRate)
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
const calculateTrend = (values) => {
  if (values.length < 2) return 'stable';
  const recent = values.slice(-3);
  const older = values.slice(0, Math.min(3, values.length - 3));
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
  
  if (recentAvg > olderAvg + 5) return 'improving';
  if (recentAvg < olderAvg - 5) return 'declining';
  return 'stable';
};

const calculateBatchTrend = (results) => {
  const monthly = {};
  results.forEach(r => {
    const month = r.submittedAt.toISOString().substring(0, 7);
    if (!monthly[month]) {
      monthly[month] = { scores: [], count: 0 };
    }
    monthly[month].scores.push(r.score.percentage);
    monthly[month].count++;
  });

  return Object.entries(monthly).map(([month, data]) => ({
    month,
    averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
    attempts: data.count
  })).sort((a, b) => a.month.localeCompare(b.month));
};

const calculateScoreDistribution = (results) => {
  const ranges = {
    '90-100': 0, '80-89': 0, '70-79': 0,
    '60-69': 0, '50-59': 0, '0-49': 0
  };

  results.forEach(r => {
    const score = r.score.percentage;
    if (score >= 90) ranges['90-100']++;
    else if (score >= 80) ranges['80-89']++;
    else if (score >= 70) ranges['70-79']++;
    else if (score >= 60) ranges['60-69']++;
    else if (score >= 50) ranges['50-59']++;
    else ranges['0-49']++;
  });

  return Object.entries(ranges).map(([range, count]) => ({
    range,
    count,
    percentage: results.length > 0 ? Math.round((count / results.length) * 100) : 0
  }));
};

const calculateDiscriminationIndex = (questionId, results) => {
  const scores = results
    .map(r => ({
      totalScore: r.score.percentage,
      answer: r.answers.find(a => a.question.toString() === questionId.toString())
    }))
    .filter(item => item.answer && item.answer.submittedAnswer);

  if (scores.length < 4) return 0;

  scores.sort((a, b) => b.totalScore - a.totalScore);
  const topGroup = scores.slice(0, Math.floor(scores.length * 0.27));
  const bottomGroup = scores.slice(-Math.floor(scores.length * 0.27));

  const topCorrect = topGroup.filter(s => s.answer.isCorrect).length / topGroup.length;
  const bottomCorrect = bottomGroup.filter(s => s.answer.isCorrect).length / bottomGroup.length;

  return Math.round((topCorrect - bottomCorrect) * 100) / 100;
};

const generateStudentRecommendations = (avgScore, topicPerf, diffPerf, avgTime) => {
  const recommendations = [];

  if (avgScore < 50) {
    recommendations.push({
      type: 'critical',
      message: 'Your overall performance needs significant improvement. Consider additional study sessions and practice tests.'
    });
  }

  const weakTopics = topicPerf.filter(t => t.status === 'weak').slice(0, 3);
  if (weakTopics.length > 0) {
    recommendations.push({
      type: 'focus',
      message: `Focus on these weak areas: ${weakTopics.map(t => t.topic).join(', ')}`
    });
  }

  return recommendations;
};

const generateCourseRecommendations = (topicPerf, avgScore, studentStats) => {
  const recommendations = [];

  if (avgScore < 60) {
    recommendations.push({
      type: 'alert',
      message: 'Overall course performance is below expectations. Consider additional tutorials or revision sessions.'
    });
  }

  const weakTopics = topicPerf.filter(t => t.status === 'weak');
  if (weakTopics.length > 0) {
    recommendations.push({
      type: 'content',
      message: `These topics need more attention: ${weakTopics.map(t => t.topic).join(', ')}`
    });
  }

  return recommendations;
};

const generateAssessmentRecommendations = (questionStats, avgScore, passRate) => {
  const recommendations = [];

  if (passRate < 60) {
    recommendations.push({
      type: 'difficulty',
      message: 'Low pass rate indicates the assessment may be too difficult. Consider reviewing question difficulty.'
    });
  }

  const veryDifficult = questionStats.filter(q => q.accuracy < 30);
  if (veryDifficult.length > 0) {
    recommendations.push({
      type: 'questions',
      message: `${veryDifficult.length} questions have very low accuracy. Review these questions for clarity.`
    });
  }

  return recommendations;
};

const getRecentActivity = async (userId, role) => {
  // Placeholder for recent activity
  return [];
};

const getDepartmentStats = async () => {
  const students = await User.find({ role: 'student' });
  const deptCounts = {};
  
  students.forEach(s => {
    deptCounts[s.department] = (deptCounts[s.department] || 0) + 1;
  });

  return Object.entries(deptCounts).map(([dept, count]) => ({
    department: dept,
    studentCount: count
  }));
};

const getTopPerformers = async (limit) => {
  const results = await Result.find({ status: 'completed' })
    .populate('student', 'name rollNumber department');

  const studentScores = {};
  results.forEach(r => {
    const id = r.student._id.toString();
    if (!studentScores[id]) {
      studentScores[id] = {
        student: r.student,
        scores: []
      };
    }
    studentScores[id].scores.push(r.score.percentage);
  });

  return Object.values(studentScores)
    .map(data => ({
      name: data.student.name,
      rollNumber: data.student.rollNumber,
      department: data.student.department,
      averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      attempts: data.scores.length
    }))
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, limit);
};

const getSystemHealth = async () => {
  const last24h = new Date();
  last24h.setHours(last24h.getHours() - 24);

  return {
    activeUsers24h: await User.countDocuments({ lastLogin: { $gte: last24h } }),
    assessmentsCreated24h: await Assessment.countDocuments({ createdAt: { $gte: last24h } }),
    resultsSubmitted24h: await Result.countDocuments({ submittedAt: { $gte: last24h } }),
    status: 'healthy'
  };
};
