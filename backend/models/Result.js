const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  studentId: {
    type: String,
    required: true,
    index: true
  },
  answers: [{
    questionIndex: Number,
    selectedAnswer: Number,
    correctAnswer: Number,
    isCorrect: Boolean,
    topic: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    timeSpent: Number, // seconds spent on this question
    attempts: {
      type: Number,
      default: 1
    }
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  topicWiseScore: [{
    topic: String,
    correct: Number,
    total: Number,
    percentage: Number,
    difficulty: String,
    averageTimePerQuestion: Number
  }],
  difficultyWiseScore: [{
    difficulty: String,
    correct: Number,
    total: Number,
    percentage: Number
  }],
  timeSpent: {
    type: Number,
    required: true
  }, // total time in seconds
  startedAt: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  performance: {
    rank: Number, // rank among all students who took this test
    percentile: Number, // percentile score
    averageScore: Number, // average score of all students
    medianScore: Number,
    standardDeviation: Number
  },
  analytics: {
    strengths: [String], // topics where student performed well
    weaknesses: [String], // topics needing improvement
    recommendations: [String], // personalized recommendations
    improvementAreas: [{
      topic: String,
      currentScore: Number,
      targetScore: Number,
      suggestion: String
    }]
  },
  metadata: {
    browserInfo: String,
    deviceType: String,
    screenResolution: String,
    sessionId: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for test duration in minutes
resultSchema.virtual('durationMinutes').get(function() {
  return Math.round(this.timeSpent / 60);
});

// Virtual for accuracy percentage
resultSchema.virtual('accuracy').get(function() {
  return this.totalQuestions > 0 ? Math.round((this.score / 100) * this.totalQuestions) : 0;
});

// Index for efficient queries
resultSchema.index({ studentId: 1, completedAt: -1 });
resultSchema.index({ assignmentId: 1, score: -1 });
resultSchema.index({ 'assignmentId': 1, 'performance.rank': 1 });

module.exports = mongoose.model('Result', resultSchema);