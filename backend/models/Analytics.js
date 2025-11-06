import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  // Type of analytics
  type: {
    type: String,
    enum: ['student', 'course', 'assessment', 'batch', 'department', 'platform'],
    required: true,
    index: true
  },
  
  // Reference to the entity being analyzed
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  entityType: {
    type: String,
    enum: ['User', 'Course', 'Assessment', 'Batch', 'Department'],
    required: true
  },
  
  // Time period
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'semester', 'academic-year', 'custom'],
      default: 'monthly'
    }
  },
  
  // Overall metrics
  overallMetrics: {
    totalAssessments: {
      type: Number,
      default: 0
    },
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    medianScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    passRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    averageTimeTaken: {
      type: Number, // in minutes
      default: 0
    },
    totalStudents: {
      type: Number,
      default: 0
    }
  },
  
  // Performance distribution
  performanceDistribution: {
    excellent: { // 90-100%
      count: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    good: { // 75-89%
      count: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    average: { // 60-74%
      count: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    belowAverage: { // 40-59%
      count: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    poor: { // 0-39%
      count: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    }
  },
  
  // Topic-wise analytics
  topicAnalytics: [{
    topic: {
      type: String,
      required: true
    },
    totalQuestions: {
      type: Number,
      default: 0
    },
    averageAccuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    mostCommonMistakes: [{
      type: String
    }],
    studentsStruggling: {
      type: Number,
      default: 0
    }
  }],
  
  // Difficulty analytics
  difficultyAnalytics: {
    easy: {
      totalQuestions: { type: Number, default: 0 },
      averageAccuracy: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 }
    },
    medium: {
      totalQuestions: { type: Number, default: 0 },
      averageAccuracy: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 }
    },
    hard: {
      totalQuestions: { type: Number, default: 0 },
      averageAccuracy: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 }
    }
  },
  
  // Trend data
  trends: {
    scoreProgression: [{
      date: Date,
      averageScore: Number
    }],
    participationRate: [{
      date: Date,
      rate: Number
    }],
    topicMastery: [{
      topic: String,
      masteryLevel: Number, // 0-100
      trend: String // 'improving', 'stable', 'declining'
    }]
  },
  
  // Top performers
  topPerformers: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    averageScore: Number,
    totalAssessments: Number,
    rank: Number
  }],
  
  // Students needing attention
  studentsNeedingAttention: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    averageScore: Number,
    weakTopics: [String],
    missedAssessments: Number
  }],
  
  // Engagement metrics
  engagement: {
    activeStudents: {
      type: Number,
      default: 0
    },
    inactiveStudents: {
      type: Number,
      default: 0
    },
    averageSessionDuration: {
      type: Number, // in minutes
      default: 0
    },
    completionRate: {
      type: Number, // percentage
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // AI-generated insights
  aiInsights: {
    summary: String,
    keyFindings: [{
      type: String
    }],
    recommendations: [{
      type: String
    }],
    predictedOutcomes: [{
      metric: String,
      prediction: String,
      confidence: Number
    }]
  },
  
  // Comparison with previous period
  comparison: {
    scoreChange: Number, // percentage
    participationChange: Number, // percentage
    passRateChange: Number, // percentage
    trend: {
      type: String,
      enum: ['improving', 'stable', 'declining']
    }
  },
  
  // Metadata
  generatedAt: {
    type: Date,
    default: Date.now
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: false
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

// Indexes
analyticsSchema.index({ type: 1, entityId: 1 });
analyticsSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });
analyticsSchema.index({ generatedAt: -1 });

// Method to calculate performance distribution
analyticsSchema.methods.calculateDistribution = function(scores) {
  const distribution = {
    excellent: 0,
    good: 0,
    average: 0,
    belowAverage: 0,
    poor: 0
  };
  
  scores.forEach(score => {
    if (score >= 90) distribution.excellent++;
    else if (score >= 75) distribution.good++;
    else if (score >= 60) distribution.average++;
    else if (score >= 40) distribution.belowAverage++;
    else distribution.poor++;
  });
  
  const total = scores.length;
  this.performanceDistribution = {
    excellent: { count: distribution.excellent, percentage: (distribution.excellent / total) * 100 },
    good: { count: distribution.good, percentage: (distribution.good / total) * 100 },
    average: { count: distribution.average, percentage: (distribution.average / total) * 100 },
    belowAverage: { count: distribution.belowAverage, percentage: (distribution.belowAverage / total) * 100 },
    poor: { count: distribution.poor, percentage: (distribution.poor / total) * 100 }
  };
};

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;
