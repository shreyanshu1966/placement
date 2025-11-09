const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: String,
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  assignedStudents: [{
    type: String, // Student IDs
    required: true
  }],
  createdBy: String, // Faculty who created this assignment
  selectedTopics: [String], // Topics selected by faculty for this assessment
  targetTopics: [String], // Topics to focus on based on student context (for adaptive)
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  questionsGenerated: [{
    questionId: {
      type: String, // Can be ObjectId for real questions or string for fallback
      required: false
    },
    question: String,
    options: [String],
    correctAnswer: Number,
    topic: String,
    difficulty: String
  }],
  status: {
    type: String,
    enum: ['generated', 'in-progress', 'completed'],
    default: 'generated'
  },
  adaptiveReason: String, // Why this test was generated (e.g., "Focusing on weak areas")
  isAdaptive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assignment', assignmentSchema);