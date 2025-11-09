const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const Course = require('../models/Course');
const axios = require('axios');

// Generate and store questions in the bank for specific topics
router.post('/generate-bank', async (req, res) => {
  try {
    const { courseId, topics, questionsPerTopic = 10, faculty } = req.body;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const generatedQuestions = [];
    
    for (const topicName of topics) {
      const syllabusItem = course.syllabus.find(s => s.topic === topicName);
      const difficulty = syllabusItem ? syllabusItem.difficulty : 'medium';
      
      try {
        // Generate questions using AI
        const response = await axios.post('http://localhost:5000/api/questions/generate', {
          topic: topicName,
          difficulty,
          count: questionsPerTopic,
          subtopics: syllabusItem ? syllabusItem.subtopics : []
        });

        // Store each question in the bank
        for (const question of response.data.questions) {
          const bankQuestion = new QuestionBank({
            courseId,
            topic: topicName,
            subtopic: question.subtopic || '',
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            difficulty: question.difficulty,
            createdBy: faculty || 'system',
            tags: [topicName, difficulty]
          });
          
          await bankQuestion.save();
          generatedQuestions.push(bankQuestion);
        }
      } catch (error) {
        console.error(`Error generating questions for ${topicName}:`, error.message);
        // Create fallback questions
        for (let i = 0; i < questionsPerTopic; i++) {
          const bankQuestion = new QuestionBank({
            courseId,
            topic: topicName,
            question: `Sample question ${i + 1} about ${topicName}`,
            options: [
              `Option A for ${topicName}`,
              `Option B for ${topicName}`,
              `Option C for ${topicName}`,
              `Option D for ${topicName}`
            ],
            correctAnswer: Math.floor(Math.random() * 4),
            difficulty,
            createdBy: faculty || 'system',
            tags: [topicName, difficulty]
          });
          
          await bankQuestion.save();
          generatedQuestions.push(bankQuestion);
        }
      }
    }

    res.json({
      message: `Generated ${generatedQuestions.length} questions for question bank`,
      questions: generatedQuestions.length,
      topics: topics
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get questions from bank for specific criteria
router.post('/select-questions', async (req, res) => {
  try {
    const { courseId, topics, difficulty, count = 10 } = req.body;
    
    const query = {
      courseId,
      isActive: true
    };
    
    if (topics && topics.length > 0) {
      query.topic = { $in: topics };
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Get questions with weighted selection (prefer less used questions)
    const questions = await QuestionBank.aggregate([
      { $match: query },
      { $addFields: { 
        weight: { 
          $subtract: [100, { $multiply: ['$usageCount', 10] }] 
        }
      }},
      { $sample: { size: Math.min(count * 2, 100) } }, // Get more than needed
      { $sort: { weight: -1, averageScore: 1 } }, // Prefer unused and challenging questions
      { $limit: count }
    ]);

    // Update usage count for selected questions
    const questionIds = questions.map(q => q._id);
    await QuestionBank.updateMany(
      { _id: { $in: questionIds } },
      { 
        $inc: { usageCount: 1 },
        $set: { lastUsed: new Date() }
      }
    );

    res.json({ questions });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get question bank statistics
router.get('/stats/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const stats = await QuestionBank.aggregate([
      { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
      {
        $group: {
          _id: {
            topic: '$topic',
            difficulty: '$difficulty'
          },
          count: { $sum: 1 },
          avgUsage: { $avg: '$usageCount' },
          avgScore: { $avg: '$averageScore' }
        }
      },
      {
        $group: {
          _id: '$_id.topic',
          difficulties: {
            $push: {
              difficulty: '$_id.difficulty',
              count: '$count',
              avgUsage: '$avgUsage',
              avgScore: '$avgScore'
            }
          },
          totalQuestions: { $sum: '$count' }
        }
      }
    ]);

    res.json({ stats });
  } catch (error) {
    console.error('Question bank stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update question performance after test
router.post('/update-performance', async (req, res) => {
  try {
    const { questionUpdates } = req.body; // Array of { questionId, wasCorrect, studentScore }
    
    for (const update of questionUpdates) {
      const question = await QuestionBank.findById(update.questionId);
      if (question) {
        // Update average score (weighted average)
        const totalAttempts = question.usageCount;
        const currentAvg = question.averageScore || 0;
        const newScore = update.wasCorrect ? 100 : 0;
        
        const newAverage = ((currentAvg * (totalAttempts - 1)) + newScore) / totalAttempts;
        question.averageScore = newAverage;
        
        await question.save();
      }
    }
    
    res.json({ message: 'Question performance updated' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all questions for a course (for faculty review)
router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { topic, difficulty, page = 1, limit = 20 } = req.query;
    
    const query = { courseId };
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    
    const questions = await QuestionBank.find(query)
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await QuestionBank.countDocuments(query);
    
    res.json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;