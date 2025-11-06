import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  // Student and assessment info
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true,
    index: true
  },
  
  // Attempt details
  attemptNumber: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  timeTaken: {
    type: Number, // in seconds
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned', 'time-expired'],
    default: 'in-progress'
  },
  
  // Answers submitted
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    submittedAnswer: {
      type: mongoose.Schema.Types.Mixed, // Can be string, number, or array
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    marksObtained: {
      type: Number,
      required: true,
      default: 0
    },
    maxMarks: {
      type: Number,
      required: true
    },
    timeSpent: {
      type: Number, // in seconds
      required: true
    },
    
    // For review and flagging
    isFlagged: {
      type: Boolean,
      default: false
    },
    isReviewed: {
      type: Boolean,
      default: false
    }
  }],
  
  // Overall score
  score: {
    obtained: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  
  // Pass/Fail
  isPassed: {
    type: Boolean,
    required: true
  },
  
  // Question-wise analysis
  correctAnswers: {
    type: Number,
    required: true,
    default: 0
  },
  incorrectAnswers: {
    type: Number,
    required: true,
    default: 0
  },
  unanswered: {
    type: Number,
    default: 0
  },
  
  // Topic-wise performance
  topicPerformance: [{
    topic: {
      type: String,
      required: true
    },
    questionsAttempted: {
      type: Number,
      required: true
    },
    correctAnswers: {
      type: Number,
      required: true
    },
    accuracy: {
      type: Number, // percentage
      required: true
    },
    averageTime: {
      type: Number // seconds per question
    }
  }],
  
  // Difficulty-wise performance
  difficultyPerformance: {
    easy: {
      attempted: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 }
    },
    medium: {
      attempted: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 }
    },
    hard: {
      attempted: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 }
    }
  },
  
  // Strengths and weaknesses
  strengths: [{
    type: String
  }],
  weaknesses: [{
    type: String
  }],
  
  // Recommendations
  recommendations: [{
    type: String
  }],
  
  // AI-generated insights
  aiInsights: {
    generated: {
      type: Boolean,
      default: false
    },
    summary: String,
    learningGaps: [{
      type: String
    }],
    suggestedResources: [{
      title: String,
      url: String,
      type: String
    }],
    nextSteps: [{
      type: String
    }]
  },
  
  // Ranking (if applicable)
  rank: {
    type: Number,
    min: 1
  },
  percentile: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Proctoring data (future feature)
  proctoringData: {
    tabSwitches: { type: Number, default: 0 },
    warnings: { type: Number, default: 0 },
    violations: [{
      type: {
        type: String,
        enum: ['tab-switch', 'copy-paste', 'multiple-faces', 'no-face', 'other']
      },
      timestamp: Date,
      description: String
    }]
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes
resultSchema.index({ student: 1, assessment: 1 });
resultSchema.index({ assessment: 1, 'score.percentage': -1 });
resultSchema.index({ student: 1, createdAt: -1 });

// Calculate percentage before saving
resultSchema.pre('save', function(next) {
  if (this.score.total > 0) {
    this.score.percentage = Math.round((this.score.obtained / this.score.total) * 100);
  }
  next();
});

// Method to calculate topic performance
resultSchema.methods.calculateTopicPerformance = function() {
  const topicMap = new Map();
  
  this.answers.forEach(answer => {
    // Note: We'll need to populate question to get topic
    // This is a placeholder for the logic
    const topic = answer.question.topic; // Assumes populated
    
    if (!topicMap.has(topic)) {
      topicMap.set(topic, {
        topic: topic,
        questionsAttempted: 0,
        correctAnswers: 0,
        totalTime: 0
      });
    }
    
    const topicData = topicMap.get(topic);
    topicData.questionsAttempted += 1;
    if (answer.isCorrect) {
      topicData.correctAnswers += 1;
    }
    topicData.totalTime += answer.timeSpent;
  });
  
  this.topicPerformance = Array.from(topicMap.values()).map(data => ({
    topic: data.topic,
    questionsAttempted: data.questionsAttempted,
    correctAnswers: data.correctAnswers,
    accuracy: Math.round((data.correctAnswers / data.questionsAttempted) * 100),
    averageTime: Math.round(data.totalTime / data.questionsAttempted)
  }));
};

// Method to identify strengths and weaknesses
resultSchema.methods.identifyStrengthsWeaknesses = function() {
  this.strengths = [];
  this.weaknesses = [];
  
  this.topicPerformance.forEach(topic => {
    if (topic.accuracy >= 80) {
      this.strengths.push(topic.topic);
    } else if (topic.accuracy < 50) {
      this.weaknesses.push(topic.topic);
    }
  });
};

const Result = mongoose.model('Result', resultSchema);

export default Result;
