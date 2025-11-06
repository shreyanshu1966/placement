import ollamaService from '../services/ollamaService.js';
import questionGeneratorService from '../services/questionGeneratorService.js';
import contextUpdateService from '../services/contextUpdateService.js';

/**
 * @desc    Check Ollama service status
 * @route   GET /api/ai/status
 * @access  Private (Admin/Faculty)
 */
export const checkOllamaStatus = async (req, res, next) => {
  try {
    const isAvailable = await ollamaService.isAvailable();
    const models = isAvailable ? await ollamaService.listModels() : [];

    res.status(200).json({
      success: true,
      data: {
        available: isAvailable,
        models: models.map(m => ({
          name: m.name,
          size: m.size,
          modified: m.modified_at
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate questions using AI
 * @route   POST /api/ai/generate-questions
 * @access  Private (Faculty/Admin)
 */
export const generateQuestions = async (req, res, next) => {
  try {
    const {
      topic,
      difficulty = 'medium',
      count = 5,
      questionType = 'multiple-choice',
      course,
      context = '',
      saveToDatabase = true
    } = req.body;

    // Validate required fields
    if (!topic || !course) {
      return res.status(400).json({
        success: false,
        message: 'Topic and course are required'
      });
    }

    // Check if Ollama is available
    const isAvailable = await ollamaService.isAvailable();
    if (!isAvailable) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not available. Please ensure Ollama is running.'
      });
    }

    let result;
    if (saveToDatabase) {
      // Generate and save to database
      result = await questionGeneratorService.generateAndSave({
        topic,
        difficulty,
        count,
        questionType,
        course,
        context
      });
    } else {
      // Just generate without saving
      const questions = await questionGeneratorService.generateQuestions({
        topic,
        difficulty,
        count,
        questionType,
        course,
        context
      });
      
      result = {
        success: true,
        generated: questions.length,
        saved: 0,
        questions
      };
    }

    res.status(200).json({
      success: true,
      message: `Generated ${result.generated} questions${saveToDatabase ? `, saved ${result.saved}` : ''}`,
      data: result
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    next(error);
  }
};

/**
 * @desc    Generate questions for weak topics
 * @route   POST /api/ai/generate-for-weak-topics
 * @access  Private (Faculty/Admin)
 */
export const generateForWeakTopics = async (req, res, next) => {
  try {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Course ID are required'
      });
    }

    // Check if Ollama is available
    const isAvailable = await ollamaService.isAvailable();
    if (!isAvailable) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not available'
      });
    }

    // Get student's learning insights to identify weak topics
    const insights = await contextUpdateService.getLearningInsights(studentId);
    const weakTopics = insights.weaknesses.map(w => w.topic);

    if (weakTopics.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No weak topics identified for this student',
        data: {
          generated: 0,
          questions: []
        }
      });
    }

    // Generate questions for weak topics
    const questions = await questionGeneratorService.generateForWeakTopics(
      weakTopics,
      courseId
    );

    res.status(200).json({
      success: true,
      message: `Generated ${questions.length} questions for weak topics`,
      data: {
        weakTopics,
        generated: questions.length,
        questions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Enhance existing question using AI
 * @route   POST /api/ai/enhance-question/:id
 * @access  Private (Faculty/Admin)
 */
export const enhanceQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const Question = (await import('../models/Question.js')).default;
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if Ollama is available
    const isAvailable = await ollamaService.isAvailable();
    if (!isAvailable) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not available'
      });
    }

    const enhanced = await questionGeneratorService.enhanceQuestion(question);

    res.status(200).json({
      success: true,
      message: 'Question enhanced successfully',
      data: {
        original: question,
        enhanced
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student learning insights
 * @route   GET /api/ai/insights/:studentId
 * @access  Private (Student self, Faculty, Admin)
 */
export const getStudentInsights = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Authorization check
    if (
      req.user.role === 'student' &&
      req.user._id.toString() !== studentId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these insights'
      });
    }

    const insights = await contextUpdateService.getLearningInsights(studentId);

    res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Chat with AI assistant
 * @route   POST /api/ai/chat
 * @access  Private
 */
export const chatWithAI = async (req, res, next) => {
  try {
    const { message, context = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Check if Ollama is available
    const isAvailable = await ollamaService.isAvailable();
    if (!isAvailable) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not available'
      });
    }

    // Build messages array
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful educational AI assistant. Help students understand concepts, answer questions, and provide study guidance. Be encouraging and supportive.'
      },
      ...context,
      {
        role: 'user',
        content: message
      }
    ];

    const response = await ollamaService.chat(messages, {
      temperature: 0.7
    });

    res.status(200).json({
      success: true,
      data: {
        response,
        timestamp: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Pull a model from Ollama
 * @route   POST /api/ai/pull-model
 * @access  Private (Admin only)
 */
export const pullModel = async (req, res, next) => {
  try {
    const { modelName } = req.body;

    if (!modelName) {
      return res.status(400).json({
        success: false,
        message: 'Model name is required'
      });
    }

    const success = await ollamaService.pullModel(modelName);

    if (success) {
      res.status(200).json({
        success: true,
        message: `Model ${modelName} pulled successfully`
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Failed to pull model ${modelName}`
      });
    }
  } catch (error) {
    next(error);
  }
};
