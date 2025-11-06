import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    minlength: [10, 'Question must be at least 10 characters long']
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer', 'coding', 'essay'],
    default: 'multiple-choice',
    required: true
  },
  
  // Options for MCQ
  options: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  
  // Correct answer (for non-MCQ)
  correctAnswer: {
    type: String,
    trim: true
  },
  
  // Solution explanation
  explanation: {
    type: String,
    trim: true
  },
  
  // Categorization
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true,
    index: true
  },
  subtopic: {
    type: String,
    trim: true
  },
  
  // Difficulty level
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
    default: 'medium',
    index: true
  },
  difficultyScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  // Bloom's taxonomy level
  bloomsLevel: {
    type: String,
    enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'],
    default: 'understand'
  },
  
  // Tags for better searchability
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Media attachments
  media: {
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'document']
    },
    url: String,
    publicId: String // Cloudinary public ID for deletion
  },
  
  // Question source
  source: {
    type: String,
    enum: ['manual', 'ai-generated', 'imported'],
    default: 'manual'
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // AI metadata (if generated)
  aiMetadata: {
    model: String, // e.g., "gpt-4", "ollama-llama2"
    prompt: String,
    generatedAt: Date,
    qualityScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  // Usage statistics
  stats: {
    timesUsed: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    averageTimeToAnswer: {
      type: Number, // in seconds
      default: 0
    },
    lastUsed: Date
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Versioning
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  
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

// Indexes for efficient queries
questionSchema.index({ course: 1, topic: 1, difficulty: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ isActive: 1, isVerified: 1 });
questionSchema.index({ 'stats.timesUsed': -1 });

// Validation: MCQ must have options with at least one correct answer
questionSchema.pre('save', function(next) {
  if (this.questionType === 'multiple-choice') {
    if (!this.options || this.options.length < 2) {
      return next(new Error('Multiple choice questions must have at least 2 options'));
    }
    
    const hasCorrectAnswer = this.options.some(opt => opt.isCorrect === true);
    if (!hasCorrectAnswer) {
      return next(new Error('At least one option must be marked as correct'));
    }
  }
  next();
});

// Method to update statistics after usage
questionSchema.methods.updateStats = function(wasCorrect, timeToAnswer) {
  this.stats.timesUsed += 1;
  this.stats.lastUsed = new Date();
  
  // Update average score
  const currentAvg = this.stats.averageScore;
  const newScore = wasCorrect ? 100 : 0;
  this.stats.averageScore = Math.round(
    ((currentAvg * (this.stats.timesUsed - 1)) + newScore) / this.stats.timesUsed
  );
  
  // Update average time
  const currentTime = this.stats.averageTimeToAnswer;
  this.stats.averageTimeToAnswer = Math.round(
    ((currentTime * (this.stats.timesUsed - 1)) + timeToAnswer) / this.stats.timesUsed
  );
};

// Method to get correct option(s)
questionSchema.methods.getCorrectAnswer = function() {
  if (this.questionType === 'multiple-choice') {
    return this.options.filter(opt => opt.isCorrect).map(opt => opt.text);
  }
  return this.correctAnswer;
};

const Question = mongoose.model('Question', questionSchema);

export default Question;
