const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Assignment = require('../models/Assignment');
const ContextAnalyzer = require('../services/ContextAnalyzer');
const axios = require('axios');

// Advanced analytics calculations helper
const calculateAdvancedAnalytics = async (studentId, topicWiseScore, assignment) => {
  try {
    // Calculate strengths and weaknesses
    const strengths = [];
    const weaknesses = [];
    const improvementAreas = [];

    topicWiseScore.forEach(topic => {
      if (topic.percentage >= 80) {
        strengths.push(topic.topic);
      } else if (topic.percentage < 60) {
        weaknesses.push(topic.topic);
        improvementAreas.push({
          topic: topic.topic,
          currentScore: topic.percentage,
          targetScore: 80,
          suggestion: `Practice more ${topic.topic} questions. Current: ${topic.percentage}%, Target: 80%`
        });
      }
    });

    // Generate recommendations
    const recommendations = [];
    if (weaknesses.length > 0) {
      recommendations.push(`Focus on improving ${weaknesses.slice(0, 2).join(' and ')}`);
    }
    if (strengths.length > 0) {
      recommendations.push(`Continue practicing ${strengths[0]} to maintain strong performance`);
    }

    return {
      strengths,
      weaknesses,
      recommendations,
      improvementAreas
    };
  } catch (error) {
    console.error('Error calculating advanced analytics:', error);
    return {
      strengths: [],
      weaknesses: [],
      recommendations: [],
      improvementAreas: []
    };
  }
};

// Calculate performance metrics (rank, percentile, etc.)
const calculatePerformanceMetrics = async (assignmentId, currentScore) => {
  try {
    const allResults = await Result.find({ assignmentId }).select('score');
    const scores = allResults.map(r => r.score).sort((a, b) => b - a);
    
    if (scores.length === 0) return null;

    const rank = scores.findIndex(score => score <= currentScore) + 1;
    const percentile = Math.round(((scores.length - rank + 1) / scores.length) * 100);
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    const medianScore = scores.length % 2 === 0 
      ? Math.round((scores[Math.floor(scores.length / 2)] + scores[Math.ceil(scores.length / 2)]) / 2)
      : scores[Math.floor(scores.length / 2)];
    
    // Calculate standard deviation
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length;
    const standardDeviation = Math.round(Math.sqrt(variance));

    return {
      rank,
      percentile,
      averageScore,
      medianScore,
      standardDeviation
    };
  } catch (error) {
    console.error('Error calculating performance metrics:', error);
    return null;
  }
};

// Submit assignment answers and calculate results with comprehensive analytics
router.post('/', async (req, res) => {
  try {
    const { 
      assignmentId, 
      studentId, 
      answers, 
      timeSpent, 
      startedAt,
      metadata = {} 
    } = req.body;
    
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Calculate comprehensive scores and analytics
    let correctAnswers = 0;
    const topicScores = {};
    const difficultyScores = {};
    const processedAnswers = [];
    const questionUpdates = [];
    
    answers.forEach((answer, index) => {
      const question = assignment.questionsGenerated[index];
      if (!question) return;
      
      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      const difficulty = question.difficulty || 'medium';
      const topic = question.topic;
      
      if (isCorrect) correctAnswers++;
      
      // Track topic-wise performance with enhanced metrics
      if (!topicScores[topic]) {
        topicScores[topic] = { 
          correct: 0, 
          total: 0, 
          totalTime: 0, 
          difficulty: difficulty 
        };
      }
      topicScores[topic].total++;
      topicScores[topic].totalTime += (answer.timeSpent || 0);
      if (isCorrect) topicScores[topic].correct++;
      
      // Track difficulty-wise performance
      if (!difficultyScores[difficulty]) {
        difficultyScores[difficulty] = { correct: 0, total: 0 };
      }
      difficultyScores[difficulty].total++;
      if (isCorrect) difficultyScores[difficulty].correct++;
      
      processedAnswers.push({
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        topic,
        difficulty,
        timeSpent: answer.timeSpent || 0,
        attempts: answer.attempts || 1
      });

      // Prepare question bank update
      if (question.questionId) {
        questionUpdates.push({
          questionId: question.questionId,
          wasCorrect: isCorrect
        });
      }
    });
    
    const score = Math.round((correctAnswers / assignment.questionsGenerated.length) * 100);
    
    // Format enhanced topic-wise scores
    const topicWiseScore = Object.entries(topicScores).map(([topic, scores]) => ({
      topic,
      correct: scores.correct,
      total: scores.total,
      percentage: Math.round((scores.correct / scores.total) * 100),
      difficulty: scores.difficulty,
      averageTimePerQuestion: scores.total > 0 ? Math.round(scores.totalTime / scores.total) : 0
    }));
    
    // Format difficulty-wise scores
    const difficultyWiseScore = Object.entries(difficultyScores).map(([difficulty, scores]) => ({
      difficulty,
      correct: scores.correct,
      total: scores.total,
      percentage: Math.round((scores.correct / scores.total) * 100)
    }));
    
    // Calculate performance metrics
    const performance = await calculatePerformanceMetrics(assignmentId, score);
    
    // Calculate advanced analytics
    const analytics = await calculateAdvancedAnalytics(studentId, topicWiseScore, assignment);
    
    // Create comprehensive result
    const result = new Result({
      assignmentId,
      studentId,
      answers: processedAnswers,
      score,
      totalQuestions: assignment.questionsGenerated.length,
      topicWiseScore,
      difficultyWiseScore,
      timeSpent: timeSpent || 0,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      performance,
      analytics,
      metadata
    });
    
    await result.save();
    
    // Update assignment status
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'completed' });
    
    // Update student context with enhanced data
    try {
      await ContextAnalyzer.analyzeAndUpdateContext(studentId, { 
        topicWiseScore,
        difficultyWiseScore,
        analytics 
      });
      console.log(`Enhanced context updated for student ${studentId}`);
    } catch (contextError) {
      console.error('Error updating context:', contextError.message);
    }

    // Update question bank performance
    try {
      if (questionUpdates.length > 0) {
        await axios.post('http://localhost:5000/api/question-bank/update-performance', {
          questionUpdates
        });
      }
    } catch (qbError) {
      console.error('Error updating question bank performance:', qbError.message);
    }
    
    await result.populate('assignmentId');
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get results for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.params.studentId })
      .populate({
        path: 'assignmentId',
        populate: {
          path: 'courseId'
        }
      })
      .sort({ completedAt: -1 });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get result by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate({
        path: 'assignmentId',
        populate: {
          path: 'courseId'
        }
      });
    
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get analytics for a student
router.get('/analytics/:studentId', async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.params.studentId })
      .populate('assignmentId')
      .sort({ completedAt: -1 });
    
    if (!results.length) {
      return res.json({
        averageScore: 0,
        totalTests: 0,
        strongTopics: [],
        weakTopics: [],
        progressTrend: [],
        improvement: null,
        nextRecommendation: null
      });
    }
    
    // Calculate analytics
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const totalTests = results.length;
    
    // Aggregate topic performance
    const topicPerformance = {};
    results.forEach(result => {
      result.topicWiseScore.forEach(topic => {
        if (!topicPerformance[topic.topic]) {
          topicPerformance[topic.topic] = { total: 0, scores: [] };
        }
        topicPerformance[topic.topic].total++;
        topicPerformance[topic.topic].scores.push(topic.percentage);
      });
    });
    
    // Calculate average performance per topic
    const topicAverages = Object.entries(topicPerformance).map(([topic, data]) => ({
      topic,
      averageScore: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length,
      trend: calculateTopicTrend(data.scores)
    }));
    
    const strongTopics = topicAverages
      .filter(t => t.averageScore >= 70)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);
    
    const weakTopics = topicAverages
      .filter(t => t.averageScore < 60)
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 5);
    
    // Progress trend (last 10 tests)
    const progressTrend = results.slice(0, 10).reverse().map(result => ({
      date: result.completedAt,
      score: result.score,
      testName: result.assignmentId.title
    }));

    // Calculate improvement rate
    const recentTests = results.slice(0, 5);
    const olderTests = results.slice(5, 10);
    let improvement = null;
    
    if (recentTests.length >= 3 && olderTests.length >= 3) {
      const recentAvg = recentTests.reduce((sum, r) => sum + r.score, 0) / recentTests.length;
      const olderAvg = olderTests.reduce((sum, r) => sum + r.score, 0) / olderTests.length;
      improvement = recentAvg - olderAvg;
    }

    // Get next test recommendation
    const recommendation = await ContextAnalyzer.getTestRecommendation(req.params.studentId);
    
    res.json({
      averageScore: Math.round(averageScore),
      totalTests,
      strongTopics,
      weakTopics,
      progressTrend,
      improvement: improvement ? Math.round(improvement) : null,
      nextRecommendation: recommendation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get batch analytics for faculty
router.get('/batch/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Get all results for this course
    const results = await Result.find()
      .populate({
        path: 'assignmentId',
        match: { courseId: courseId },
        populate: { path: 'courseId' }
      })
      .where('assignmentId').ne(null);

    if (!results.length) {
      return res.json({
        totalStudents: 0,
        averageScore: 0,
        totalTests: 0,
        topicPerformance: [],
        studentPerformance: [],
        weakestTopics: [],
        strongestTopics: []
      });
    }

    // Analyze batch performance
    const studentScores = {};
    const topicPerformance = {};
    
    results.forEach(result => {
      // Student performance
      if (!studentScores[result.studentId]) {
        studentScores[result.studentId] = [];
      }
      studentScores[result.studentId].push(result.score);
      
      // Topic performance
      result.topicWiseScore.forEach(topic => {
        if (!topicPerformance[topic.topic]) {
          topicPerformance[topic.topic] = [];
        }
        topicPerformance[topic.topic].push(topic.percentage);
      });
    });

    // Calculate student averages
    const studentPerformance = Object.entries(studentScores).map(([studentId, scores]) => ({
      studentId,
      averageScore: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
      totalTests: scores.length,
      trend: calculateStudentTrend(scores)
    }));

    // Calculate topic averages
    const topicAverages = Object.entries(topicPerformance).map(([topic, scores]) => ({
      topic,
      averageScore: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
      totalAttempts: scores.length,
      difficulty: scores.reduce((sum, score) => sum + score, 0) / scores.length < 60 ? 'challenging' : 'manageable'
    }));

    const batchAverage = Math.round(
      results.reduce((sum, r) => sum + r.score, 0) / results.length
    );

    res.json({
      totalStudents: Object.keys(studentScores).length,
      averageScore: batchAverage,
      totalTests: results.length,
      topicPerformance: topicAverages.sort((a, b) => a.averageScore - b.averageScore),
      studentPerformance: studentPerformance.sort((a, b) => b.averageScore - a.averageScore),
      weakestTopics: topicAverages.filter(t => t.averageScore < 60).slice(0, 5),
      strongestTopics: topicAverages.filter(t => t.averageScore >= 70).slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper functions
function calculateTopicTrend(scores) {
  if (scores.length < 3) return 'insufficient_data';
  
  const recent = scores.slice(-3);
  const older = scores.slice(0, -3);
  
  if (older.length === 0) return 'insufficient_data';
  
  const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
  const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;
  
  const diff = recentAvg - olderAvg;
  
  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}

function calculateStudentTrend(scores) {
  if (scores.length < 3) return 'new';
  
  const recent = scores.slice(-3);
  const older = scores.slice(0, -3);
  
  if (older.length === 0) return 'new';
  
  const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
  const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;
  
  const diff = recentAvg - olderAvg;
  
  if (diff > 10) return 'improving';
  if (diff < -10) return 'declining';
  return 'stable';
}

// Advanced Analytics Endpoints

// Get comprehensive student dashboard analytics
router.get('/dashboard/:studentId', async (req, res) => {
  try {
    const { timeframe = 'all' } = req.query;
    let dateFilter = {};
    
    // Apply timeframe filter
    if (timeframe !== 'all') {
      const now = new Date();
      switch (timeframe) {
        case 'week':
          dateFilter.completedAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
          break;
        case 'month':
          dateFilter.completedAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
          break;
        case 'quarter':
          dateFilter.completedAt = { $gte: new Date(now.setMonth(now.getMonth() - 3)) };
          break;
      }
    }
    
    const results = await Result.find({ 
      studentId: req.params.studentId,
      ...dateFilter 
    })
    .populate({
      path: 'assignmentId',
      populate: { path: 'courseId' }
    })
    .sort({ completedAt: -1 });
    
    if (!results.length) {
      return res.json({
        overview: { totalTests: 0, averageScore: 0, totalTimeSpent: 0 },
        performance: { trend: 'new', rank: null, percentile: null },
        topics: { strengths: [], weaknesses: [], progress: [] },
        recommendations: [],
        charts: { scoreProgress: [], topicPerformance: [], timeAnalysis: [] }
      });
    }

    // Calculate overview metrics
    const totalTests = results.length;
    const averageScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / totalTests);
    const totalTimeSpent = results.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
    
    // Performance analysis
    const scores = results.map(r => r.score);
    const latestPerformance = results[0].performance || {};
    
    // Topic analysis with enhanced metrics
    const topicData = {};
    results.forEach(result => {
      result.topicWiseScore.forEach(topic => {
        if (!topicData[topic.topic]) {
          topicData[topic.topic] = {
            scores: [],
            totalQuestions: 0,
            correctAnswers: 0,
            totalTime: 0,
            tests: 0
          };
        }
        topicData[topic.topic].scores.push(topic.percentage);
        topicData[topic.topic].totalQuestions += topic.total;
        topicData[topic.topic].correctAnswers += topic.correct;
        topicData[topic.topic].totalTime += topic.averageTimePerQuestion * topic.total;
        topicData[topic.topic].tests++;
      });
    });

    const topicAnalysis = Object.entries(topicData).map(([topic, data]) => {
      const averageScore = Math.round(data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length);
      const accuracy = Math.round((data.correctAnswers / data.totalQuestions) * 100);
      const averageTime = Math.round(data.totalTime / data.totalQuestions);
      const trend = calculateTopicTrend(data.scores);
      
      return {
        topic,
        averageScore,
        accuracy,
        averageTime,
        trend,
        testsCount: data.tests,
        totalQuestions: data.totalQuestions
      };
    });

    const strengths = topicAnalysis
      .filter(t => t.averageScore >= 75)
      .sort((a, b) => b.averageScore - a.averageScore);
    
    const weaknesses = topicAnalysis
      .filter(t => t.averageScore < 60)
      .sort((a, b) => a.averageScore - b.averageScore);

    // Chart data
    const scoreProgress = results.reverse().map((result, index) => ({
      test: index + 1,
      score: result.score,
      date: result.completedAt,
      title: result.assignmentId.title,
      timeSpent: Math.round(result.timeSpent / 60),
      rank: result.performance?.rank || null
    }));

    const topicPerformance = topicAnalysis.map(topic => ({
      topic: topic.topic,
      score: topic.averageScore,
      accuracy: topic.accuracy,
      tests: topic.testsCount
    }));

    const timeAnalysis = results.map(result => ({
      date: result.completedAt,
      duration: Math.round(result.timeSpent / 60),
      score: result.score,
      efficiency: result.score / Math.max(result.timeSpent / 60, 1) // score per minute
    }));

    // Generate recommendations
    const recommendations = [];
    if (weaknesses.length > 0) {
      recommendations.push({
        type: 'improvement',
        priority: 'high',
        message: `Focus on ${weaknesses[0].topic} - current score: ${weaknesses[0].averageScore}%`,
        action: 'practice'
      });
    }
    
    if (averageScore < 70) {
      recommendations.push({
        type: 'general',
        priority: 'medium',
        message: 'Consider taking more practice tests to improve overall performance',
        action: 'practice_more'
      });
    }

    res.json({
      overview: {
        totalTests,
        averageScore,
        totalTimeSpent: Math.round(totalTimeSpent / 60), // in minutes
        accuracy: Math.round(averageScore)
      },
      performance: {
        trend: calculateTopicTrend(scores.slice().reverse()),
        rank: latestPerformance.rank,
        percentile: latestPerformance.percentile,
        currentScore: scores[0],
        bestScore: Math.max(...scores),
        worstScore: Math.min(...scores)
      },
      topics: {
        strengths: strengths.slice(0, 5),
        weaknesses: weaknesses.slice(0, 5),
        all: topicAnalysis
      },
      recommendations,
      charts: {
        scoreProgress,
        topicPerformance,
        timeAnalysis
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get comparative analytics (compare with peers)
router.get('/compare/:studentId/:assignmentId', async (req, res) => {
  try {
    const { studentId, assignmentId } = req.params;
    
    // Get student's result
    const studentResult = await Result.findOne({ 
      studentId, 
      assignmentId 
    }).populate('assignmentId');
    
    if (!studentResult) {
      return res.status(404).json({ message: 'Student result not found' });
    }
    
    // Get all results for this assignment
    const allResults = await Result.find({ assignmentId })
      .select('score timeSpent topicWiseScore difficultyWiseScore')
      .sort({ score: -1 });
    
    if (allResults.length === 0) {
      return res.json({ message: 'No comparative data available' });
    }

    // Calculate comparative metrics
    const scores = allResults.map(r => r.score);
    const timeSpents = allResults.map(r => r.timeSpent).filter(t => t > 0);
    
    const studentRank = scores.findIndex(score => score === studentResult.score) + 1;
    const percentile = Math.round(((allResults.length - studentRank + 1) / allResults.length) * 100);
    
    // Topic-wise comparison
    const topicComparison = {};
    allResults.forEach(result => {
      result.topicWiseScore.forEach(topic => {
        if (!topicComparison[topic.topic]) {
          topicComparison[topic.topic] = [];
        }
        topicComparison[topic.topic].push(topic.percentage);
      });
    });

    const topicStats = Object.entries(topicComparison).map(([topic, scores]) => {
      const avgScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
      const studentTopicScore = studentResult.topicWiseScore.find(t => t.topic === topic)?.percentage || 0;
      
      return {
        topic,
        studentScore: studentTopicScore,
        averageScore: avgScore,
        difference: studentTopicScore - avgScore,
        rank: scores.sort((a, b) => b - a).findIndex(s => s === studentTopicScore) + 1,
        totalStudents: scores.length
      };
    });

    res.json({
      student: {
        score: studentResult.score,
        timeSpent: studentResult.timeSpent,
        rank: studentRank,
        percentile
      },
      class: {
        totalStudents: allResults.length,
        averageScore: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length),
        highestScore: Math.max(...scores),
        lowestScore: Math.min(...scores),
        averageTime: timeSpents.length > 0 ? Math.round(timeSpents.reduce((sum, t) => sum + t, 0) / timeSpents.length) : 0
      },
      topicComparison: topicStats,
      distribution: {
        scoreRanges: [
          { range: '90-100', count: scores.filter(s => s >= 90).length },
          { range: '80-89', count: scores.filter(s => s >= 80 && s < 90).length },
          { range: '70-79', count: scores.filter(s => s >= 70 && s < 80).length },
          { range: '60-69', count: scores.filter(s => s >= 60 && s < 70).length },
          { range: '0-59', count: scores.filter(s => s < 60).length }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get detailed question analysis
router.get('/question-analysis/:resultId', async (req, res) => {
  try {
    const result = await Result.findById(req.params.resultId)
      .populate({
        path: 'assignmentId',
        select: 'questionsGenerated title'
      });
    
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    const questionAnalysis = result.answers.map((answer, index) => {
      const question = result.assignmentId.questionsGenerated[index];
      
      return {
        questionIndex: index + 1,
        question: question?.question || 'Question not available',
        topic: answer.topic,
        difficulty: answer.difficulty,
        studentAnswer: question?.options?.[answer.selectedAnswer] || 'No answer',
        correctAnswer: question?.options?.[answer.correctAnswer] || 'No answer',
        isCorrect: answer.isCorrect,
        timeSpent: answer.timeSpent,
        explanation: question?.explanation || 'No explanation available'
      };
    });

    const summary = {
      totalQuestions: result.answers.length,
      correctAnswers: result.answers.filter(a => a.isCorrect).length,
      score: result.score,
      timeSpent: result.timeSpent,
      averageTimePerQuestion: Math.round(result.timeSpent / result.answers.length)
    };

    res.json({
      summary,
      questions: questionAnalysis,
      topicBreakdown: result.topicWiseScore,
      difficultyBreakdown: result.difficultyWiseScore
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get learning path recommendations
router.get('/learning-path/:studentId', async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.params.studentId })
      .populate('assignmentId')
      .sort({ completedAt: -1 })
      .limit(20);

    if (!results.length) {
      return res.json({
        currentLevel: 'beginner',
        recommendations: [
          { type: 'start', message: 'Take your first assessment to get personalized recommendations' }
        ]
      });
    }

    // Analyze learning patterns
    const recentResults = results.slice(0, 5);
    const averageScore = recentResults.reduce((sum, r) => sum + r.score, 0) / recentResults.length;
    
    let currentLevel = 'beginner';
    if (averageScore >= 80) currentLevel = 'advanced';
    else if (averageScore >= 60) currentLevel = 'intermediate';

    // Generate learning path
    const weakTopics = [];
    const topicData = {};
    
    results.forEach(result => {
      result.topicWiseScore.forEach(topic => {
        if (!topicData[topic.topic]) {
          topicData[topic.topic] = [];
        }
        topicData[topic.topic].push(topic.percentage);
      });
    });

    Object.entries(topicData).forEach(([topic, scores]) => {
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      if (avgScore < 70) {
        weakTopics.push({
          topic,
          averageScore: Math.round(avgScore),
          priority: avgScore < 50 ? 'high' : 'medium'
        });
      }
    });

    const recommendations = weakTopics
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 3)
      .map(topic => ({
        type: 'study',
        topic: topic.topic,
        priority: topic.priority,
        currentScore: topic.averageScore,
        targetScore: 80,
        message: `Focus on ${topic.topic} concepts - improve from ${topic.averageScore}% to 80%`,
        estimatedTime: '2-3 hours'
      }));

    res.json({
      currentLevel,
      averageScore: Math.round(averageScore),
      weakAreas: weakTopics,
      recommendations,
      nextSteps: recommendations.length > 0 
        ? `Start with ${recommendations[0].topic} as it needs the most improvement`
        : 'Continue practicing to maintain your performance'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;