import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true,
    maxlength: [100, 'Course title cannot be more than 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Please provide a course code'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  department: {
    type: String,
    required: [true, 'Please specify department'],
    trim: true
  },
  semester: {
    type: Number,
    required: [true, 'Please specify semester'],
    min: 1,
    max: 8
  },
  credits: {
    type: Number,
    required: [true, 'Please specify credits'],
    min: 1,
    max: 10
  },
  
  // Faculty assigned
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Syllabus structure
  syllabus: [{
    unit: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    topics: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      description: String,
      weightage: {
        type: Number,
        min: 0,
        max: 100,
        default: 10
      }
    }],
    duration: {
      type: Number, // in hours
      required: true
    }
  }],
  
  // Learning outcomes
  learningOutcomes: [{
    type: String,
    trim: true
  }],
  
  // Reference materials
  references: [{
    type: {
      type: String,
      enum: ['book', 'article', 'video', 'website', 'paper'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    author: String,
    url: String,
    description: String
  }],
  
  // Progress tracking
  studentsEnrolled: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledDate: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    completedTopics: [{
      type: String
    }]
  }],
  
  // Course metadata
  academicYear: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
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

// Index for faster queries
courseSchema.index({ code: 1 });
courseSchema.index({ department: 1, semester: 1 });
courseSchema.index({ faculty: 1 });

// Method to get all topics from syllabus
courseSchema.methods.getAllTopics = function() {
  const topics = [];
  this.syllabus.forEach(unit => {
    unit.topics.forEach(topic => {
      topics.push({
        unit: unit.unit,
        unitTitle: unit.title,
        topicName: topic.name,
        weightage: topic.weightage
      });
    });
  });
  return topics;
};

// Method to calculate total weightage
courseSchema.methods.getTotalWeightage = function() {
  let total = 0;
  this.syllabus.forEach(unit => {
    unit.topics.forEach(topic => {
      total += topic.weightage || 0;
    });
  });
  return total;
};

const Course = mongoose.model('Course', courseSchema);

export default Course;
