const mongoose = require('mongoose');

const proctoringSuspicionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'tab_switch', 'window_blur', 'copy_paste', 'right_click', 
      'multiple_faces', 'no_face_detected', 'suspicious_movement',
      'external_device', 'network_change', 'fullscreen_exit',
      'keyboard_shortcut', 'developer_tools', 'screen_share'
    ],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  details: {
    type: String,
    default: ''
  },
  automaticAction: {
    type: String,
    enum: ['none', 'warning', 'flag', 'terminate'],
    default: 'none'
  }
});

const biometricDataSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  faceDetection: {
    detected: Boolean,
    confidence: Number,
    multipleFaces: Boolean,
    faceBounds: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    }
  },
  eyeTracking: {
    gazeDirection: String, // 'center', 'left', 'right', 'up', 'down'
    lookAwayDuration: Number // seconds
  },
  environmentAudio: {
    detected: Boolean,
    suspiciousNoises: Boolean,
    multipleVoices: Boolean
  }
});

const screenActivitySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  action: {
    type: String,
    enum: [
      'focus_gained', 'focus_lost', 'tab_switch', 'window_resize',
      'fullscreen_enter', 'fullscreen_exit', 'copy', 'paste',
      'right_click', 'key_combination', 'developer_tools',
      'print_screen', 'screen_capture'
    ]
  },
  details: String,
  duration: Number // milliseconds
});

const networkActivitySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['connection_change', 'speed_test', 'external_request', 'vpn_detected']
  },
  details: String,
  ipAddress: String,
  location: String
});

const proctorReviewSchema = new mongoose.Schema({
  reviewerId: {
    type: String,
    required: true
  },
  reviewedAt: {
    type: Date,
    default: Date.now
  },
  decision: {
    type: String,
    enum: ['approved', 'flagged', 'disqualified', 'needs_review'],
    required: true
  },
  notes: String,
  flaggedIncidents: [String], // Array of incident IDs
  overallRating: {
    type: Number,
    min: 1,
    max: 10
  }
});

const proctorConfigSchema = new mongoose.Schema({
  webcamRequired: {
    type: Boolean,
    default: true
  },
  screenRecording: {
    type: Boolean,
    default: true
  },
  audioMonitoring: {
    type: Boolean,
    default: false
  },
  faceDetection: {
    type: Boolean,
    default: true
  },
  eyeTracking: {
    type: Boolean,
    default: false
  },
  browserLockdown: {
    type: Boolean,
    default: true
  },
  preventCopyPaste: {
    type: Boolean,
    default: true
  },
  preventRightClick: {
    type: Boolean,
    default: true
  },
  preventTabSwitch: {
    type: Boolean,
    default: true
  },
  allowCalculator: {
    type: Boolean,
    default: false
  },
  allowNotes: {
    type: Boolean,
    default: false
  },
  maxSuspiciousActivities: {
    type: Number,
    default: 5
  },
  autoTerminateOnCritical: {
    type: Boolean,
    default: true
  },
  recordingQuality: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  monitoringInterval: {
    type: Number,
    default: 5000 // milliseconds
  }
});

const proctorSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  status: {
    type: String,
    enum: ['initialized', 'active', 'paused', 'completed', 'terminated', 'flagged'],
    default: 'initialized'
  },
  proctorConfig: proctorConfigSchema,
  
  // Monitoring Data
  suspiciousActivities: [proctoringSuspicionSchema],
  biometricData: [biometricDataSchema],
  screenActivity: [screenActivitySchema],
  networkActivity: [networkActivitySchema],
  
  // System Information
  browserInfo: {
    userAgent: String,
    screenResolution: String,
    timezone: String,
    language: String,
    platform: String
  },
  deviceInfo: {
    type: { type: String, enum: ['desktop', 'tablet', 'mobile', 'unknown'], default: 'unknown' },
    cameras: { type: Number, default: 0 },
    microphones: { type: Number, default: 0 },
    speakers: { type: Number, default: 0 }
  },
  
  // Recording Storage
  recordings: {
    webcam: {
      enabled: Boolean,
      chunks: [String], // URLs to video chunks
      totalDuration: Number
    },
    screen: {
      enabled: Boolean,
      chunks: [String], // URLs to screen recording chunks
      totalDuration: Number
    },
    audio: {
      enabled: Boolean,
      chunks: [String], // URLs to audio chunks
      totalDuration: Number
    }
  },
  
  // Security Metrics
  securityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  
  // AI Analysis
  aiAnalysis: {
    behaviorAnalysis: {
      normalBehavior: Boolean,
      suspiciousPatterns: [String],
      confidenceScore: Number
    },
    faceRecognition: {
      identityVerified: Boolean,
      multiplePersonsDetected: Boolean,
      confidenceScore: Number
    },
    environmentAnalysis: {
      appropriate: Boolean,
      distractions: [String],
      lighting: String // 'good', 'poor', 'inconsistent'
    }
  },
  
  // Review and Decision
  proctorReview: proctorReviewSchema,
  
  // Final Status
  finalDecision: {
    type: String,
    enum: ['pending', 'approved', 'flagged', 'disqualified'],
    default: 'pending'
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
proctorSessionSchema.index({ assignmentId: 1, studentId: 1 });
proctorSessionSchema.index({ status: 1 });
proctorSessionSchema.index({ riskLevel: 1 });
proctorSessionSchema.index({ finalDecision: 1 });
proctorSessionSchema.index({ startTime: -1 });

// Update timestamp on save
proctorSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for session duration
proctorSessionSchema.virtual('duration').get(function() {
  if (this.endTime && this.startTime) {
    return Math.floor((this.endTime - this.startTime) / 1000); // in seconds
  }
  return null;
});

// Virtual for suspicious activity count
proctorSessionSchema.virtual('suspiciousActivityCount').get(function() {
  return this.suspiciousActivities.length;
});

// Calculate risk level based on suspicious activities
proctorSessionSchema.methods.calculateRiskLevel = function() {
  const criticalCount = this.suspiciousActivities.filter(s => s.severity === 'critical').length;
  const highCount = this.suspiciousActivities.filter(s => s.severity === 'high').length;
  const mediumCount = this.suspiciousActivities.filter(s => s.severity === 'medium').length;
  
  if (criticalCount > 0) {
    this.riskLevel = 'critical';
    this.securityScore = Math.max(0, this.securityScore - criticalCount * 30);
  } else if (highCount > 2) {
    this.riskLevel = 'high';
    this.securityScore = Math.max(0, this.securityScore - highCount * 15);
  } else if (mediumCount > 5) {
    this.riskLevel = 'medium';
    this.securityScore = Math.max(0, this.securityScore - mediumCount * 5);
  }
  
  return this.riskLevel;
};

// Add suspicious activity
proctorSessionSchema.methods.addSuspiciousActivity = function(activity) {
  this.suspiciousActivities.push(activity);
  this.calculateRiskLevel();
  
  // Auto-terminate if configured and critical
  if (this.proctorConfig.autoTerminateOnCritical && activity.severity === 'critical') {
    this.status = 'terminated';
    this.endTime = new Date();
  }
  
  return this.save();
};

module.exports = mongoose.model('ProctoredSession', proctorSessionSchema);