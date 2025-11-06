import Question from '../models/Question.js';
import Course from '../models/Course.js';

/**
 * @desc    Get all questions
 * @route   GET /api/questions
 * @access  Private
 */
export const getQuestions = async (req, res, next) => {
  try {
    const {
      course,
      topic,
      difficulty,
      questionType,
      tags,
      source,
      isActive,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};
    if (course) query.course = course;
    if (topic) query.topic = { $regex: topic, $options: 'i' };
    if (difficulty) query.difficulty = difficulty;
    if (questionType) query.questionType = questionType;
    if (tags) query.tags = { $in: tags.split(',') };
    if (source) query.source = source;
    if (isActive) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { questionText: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    const total = await Question.countDocuments(query);

    const questions = await Question.find(query)
      .populate('course', 'title code')
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get question by ID
 * @route   GET /api/questions/:id
 * @access  Private
 */
export const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('course', 'title code')
      .populate('generatedBy', 'name email');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new question
 * @route   POST /api/questions
 * @access  Private/Faculty/Admin
 */
export const createQuestion = async (req, res, next) => {
  try {
    const {
      questionText,
      questionType,
      options,
      correctAnswer,
      explanation,
      course,
      topic,
      subtopic,
      difficulty,
      bloomsLevel,
      tags,
      source
    } = req.body;

    // Verify course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const questionData = {
      questionText,
      questionType,
      correctAnswer,
      explanation,
      course,
      topic,
      subtopic,
      difficulty: difficulty || 'medium',
      bloomsLevel,
      tags,
      source: source || 'manual',
      generatedBy: req.user._id
    };

    // Add options for MCQ
    if (questionType === 'multiple-choice' && options) {
      questionData.options = options;
    }

    const question = await Question.create(questionData);

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update question
 * @route   PUT /api/questions/:id
 * @access  Private/Faculty/Admin
 */
export const updateQuestion = async (req, res, next) => {
  try {
    let question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is the creator or admin
    if (
      req.user.role !== 'admin' &&
      question.generatedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this question'
      });
    }

    // Update question
    question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete question
 * @route   DELETE /api/questions/:id
 * @access  Private/Faculty/Admin
 */
export const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is the creator or admin
    if (
      req.user.role !== 'admin' &&
      question.generatedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this question'
      });
    }

    await question.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk import questions
 * @route   POST /api/questions/bulk
 * @access  Private/Faculty/Admin
 */
export const bulkImportQuestions = async (req, res, next) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of questions'
      });
    }

    // Add generatedBy to all questions
    const questionsWithCreator = questions.map(q => ({
      ...q,
      generatedBy: req.user._id,
      source: q.source || 'imported'
    }));

    const createdQuestions = await Question.insertMany(questionsWithCreator, {
      ordered: false // Continue on error
    });

    res.status(201).json({
      success: true,
      message: `Successfully imported ${createdQuestions.length} questions`,
      count: createdQuestions.length,
      data: createdQuestions
    });
  } catch (error) {
    // Handle partial success in bulk operations
    if (error.writeErrors) {
      return res.status(207).json({
        success: 'partial',
        message: `Imported ${error.result.nInserted} questions with ${error.writeErrors.length} errors`,
        inserted: error.result.nInserted,
        errors: error.writeErrors.length
      });
    }
    next(error);
  }
};
