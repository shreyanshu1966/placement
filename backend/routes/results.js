const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Assignment = require('../models/Assignment');
const ContextAnalyzer = require('../services/ContextAnalyzer');
const axios = require('axios');

// Submit assignment answers and calculate results with automatic context update
router.post('/', async (req, res) => {
  try {
    const { assignmentId, studentId, answers, timeSpent } = req.body;
    
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Calculate score and topic-wise performance
    let correctAnswers = 0;
    const topicScores = {};
    const processedAnswers = [];
    const questionUpdates = []; // For updating question bank performance
    
    answers.forEach((answer, index) => {
      const question = assignment.questionsGenerated[index];
      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      
      if (isCorrect) correctAnswers++;
      
      // Track topic-wise performance
      const topic = question.topic;
      if (!topicScores[topic]) {
        topicScores[topic] = { correct: 0, total: 0 };
      }
      topicScores[topic].total++;
      if (isCorrect) topicScores[topic].correct++;
      
      processedAnswers.push({
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        topic
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
    
    // Format topic-wise scores
    const topicWiseScore = Object.entries(topicScores).map(([topic, scores]) => ({
      topic,
      correct: scores.correct,
      total: scores.total,
      percentage: Math.round((scores.correct / scores.total) * 100)
    }));
    
    // Create result
    const result = new Result({
      assignmentId,
      studentId,
      answers: processedAnswers,
      score,
      totalQuestions: assignment.questionsGenerated.length,
      topicWiseScore,
      timeSpent
    });
    
    await result.save();
    
    // Update assignment status
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'completed' });
    
    // Automatically analyze and update student context
    try {
      await ContextAnalyzer.analyzeAndUpdateContext(studentId, { topicWiseScore });
      console.log(`Context automatically updated for student ${studentId}`);
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

module.exports = router;