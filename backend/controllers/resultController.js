import Result from '../models/Result.js';
import Assessment from '../models/Assessment.js';
import User from '../models/User.js';

/**
 * @desc    Get all results
 * @route   GET /api/results
 * @access  Private/Faculty/Admin
 */
export const getResults = async (req, res, next) => {
  try {
    const {
      assessment,
      student,
      status,
      minScore,
      maxScore,
      passed,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};
    if (assessment) query.assessment = assessment;
    if (student) query.student = student;
    if (status) query.status = status;
    if (passed !== undefined) query.isPassed = passed === 'true';
    if (minScore || maxScore) {
      query['score.percentage'] = {};
      if (minScore) query['score.percentage'].$gte = parseFloat(minScore);
      if (maxScore) query['score.percentage'].$lte = parseFloat(maxScore);
    }

    const skip = (page - 1) * limit;
    const total = await Result.countDocuments(query);

    const results = await Result.find(query)
      .populate('student', 'name email rollNumber department')
      .populate('assessment', 'title type course')
      .populate({
        path: 'assessment',
        populate: {
          path: 'course',
          select: 'title code'
        }
      })
      .sort({ submittedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      count: results.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get result by ID
 * @route   GET /api/results/:id
 * @access  Private
 */
export const getResultById = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('student', 'name email rollNumber department')
      .populate({
        path: 'assessment',
        populate: [
          { path: 'course', select: 'title code' },
          { path: 'questions.question' }
        ]
      });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'faculty' &&
      result.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this result'
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in user's results
 * @route   GET /api/results/my-results
 * @access  Private
 */
export const getMyResults = async (req, res, next) => {
  try {
    const {
      assessment,
      course,
      status,
      passed,
      page = 1,
      limit = 20
    } = req.query;

    const query = { student: req.user._id };
    if (assessment) query.assessment = assessment;
    if (status) query.status = status;
    if (passed !== undefined) query.isPassed = passed === 'true';

    const skip = (page - 1) * limit;
    const total = await Result.countDocuments(query);

    let results = await Result.find(query)
      .populate('assessment', 'title type course config')
      .populate({
        path: 'assessment',
        populate: {
          path: 'course',
          select: 'title code'
        }
      })
      .sort({ submittedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Filter by course if provided
    if (course) {
      results = results.filter(r => 
        r.assessment?.course?._id.toString() === course
      );
    }

    // Calculate statistics
    const stats = {
      totalAttempts: total,
      passed: await Result.countDocuments({ ...query, isPassed: true }),
      failed: await Result.countDocuments({ ...query, isPassed: false }),
      inProgress: await Result.countDocuments({ ...query, status: 'in-progress' })
    };

    // Calculate average score
    const completedResults = await Result.find({
      ...query,
      status: 'completed'
    });
    const avgScore = completedResults.length > 0
      ? completedResults.reduce((sum, r) => sum + r.score.percentage, 0) / completedResults.length
      : 0;
    stats.averageScore = Math.round(avgScore);

    res.status(200).json({
      success: true,
      count: results.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      stats,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Review and update answer feedback
 * @route   PUT /api/results/:id/review
 * @access  Private/Faculty/Admin
 */
export const reviewAnswer = async (req, res, next) => {
  try {
    const { questionId, feedback, isCorrect, marksObtained } = req.body;

    const result = await Result.findById(req.params.id)
      .populate('assessment');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Find the answer to review
    const answer = result.answers.find(
      a => a.question.toString() === questionId
    );

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Update answer
    if (feedback !== undefined) answer.feedback = feedback;
    if (isCorrect !== undefined) answer.isCorrect = isCorrect;
    if (marksObtained !== undefined) answer.marksObtained = marksObtained;
    answer.isReviewed = true;

    // Recalculate score
    const totalMarks = result.answers.reduce((sum, a) => sum + a.marksObtained, 0);
    result.score.obtained = totalMarks;
    result.score.percentage = Math.round((totalMarks / result.score.total) * 100);
    result.isPassed = totalMarks >= result.assessment.config.passingMarks;

    result.correctAnswers = result.answers.filter(a => a.isCorrect).length;
    result.incorrectAnswers = result.answers.filter(a => !a.isCorrect && a.submittedAnswer).length;

    await result.save();

    res.status(200).json({
      success: true,
      message: 'Answer reviewed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate detailed performance report
 * @route   GET /api/results/:id/report
 * @access  Private
 */
export const generatePerformanceReport = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('student', 'name email rollNumber department batch')
      .populate({
        path: 'assessment',
        populate: [
          { path: 'course', select: 'title code' },
          { path: 'questions.question' }
        ]
      });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'faculty' &&
      result.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report'
      });
    }

    // Generate comprehensive report
    const report = {
      basicInfo: {
        studentName: result.student.name,
        rollNumber: result.student.rollNumber,
        department: result.student.department,
        batch: result.student.batch,
        assessmentTitle: result.assessment.title,
        assessmentType: result.assessment.type,
        courseName: result.assessment.course?.title,
        courseCode: result.assessment.course?.code,
        attemptNumber: result.attemptNumber
      },
      scoreInfo: {
        obtained: result.score.obtained,
        total: result.score.total,
        percentage: result.score.percentage,
        grade: calculateGrade(result.score.percentage),
        isPassed: result.isPassed,
        passingMarks: result.assessment.config.passingMarks
      },
      timeInfo: {
        startTime: result.startTime,
        endTime: result.endTime,
        timeTaken: result.timeTaken,
        timeTakenFormatted: formatTime(result.timeTaken),
        allowedDuration: result.assessment.config.duration,
        averageTimePerQuestion: Math.round(result.timeTaken / result.answers.length)
      },
      answerStats: {
        total: result.assessment.questions.length,
        correct: result.correctAnswers,
        incorrect: result.incorrectAnswers,
        unanswered: result.unanswered,
        flagged: result.answers.filter(a => a.isFlagged).length,
        accuracy: Math.round((result.correctAnswers / result.answers.length) * 100)
      },
      topicPerformance: result.topicPerformance.map(tp => ({
        topic: tp.topic,
        attempted: tp.attempted,
        correct: tp.correct,
        accuracy: tp.accuracy,
        averageTime: tp.averageTime,
        status: tp.accuracy >= 70 ? 'strong' : tp.accuracy >= 50 ? 'average' : 'weak'
      })),
      difficultyPerformance: ['easy', 'medium', 'hard'].map(difficulty => {
        const dp = result.difficultyPerformance[difficulty];
        return {
          difficulty,
          attempted: dp.attempted || 0,
          correct: dp.correct || 0,
          accuracy: dp.accuracy || 0,
          status: (dp.accuracy || 0) >= 70 ? 'strong' : (dp.accuracy || 0) >= 50 ? 'average' : 'weak'
        };
      }),
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      recommendations: generateRecommendations(result),
      comparisonWithPeers: await getComparisonStats(result)
    };

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate grade
const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

// Helper function to format time
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

// Helper function to generate recommendations
const generateRecommendations = (result) => {
  const recommendations = [];

  // Based on score
  if (result.score.percentage < 50) {
    recommendations.push({
      category: 'Overall Performance',
      message: 'Your score is below 50%. Consider revising fundamental concepts and practicing more.',
      priority: 'high'
    });
  } else if (result.score.percentage < 70) {
    recommendations.push({
      category: 'Overall Performance',
      message: 'Good effort! Focus on weak areas to improve your score further.',
      priority: 'medium'
    });
  } else {
    recommendations.push({
      category: 'Overall Performance',
      message: 'Great performance! Continue practicing to maintain your level.',
      priority: 'low'
    });
  }

  // Based on weak topics
  result.weaknesses.forEach(weakness => {
    recommendations.push({
      category: 'Weak Areas',
      message: `Focus on improving "${weakness}" - your accuracy is below 50% in this area.`,
      priority: 'high'
    });
  });

  // Based on time management
  const avgTimePerQ = result.timeTaken / result.answers.length;
  const idealTime = (result.assessment.config.duration * 60) / result.assessment.questions.length;
  
  if (avgTimePerQ > idealTime * 1.5) {
    recommendations.push({
      category: 'Time Management',
      message: 'You spent more time than average per question. Practice time-bound tests to improve speed.',
      priority: 'medium'
    });
  }

  // Based on unanswered questions
  if (result.unanswered > result.assessment.questions.length * 0.1) {
    recommendations.push({
      category: 'Completion',
      message: 'You left several questions unanswered. Work on completing all questions within time.',
      priority: 'high'
    });
  }

  // Based on difficulty performance
  const hardDifficulty = result.difficultyPerformance?.hard;
  if (hardDifficulty && hardDifficulty.accuracy < 40) {
    recommendations.push({
      category: 'Challenge Level',
      message: 'Your performance on hard questions needs improvement. Practice advanced problems.',
      priority: 'medium'
    });
  }

  return recommendations;
};

// Helper function to get comparison with peers
const getComparisonStats = async (result) => {
  try {
    // Get all results for the same assessment
    const allResults = await Result.find({
      assessment: result.assessment._id,
      status: 'completed'
    }).select('score.percentage');

    if (allResults.length < 2) {
      return {
        available: false,
        message: 'Not enough data for comparison'
      };
    }

    const scores = allResults.map(r => r.score.percentage);
    const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const sorted = scores.sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    // Calculate percentile
    const rank = scores.filter(s => s < result.score.percentage).length;
    const percentile = Math.round((rank / scores.length) * 100);

    return {
      available: true,
      totalStudents: allResults.length,
      yourScore: result.score.percentage,
      average: Math.round(average),
      median: Math.round(median),
      highest,
      lowest,
      percentile,
      betterThan: `${percentile}% of students`,
      standing: percentile >= 75 ? 'Top 25%' : 
                percentile >= 50 ? 'Above Average' : 
                percentile >= 25 ? 'Below Average' : 'Bottom 25%'
    };
  } catch (error) {
    return {
      available: false,
      message: 'Could not fetch comparison data'
    };
  }
};
