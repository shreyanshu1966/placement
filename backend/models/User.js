import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    default: 'student'
  },
  profileImage: {
    type: String,
    default: ''
  },
  
  // Student-specific fields
  rollNumber: {
    type: String,
    sparse: true,
    unique: true
  },
  department: {
    type: String,
    trim: true
  },
  batch: {
    type: String,
    trim: true
  },
  semester: {
    type: Number,
    min: 1,
    max: 8
  },
  
  // Context vector for personalization
  context: {
    topicStrengths: {
      type: Map,
      of: Number, // Topic name -> proficiency score (0-100)
      default: new Map()
    },
    difficultyPreference: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'adaptive'],
      default: 'adaptive'
    },
    averageSpeed: {
      type: Number, // Seconds per question
      default: 60
    },
    totalTestsTaken: {
      type: Number,
      default: 0
    },
    lastAssessmentDate: {
      type: Date
    }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Tracking
  lastLogin: {
    type: Date
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to update context after assessment
userSchema.methods.updateContext = function(assessmentResults) {
  this.context.totalTestsTaken += 1;
  this.context.lastAssessmentDate = new Date();
  
  // Update topic strengths based on performance
  if (assessmentResults.topicScores) {
    assessmentResults.topicScores.forEach((score, topic) => {
      const currentScore = this.context.topicStrengths.get(topic) || 50;
      // Weighted average: 70% old score + 30% new score
      const updatedScore = (currentScore * 0.7) + (score * 0.3);
      this.context.topicStrengths.set(topic, Math.round(updatedScore));
    });
  }
  
  // Update average speed
  if (assessmentResults.averageTimePerQuestion) {
    const currentSpeed = this.context.averageSpeed;
    this.context.averageSpeed = Math.round(
      (currentSpeed * 0.7) + (assessmentResults.averageTimePerQuestion * 0.3)
    );
  }
};

const User = mongoose.model('User', userSchema);

export default User;
