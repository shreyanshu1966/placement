import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assessment title is required'],
    trim: true
  },
  
  // Assessment type
  type: {
    type: String,
    enum: ['practice', 'quiz', 'midterm', 'final', 'placement', 'custom'],
    default: 'practice',
    required: true
  },
  
  // Course association
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  // Creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Questions in this assessment
  questions: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    marks: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    order: {
      type: Number,
      required: true
    }
  }],
  
  // Assessment configuration
  config: {
    duration: {
      type: Number, // in minutes
      required: true,
      min: 1
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1
    },
    passingMarks: {
      type: Number,
      required: true,
      min: 0
    },
    
    // Display settings
    showResultsImmediately: {
      type: Boolean,
      default: true
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true
    },
    allowReview: {
      type: Boolean,
      default: true
    },
    
    // Restrictions
    randomizeQuestions: {
      type: Boolean,
      default: false
    },
    randomizeOptions: {
      type: Boolean,
      default: false
    },
    preventBacktrack: {
      type: Boolean,
      default: false
    },
    
    // Negative marking
    negativeMarking: {
      enabled: {
        type: Boolean,
        default: false
      },
      deduction: {
        type: Number,
        min: 0,
        max: 100,
        default: 25 // percentage
      }
    }
  },
  
  // Adaptive assessment settings
  isAdaptive: {
    type: Boolean,
    default: false
  },
  adaptiveConfig: {
    algorithm: {
      type: String,
      enum: ['difficulty-based', 'topic-based', 'hybrid'],
      default: 'hybrid'
    },
    targetStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    focusTopics: [{
      type: String
    }],
    difficultyDistribution: {
      easy: { type: Number, min: 0, max: 100, default: 30 },
      medium: { type: Number, min: 0, max: 100, default: 50 },
      hard: { type: Number, min: 0, max: 100, default: 20 }
    }
  },
  
  // Scheduling
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    timeZone: {
      type: String,
      default: 'Asia/Kolkata'
    }
  },
  
  // Target audience
  targetStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  targetBatches: [{
    type: String
  }],
  targetDepartments: [{
    type: String
  }],
  
  // Instructions
  instructions: {
    type: String,
    maxlength: [2000, 'Instructions cannot exceed 2000 characters']
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'archived'],
    default: 'draft'
  },
  
  // Statistics
  stats: {
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
    averageTimeTaken: {
      type: Number, // in minutes
      default: 0
    },
    highestScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lowestScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
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
assessmentSchema.index({ course: 1, status: 1 });
assessmentSchema.index({ createdBy: 1 });
assessmentSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });

// Validation: End date must be after start date
assessmentSchema.pre('save', function(next) {
  if (this.schedule.endDate <= this.schedule.startDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

// Method to check if assessment is active
assessmentSchema.methods.isActive = function() {
  const now = new Date();
  return (
    this.status === 'published' &&
    now >= this.schedule.startDate &&
    now <= this.schedule.endDate
  );
};

// Method to update statistics
assessmentSchema.methods.updateStats = function(score, timeTaken) {
  this.stats.totalAttempts += 1;
  
  // Update average score
  const currentAvg = this.stats.averageScore;
  this.stats.averageScore = Math.round(
    ((currentAvg * (this.stats.totalAttempts - 1)) + score) / this.stats.totalAttempts
  );
  
  // Update average time
  const currentTime = this.stats.averageTimeTaken;
  this.stats.averageTimeTaken = Math.round(
    ((currentTime * (this.stats.totalAttempts - 1)) + timeTaken) / this.stats.totalAttempts
  );
  
  // Update highest/lowest scores
  if (score > this.stats.highestScore) {
    this.stats.highestScore = score;
  }
  if (this.stats.lowestScore === 0 || score < this.stats.lowestScore) {
    this.stats.lowestScore = score;
  }
};

const Assessment = mongoose.model('Assessment', assessmentSchema);

export default Assessment;
