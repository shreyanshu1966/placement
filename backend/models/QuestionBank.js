const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  subtopic: String,
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [String], // For categorization
  usageCount: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  createdBy: String, // Faculty who created it
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: Date,
  isActive: {
    type: Boolean,
    default: true
  }
});

// Index for efficient querying
questionBankSchema.index({ courseId: 1, topic: 1, difficulty: 1 });

module.exports = mongoose.model('QuestionBank', questionBankSchema);