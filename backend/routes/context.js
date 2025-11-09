const express = require('express');
const router = express.Router();
const Context = require('../models/Context');

// Create or update student context
router.post('/', async (req, res) => {
  try {
    const { studentId } = req.body;
    
    let context = await Context.findOne({ studentId });
    
    if (context) {
      // Update existing context
      Object.assign(context, req.body);
      context.lastUpdated = new Date();
    } else {
      // Create new context
      context = new Context(req.body);
    }
    
    await context.save();
    res.json(context);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get student context
router.get('/:studentId', async (req, res) => {
  try {
    let context = await Context.findOne({ studentId: req.params.studentId });
    
    if (!context) {
      // Create default context if not exists
      context = new Context({
        studentId: req.params.studentId,
        strengths: [],
        weaknesses: [],
        performanceHistory: [],
        learningStyle: 'visual'
      });
      await context.save();
    }
    
    res.json(context);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update performance after test
router.post('/:studentId/performance', async (req, res) => {
  try {
    const { topic, score } = req.body;
    const context = await Context.findOne({ studentId: req.params.studentId });
    
    if (!context) {
      return res.status(404).json({ message: 'Context not found' });
    }
    
    // Add performance record
    context.performanceHistory.push({
      topic,
      score,
      date: new Date()
    });
    
    // Update strengths and weaknesses based on score
    if (score >= 70) {
      if (!context.strengths.includes(topic)) {
        context.strengths.push(topic);
      }
      context.weaknesses = context.weaknesses.filter(w => w !== topic);
    } else if (score < 50) {
      if (!context.weaknesses.includes(topic)) {
        context.weaknesses.push(topic);
      }
      context.strengths = context.strengths.filter(s => s !== topic);
    }
    
    context.lastUpdated = new Date();
    await context.save();
    
    res.json(context);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get study recommendations for student and course
router.get('/:studentId/recommendation/:courseId', async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    
    let context = await Context.findOne({ studentId });
    
    if (!context) {
      // Create default context and return basic recommendation
      context = new Context({
        studentId,
        strengths: [],
        weaknesses: [],
        performanceHistory: [],
        learningStyle: 'visual'
      });
      await context.save();
      
      return res.json({
        success: true,
        data: {
          recommendedTopics: ['Arrays', 'Linked Lists'],
          studyPlan: 'Start with basic data structures',
          difficulty: 'easy',
          weakTopics: [],
          strongTopics: []
        }
      });
    }
    
    // Generate recommendations based on context
    const weakTopics = context.weaknesses || [];
    const strongTopics = context.strengths || [];
    
    // Recommend topics to focus on
    let recommendedTopics = [];
    if (weakTopics.length > 0) {
      recommendedTopics = weakTopics.slice(0, 3); // Focus on 3 weak topics
    } else {
      recommendedTopics = ['Arrays', 'Linked Lists', 'Trees']; // Default topics
    }
    
    // Generate study plan
    let studyPlan = '';
    if (weakTopics.length > 0) {
      studyPlan = `Focus on improving: ${weakTopics.join(', ')}`;
    } else {
      studyPlan = 'Continue practicing fundamental concepts';
    }
    
    // Recommend difficulty based on performance
    const avgScore = context.performanceHistory.length > 0 
      ? context.performanceHistory.reduce((sum, p) => sum + p.score, 0) / context.performanceHistory.length
      : 60; // Default average
      
    let difficulty = 'medium';
    if (avgScore < 50) difficulty = 'easy';
    else if (avgScore > 80) difficulty = 'hard';
    
    res.json({
      success: true,
      data: {
        recommendedTopics,
        studyPlan,
        difficulty,
        weakTopics,
        strongTopics,
        averageScore: avgScore,
        totalAttempts: context.performanceHistory.length
      }
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;