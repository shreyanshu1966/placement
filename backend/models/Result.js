const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  studentId: String,
  answers: [{
    questionIndex: Number,
    selectedAnswer: Number,
    isCorrect: Boolean,
    topic: String
  }],
  score: Number,
  totalQuestions: Number,
  topicWiseScore: [{
    topic: String,
    correct: Number,
    total: Number,
    percentage: Number
  }],
  timeSpent: Number, // in minutes
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Result', resultSchema);