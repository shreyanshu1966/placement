import Assessment from '../models/Assessment.js';
import Question from '../models/Question.js';
import Result from '../models/Result.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

/**
 * @desc    Get all assessments
 * @route   GET /api/assessments
 * @access  Private
 */
export const getAssessments = async (req, res, next) => {
  try {
    const {
      course,
      type,
      status,
      createdBy,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};
    if (course) query.course = course;
    if (type) query.type = type;
    if (status) query.status = status;
    if (createdBy) query.createdBy = createdBy;

    // Filter based on role
    if (req.user.role === 'student') {
      // Show only published assessments for student's courses or targeted to them
      query.status = { $in: ['published', 'ongoing', 'completed'] };
      query.$or = [
        { targetStudents: req.user._id },
        { targetBatches: req.user.batch },
        { targetDepartments: req.user.department }
      ];
    } else if (req.user.role === 'faculty') {
      query.createdBy = req.user._id;
    }

    const skip = (page - 1) * limit;
    const total = await Assessment.countDocuments(query);

    const assessments = await Assessment.find(query)
      .populate('course', 'title code')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      count: assessments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: assessments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get assessment by ID
 * @route   GET /api/assessments/:id
 * @access  Private
 */
export const getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('course', 'title code')
      .populate('createdBy', 'name email')
      .populate('questions.question');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create assessment
 * @route   POST /api/assessments
 * @access  Private/Faculty/Admin
 */
export const createAssessment = async (req, res, next) => {
  try {
    const assessmentData = {
      ...req.body,
      createdBy: req.user._id
    };

    const assessment = await Assessment.create(assessmentData);

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update assessment
 * @route   PUT /api/assessments/:id
 * @access  Private/Faculty/Admin
 */
export const updateAssessment = async (req, res, next) => {
  try {
    let assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      assessment.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this assessment'
      });
    }

    assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Assessment updated successfully',
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete assessment
 * @route   DELETE /api/assessments/:id
 * @access  Private/Faculty/Admin
 */
export const deleteAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      assessment.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this assessment'
      });
    }

    await assessment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate adaptive assessment
 * @route   POST /api/assessments/generate
 * @access  Private
 */
export const generateAdaptiveAssessment = async (req, res, next) => {
  try {
    const {
      courseId,
      totalQuestions = 20,
      duration = 60,
      type = 'practice',
      focusTopics = []
    } = req.body;

    // Get student context
    const student = await User.findById(req.user._id);
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get all topics from course if no focus topics specified
    const topics = focusTopics.length > 0
      ? focusTopics
      : course.getAllTopics().map(t => t.topicName);

    // Analyze student's context to determine weak areas
    const topicStrengths = student.context.topicStrengths || new Map();
    const weakTopics = topics.filter(topic => {
      const strength = topicStrengths.get(topic) || 50;
      return strength < 60; // Topics with < 60% proficiency
    });

    const mediumTopics = topics.filter(topic => {
      const strength = topicStrengths.get(topic) || 50;
      return strength >= 60 && strength < 80;
    });

    const strongTopics = topics.filter(topic => {
      const strength = topicStrengths.get(topic) || 50;
      return strength >= 80;
    });

    // Weighted topic distribution: 50% weak, 30% medium, 20% strong
    const topicDistribution = [
      ...weakTopics,
      ...weakTopics, // Duplicate weak topics for higher weight
      ...mediumTopics,
      ...strongTopics.slice(0, Math.ceil(strongTopics.length / 2))
    ];

    // Difficulty distribution based on student preference
    const difficultyDist = student.context.difficultyPreference === 'adaptive'
      ? { easy: 0.3, medium: 0.5, hard: 0.2 }
      : { easy: 0.3, medium: 0.4, hard: 0.3 };

    // Calculate questions per difficulty
    const questionsPerDifficulty = {
      easy: Math.ceil(totalQuestions * difficultyDist.easy),
      medium: Math.ceil(totalQuestions * difficultyDist.medium),
      hard: Math.floor(totalQuestions * difficultyDist.hard)
    };

    // Fetch questions
    const selectedQuestions = [];

    for (const [difficulty, count] of Object.entries(questionsPerDifficulty)) {
      const questions = await Question.find({
        course: courseId,
        topic: { $in: topicDistribution },
        difficulty,
        isActive: true
      })
        .limit(count * 2) // Get more than needed for randomization
        .lean();

      // Shuffle and select
      const shuffled = questions.sort(() => 0.5 - Math.random());
      selectedQuestions.push(...shuffled.slice(0, count));
    }

    // Randomize final order
    selectedQuestions.sort(() => 0.5 - Math.random());

    // Calculate total marks (1 mark per question by default)
    const totalMarks = selectedQuestions.length;
    const passingMarks = Math.ceil(totalMarks * 0.4); // 40% passing

    // Create assessment
    const assessment = await Assessment.create({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Test - ${course.title}`,
      type,
      course: courseId,
      createdBy: req.user._id,
      questions: selectedQuestions.map((q, index) => ({
        question: q._id,
        marks: 1,
        order: index + 1
      })),
      config: {
        duration,
        totalMarks,
        passingMarks,
        showResultsImmediately: type === 'practice',
        showCorrectAnswers: type === 'practice',
        allowReview: true,
        randomizeQuestions: false,
        randomizeOptions: true,
        preventBacktrack: type !== 'practice'
      },
      isAdaptive: true,
      adaptiveConfig: {
        algorithm: 'hybrid',
        targetStudent: req.user._id,
        focusTopics: weakTopics,
        difficultyDistribution: {
          easy: difficultyDist.easy * 100,
          medium: difficultyDist.medium * 100,
          hard: difficultyDist.hard * 100
        }
      },
      schedule: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      targetStudents: [req.user._id],
      status: 'published'
    });

    res.status(201).json({
      success: true,
      message: 'Adaptive assessment generated successfully',
      data: {
        assessment,
        analysis: {
          totalQuestions: selectedQuestions.length,
          weakTopics,
          mediumTopics,
          strongTopics,
          difficultyDistribution: questionsPerDifficulty
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Start assessment attempt
 * @route   POST /api/assessments/:id/start
 * @access  Private
 */
export const startAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('questions.question');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check if assessment is active
    if (!assessment.isActive()) {
      return res.status(400).json({
        success: false,
        message: 'Assessment is not currently active'
      });
    }

    // Check if student already has an in-progress attempt
    const existingAttempt = await Result.findOne({
      student: req.user._id,
      assessment: assessment._id,
      status: 'in-progress'
    });

    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: 'You already have an in-progress attempt',
        data: existingAttempt
      });
    }

    // Get attempt number
    const attemptCount = await Result.countDocuments({
      student: req.user._id,
      assessment: assessment._id
    });

    // Create new result entry
    const result = await Result.create({
      student: req.user._id,
      assessment: assessment._id,
      attemptNumber: attemptCount + 1,
      startTime: new Date(),
      timeTaken: 0,
      status: 'in-progress',
      answers: [],
      score: {
        obtained: 0,
        total: assessment.config.totalMarks,
        percentage: 0
      },
      isPassed: false,
      correctAnswers: 0,
      incorrectAnswers: 0,
      unanswered: assessment.questions.length
    });

    res.status(200).json({
      success: true,
      message: 'Assessment started successfully',
      data: {
        resultId: result._id,
        assessment: {
          ...assessment.toObject(),
          // Don't send correct answers when starting
          questions: assessment.questions.map(q => ({
            ...q.toObject(),
            question: {
              ...q.question.toObject(),
              correctAnswer: undefined,
              options: q.question.options?.map(opt => ({
                text: opt.text,
                _id: opt._id
              }))
            }
          }))
        },
        duration: assessment.config.duration,
        startTime: result.startTime
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit assessment
 * @route   POST /api/assessments/:id/submit
 * @access  Private
 */
export const submitAssessment = async (req, res, next) => {
  try {
    const { resultId, answers } = req.body;

    const result = await Result.findById(resultId)
      .populate('assessment')
      .populate('student');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Verify ownership
    if (result.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if already submitted
    if (result.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Assessment already submitted'
      });
    }

    const assessment = await Assessment.findById(result.assessment)
      .populate('questions.question');

    // Process answers and calculate score
    const processedAnswers = [];
    let correctCount = 0;
    let totalScore = 0;

    for (const answer of answers) {
      const assessmentQuestion = assessment.questions.find(
        q => q.question._id.toString() === answer.questionId
      );

      if (!assessmentQuestion) continue;

      const question = assessmentQuestion.question;
      let isCorrect = false;

      // Check answer correctness
      if (question.questionType === 'multiple-choice') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = correctOption && correctOption._id.toString() === answer.answer;
      } else if (question.questionType === 'true-false') {
        isCorrect = question.correctAnswer.toLowerCase() === answer.answer.toLowerCase();
      } else {
        // For other types, simple string comparison (can be enhanced)
        isCorrect = question.correctAnswer?.toLowerCase().trim() === answer.answer?.toLowerCase().trim();
      }

      const marksObtained = isCorrect ? assessmentQuestion.marks : 0;
      if (isCorrect) correctCount++;
      totalScore += marksObtained;

      processedAnswers.push({
        question: question._id,
        submittedAnswer: answer.answer,
        isCorrect,
        marksObtained,
        maxMarks: assessmentQuestion.marks,
        timeSpent: answer.timeSpent || 0,
        isFlagged: answer.isFlagged || false,
        isReviewed: false
      });

      // Update question statistics
      await question.updateStats(isCorrect, answer.timeSpent || 60);
      await question.save();
    }

    // Calculate metrics
    result.endTime = new Date();
    result.timeTaken = Math.floor((result.endTime - result.startTime) / 1000); // seconds
    result.status = 'completed';
    result.answers = processedAnswers;
    result.score = {
      obtained: totalScore,
      total: assessment.config.totalMarks,
      percentage: Math.round((totalScore / assessment.config.totalMarks) * 100)
    };
    result.isPassed = totalScore >= assessment.config.passingMarks;
    result.correctAnswers = correctCount;
    result.incorrectAnswers = processedAnswers.length - correctCount;
    result.unanswered = assessment.questions.length - processedAnswers.length;

    // Populate question details for topic performance calculation
    await result.populate('answers.question');
    
    // Calculate topic and difficulty performance (will be enhanced with populated questions)
    await result.calculateTopicPerformance();
    await result.identifyStrengthsWeaknesses();

    await result.save();

    // Update student context
    const student = await User.findById(req.user._id);
    const topicScores = new Map();
    
    // Calculate topic scores from result
    result.topicPerformance.forEach(tp => {
      topicScores.set(tp.topic, tp.accuracy);
    });

    student.updateContext({
      topicScores,
      averageTimePerQuestion: result.timeTaken / processedAnswers.length
    });
    await student.save();

    // Update assessment statistics
    assessment.updateStats(result.score.percentage, result.timeTaken / 60);
    await assessment.save();

    res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
