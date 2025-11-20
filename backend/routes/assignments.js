const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Context = require('../models/Context');
const QuestionBank = require('../models/QuestionBank');
const Student = require('../models/Student');
const ContextAnalyzer = require('../services/ContextAnalyzer');
const axios = require('axios');

// Fallback question generator for common CS topics
function generateFallbackQuestions(topic, count = 3) {
  const fallbackQuestions = {
    'Arrays': [
      {
        question: 'What is the time complexity of accessing an element in an array by index?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        correctAnswer: 0,
        difficulty: 'easy'
      },
      {
        question: 'Which operation is NOT efficiently supported by arrays?',
        options: ['Random access', 'Insertion at middle', 'Memory locality', 'Cache performance'],
        correctAnswer: 1,
        difficulty: 'medium'
      },
      {
        question: 'In most programming languages, array indices start from?',
        options: ['1', '0', '-1', 'Any number'],
        correctAnswer: 1,
        difficulty: 'easy'
      }
    ],
    'Linked Lists': [
      {
        question: 'What is the main advantage of linked lists over arrays?',
        options: ['Random access', 'Dynamic size', 'Better cache locality', 'Less memory usage'],
        correctAnswer: 1,
        difficulty: 'medium'
      },
      {
        question: 'In a singly linked list, each node contains?',
        options: ['Only data', 'Data and next pointer', 'Data and previous pointer', 'Index and data'],
        correctAnswer: 1,
        difficulty: 'easy'
      },
      {
        question: 'What is the time complexity of inserting at the beginning of a linked list?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        correctAnswer: 0,
        difficulty: 'medium'
      }
    ],
    'Trees': [
      {
        question: 'In a binary tree, each node has at most how many children?',
        options: ['1', '2', '3', 'Unlimited'],
        correctAnswer: 1,
        difficulty: 'easy'
      },
      {
        question: 'What is the height of a balanced binary tree with n nodes?',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        correctAnswer: 1,
        difficulty: 'medium'
      },
      {
        question: 'Which traversal visits the root node last?',
        options: ['Preorder', 'Inorder', 'Postorder', 'Level order'],
        correctAnswer: 2,
        difficulty: 'medium'
      }
    ],
    'Stacks': [
      {
        question: 'Stack follows which principle?',
        options: ['FIFO', 'LIFO', 'LILO', 'Random'],
        correctAnswer: 1,
        difficulty: 'easy'
      },
      {
        question: 'Which operation is used to remove an element from stack?',
        options: ['push', 'pop', 'peek', 'isEmpty'],
        correctAnswer: 1,
        difficulty: 'easy'
      },
      {
        question: 'Stack overflow occurs when?',
        options: ['Stack is empty', 'Stack is full', 'Invalid operation', 'Memory error'],
        correctAnswer: 1,
        difficulty: 'medium'
      }
    ],
    'Queues': [
      {
        question: 'Queue follows which principle?',
        options: ['LIFO', 'FIFO', 'LILO', 'Random'],
        correctAnswer: 1,
        difficulty: 'easy'
      },
      {
        question: 'In a queue, insertion happens at?',
        options: ['Front', 'Rear', 'Middle', 'Any position'],
        correctAnswer: 1,
        difficulty: 'easy'
      },
      {
        question: 'What is the time complexity of enqueue operation?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        correctAnswer: 0,
        difficulty: 'medium'
      }
    ]
  };

  const topicQuestions = fallbackQuestions[topic] || fallbackQuestions['Arrays'];
  const selectedQuestions = topicQuestions.slice(0, count);
  
  return selectedQuestions.map((q, index) => ({
    questionId: `fallback-${topic}-${index}-${Date.now()}`,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    topic: topic,
    difficulty: q.difficulty
  }));
}

// Create assignment for selected students (Faculty-created)
router.post('/create', async (req, res) => {
  try {
    const { courseId, selectedTopics, assignedStudents, createdBy, title, proctorConfig } = req.body;
    
    // Validate inputs
    if (!courseId || !selectedTopics?.length || !assignedStudents?.length) {
      return res.status(400).json({ 
        message: 'Course, topics, and students are required' 
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    console.log(`Creating assignment: ${title || 'Untitled'}`);
    console.log(`Topics: ${selectedTopics.join(', ')}`);
    console.log(`Students: ${assignedStudents.length}`);
    console.log(`Proctoring enabled: ${proctorConfig?.enabled || false}`);

    // Generate questions for selected topics using enhanced API
    console.log('Step 1: Generating questions with enhanced API...');
    
    let questionsGenerated = [];
    
    for (const topic of selectedTopics) {
      try {
        console.log(`Generating questions for topic: ${topic}`);
        
        // Use our enhanced question generation API
        const questionResponse = await axios.post('http://localhost:5000/api/questions/generate', {
          topic,
          difficulty: 'medium',
          count: 3,
          courseId
        });

        if (questionResponse.data.questions && questionResponse.data.questions.length > 0) {
          console.log(`Generated ${questionResponse.data.questions.length} questions for ${topic} (Source: ${questionResponse.data.source})`);
          
          // Convert to assignment format
          const topicQuestions = questionResponse.data.questions.map(q => ({
            questionId: q._id || `ai-${topic}-${Date.now()}-${Math.random()}`,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            topic: q.topic || topic,
            difficulty: q.difficulty || 'medium',
            source: questionResponse.data.source // Track if from AI or fallback
          }));
          
          questionsGenerated.push(...topicQuestions);
        } else {
          console.log(`No questions generated for ${topic}, using fallback`);
          // Add fallback questions
          questionsGenerated.push(...generateFallbackQuestions(topic, 3));
        }
      } catch (error) {
        console.error(`Error generating questions for ${topic}:`, error.message);
        // Add fallback questions on error
        questionsGenerated.push(...generateFallbackQuestions(topic, 3));
      }
    }

    console.log(`Total questions generated: ${questionsGenerated.length}`);

    // Ensure we have questions
    if (questionsGenerated.length === 0) {
      console.error('No questions could be generated!');
      return res.status(400).json({ 
        message: 'Failed to generate questions. Please try again or contact support.' 
      });
    }

    console.log('Step 2: Creating assignment...');

    // Create assignment
    const assignment = new Assignment({
      title: title || `Assessment - ${course.title}`,
      courseId,
      assignedStudents,
      createdBy: createdBy || 'faculty-user',
      selectedTopics,
      questionsGenerated,
      difficulty: 'medium',
      adaptiveReason: `Faculty assessment covering: ${selectedTopics.join(', ')}`,
      proctorConfig: proctorConfig || { enabled: false } // Add proctoring configuration
    });
    
    await assignment.save();
    await assignment.populate('courseId');
    
    console.log(`Assignment created successfully with ${questionsGenerated.length} questions`);
    
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Assignment creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Preview questions before creating assignment
router.post('/preview-questions', async (req, res) => {
  try {
    const { courseId, selectedTopics, questionsPerTopic = 3 } = req.body;
    
    if (!courseId || !selectedTopics?.length) {
      return res.status(400).json({ 
        message: 'Course and topics are required' 
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    console.log(`Previewing questions for topics: ${selectedTopics.join(', ')}`);

    let previewQuestions = [];
    
    // Generate preview questions using enhanced API
    for (const topic of selectedTopics) {
      try {
        console.log(`Generating preview for topic: ${topic}`);
        
        const questionResponse = await axios.post('http://localhost:5000/api/questions/generate', {
          topic,
          difficulty: 'medium',
          count: questionsPerTopic,
          courseId
        });

        if (questionResponse.data.questions && questionResponse.data.questions.length > 0) {
          previewQuestions.push(...questionResponse.data.questions.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            topic: q.topic || topic,
            difficulty: q.difficulty || 'medium',
            source: questionResponse.data.source // Track if from AI or fallback
          })));
          console.log(`Generated ${questionResponse.data.questions.length} preview questions for ${topic} (Source: ${questionResponse.data.source})`);
        } else {
          // Use fallback questions for preview
          const fallbackQuestions = generateFallbackQuestions(topic, questionsPerTopic);
          previewQuestions.push(...fallbackQuestions.map(fq => ({
            question: fq.question,
            options: fq.options,
            correctAnswer: fq.correctAnswer,
            topic: fq.topic,
            difficulty: fq.difficulty,
            source: 'fallback'
          })));
          console.log(`Used fallback questions for ${topic} preview`);
        }
      } catch (error) {
        console.error(`Error generating preview for ${topic}:`, error.message);
        // Use fallback questions on error
        const fallbackQuestions = generateFallbackQuestions(topic, questionsPerTopic);
        previewQuestions.push(...fallbackQuestions.map(fq => ({
          question: fq.question,
          options: fq.options,
          correctAnswer: fq.correctAnswer,
          topic: fq.topic,
          difficulty: fq.difficulty
        })));
      }
    }

    console.log(`Preview generated: ${previewQuestions.length} questions`);

    res.json({
      success: true,
      questions: previewQuestions,
      totalQuestions: previewQuestions.length,
      topics: selectedTopics
    });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Generate adaptive assignment for specific student (AI-driven)
router.post('/generate-adaptive', async (req, res) => {
  try {
    const { courseId, studentId } = req.body;
    
    // Get course and student context
    const [course, recommendation] = await Promise.all([
      Course.findById(courseId),
      ContextAnalyzer.getTestRecommendation(studentId)
    ]);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Select questions from bank based on recommendation
    const questionsResponse = await axios.post('http://localhost:5000/api/question-bank/select-questions', {
      courseId,
      topics: recommendation.recommendedTopics.length > 0 ? recommendation.recommendedTopics : course.syllabus.slice(0, 3).map(s => s.topic),
      difficulty: recommendation.difficulty,
      count: 15 // Standard test size
    });

    let selectedQuestions = questionsResponse.data.questions;

    // If no questions in bank, generate some
    if (selectedQuestions.length === 0) {
      console.log('No questions in bank, generating new ones...');
      
      // Generate and add to bank first
      const topicsToGenerate = recommendation.recommendedTopics.length > 0 
        ? recommendation.recommendedTopics.slice(0, 3)
        : course.syllabus.slice(0, 3).map(s => s.topic);

      await axios.post('http://localhost:5000/api/question-bank/generate-bank', {
        courseId,
        topics: topicsToGenerate,
        questionsPerTopic: 5,
        faculty: 'system'
      });

      // Now select from the newly generated questions
      const newQuestionsResponse = await axios.post('http://localhost:5000/api/question-bank/select-questions', {
        courseId,
        topics: topicsToGenerate,
        difficulty: recommendation.difficulty,
        count: 15
      });

      selectedQuestions = newQuestionsResponse.data.questions;
    }

    // Convert QuestionBank format to Assignment format
    const questionsGenerated = selectedQuestions.map(q => ({
      questionId: q._id, // Store reference to question bank
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      topic: q.topic,
      difficulty: q.difficulty
    }));

    // Create assignment
    const assignment = new Assignment({
      title: `Adaptive Assessment - ${course.title}`,
      courseId,
      assignedStudents: [studentId],
      createdBy: 'system',
      targetTopics: recommendation.recommendedTopics,
      questionsGenerated,
      difficulty: recommendation.difficulty,
      adaptiveReason: recommendation.reason,
      isAdaptive: true
    });
    
    await assignment.save();
    await assignment.populate('courseId');
    
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Assignment generation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Auto-generate test for student (simplified endpoint)
router.post('/auto-test/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId } = req.body;

    // Use the adaptive generation endpoint
    const response = await axios.post('http://localhost:5000/api/assignments/generate-adaptive', {
      courseId,
      studentId
    });

    res.json(response.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all assignments (filtered by student if needed)
router.get('/', async (req, res) => {
  try {
    const { studentId } = req.query;
    let filter = {};
    
    if (studentId) {
      filter.assignedStudents = { $in: [studentId] };
    }
    
    const assignments = await Assignment.find(filter)
      .populate('courseId')
      .sort({ createdAt: -1 });
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get assignment by ID
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('courseId');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start assignment (mark as in-progress)
router.put('/:id/start', async (req, res) => {
  try {
    const { studentId } = req.body;
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'in-progress',
        startedAt: new Date(),
        $push: { 
          testSessions: {
            studentId: studentId,
            startTime: new Date(),
            status: 'in-progress'
          }
        }
      },
      { new: true }
    ).populate('courseId');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Save answer for a question (auto-save functionality)
router.post('/:id/save-answer', async (req, res) => {
  try {
    const { studentId, questionIndex, selectedAnswer, timestamp } = req.body;
    const assignmentId = req.params.id;

    // Find or create test session
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Update the answer in memory or database
    // For now, we'll just return success - answers will be submitted at the end
    res.json({ 
      message: 'Answer saved',
      questionIndex,
      selectedAnswer,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Submit complete assignment
router.post('/:id/submit', async (req, res) => {
  try {
    const { studentId, answers, timeTaken } = req.body;
    const assignmentId = req.params.id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Calculate score
    let correctAnswers = 0;
    const questionResults = assignment.questionsGenerated.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;
      
      return {
        questionId: question.questionId || `fallback-${index}`,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        topic: question.topic || 'Unknown'
      };
    });

    const score = (correctAnswers / assignment.questionsGenerated.length) * 100;

    // Create result record
    const Result = require('../models/Result');
    const result = new Result({
      assignmentId,
      studentId,
      answers: questionResults,
      score,
      totalQuestions: assignment.questionsGenerated.length,
      correctAnswers,
      timeTaken,
      submittedAt: new Date()
    });

    await result.save();

    // Update assignment status
    await Assignment.findByIdAndUpdate(assignmentId, {
      status: 'completed',
      $push: {
        submissions: {
          studentId,
          score,
          submittedAt: new Date(),
          resultId: result._id
        }
      }
    });

    res.json({
      message: 'Assignment submitted successfully',
      score,
      correctAnswers,
      totalQuestions: assignment.questionsGenerated.length,
      resultId: result._id
    });
  } catch (error) {
    console.error('Assignment submission error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get assignment with student-specific data
router.get('/:id/student/:studentId', async (req, res) => {
  try {
    const { id, studentId } = req.params;
    
    const assignment = await Assignment.findById(id).populate('courseId');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student is assigned
    if (!assignment.assignedStudents.includes(studentId)) {
      return res.status(403).json({ message: 'Student not assigned to this test' });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions?.find(sub => sub.studentId === studentId);
    if (existingSubmission) {
      return res.status(400).json({ 
        message: 'Assignment already submitted',
        submission: existingSubmission
      });
    }

    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete assignment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Optional: Check if user has permission to delete
    // This could be enhanced to check if the user created the assignment

    await Assignment.findByIdAndDelete(id);
    
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;