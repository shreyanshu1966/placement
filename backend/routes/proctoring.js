const express = require('express');
const router = express.Router();
const ProctoredSession = require('../models/ProctoredSession');
const Assignment = require('../models/Assignment');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for recording uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/recordings');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sessionId = req.body.sessionId || 'unknown';
    const type = file.fieldname; // webcam, screen, audio
    cb(null, `${sessionId}_${type}_${timestamp}.webm`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/webm', 'audio/webm', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type for recording'));
    }
  }
});

// Initialize proctored session
router.post('/sessions/initialize', async (req, res) => {
  try {
    console.log('Initializing proctored session:', req.body);
    const { assignmentId, studentId, proctorConfig } = req.body;
    
    // Validate required fields
    if (!assignmentId || !studentId) {
      return res.status(400).json({ message: 'Assignment ID and Student ID are required' });
    }
    
    // Validate assignment exists and is proctored
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    console.log('Assignment found:', assignment.title);
    
    // Check if session already exists
    const existingSession = await ProctoredSession.findOne({
      assignmentId,
      studentId,
      status: { $in: ['initialized', 'active', 'paused'] }
    });
    
    if (existingSession) {
      console.log('Existing session found:', existingSession.sessionId);
      return res.status(200).json({ 
        sessionId: existingSession.sessionId,
        config: existingSession.proctorConfig,
        message: 'Using existing proctored session'
      });
    }
    
    // Generate unique session ID
    const sessionId = `proctor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Default proctoring configuration
    const defaultConfig = {
      webcamRequired: true,
      screenRecording: true,
      audioMonitoring: false,
      faceDetection: true,
      eyeTracking: false,
      browserLockdown: true,
      preventCopyPaste: true,
      preventRightClick: true,
      preventTabSwitch: true,
      allowCalculator: false,
      allowNotes: false,
      maxSuspiciousActivities: 5,
      autoTerminateOnCritical: true,
      recordingQuality: 'medium',
      monitoringInterval: 5000
    };
    
    console.log('Creating session with config:', { ...defaultConfig, ...proctorConfig });
    
    // Create proctored session with minimal required fields
    const sessionData = {
      sessionId,
      assignmentId,
      studentId,
      startTime: new Date(),
      proctorConfig: { ...defaultConfig, ...proctorConfig },
      browserInfo: req.body.browserInfo || {},
      deviceInfo: req.body.deviceInfo || {},
      recordings: {
        webcam: { enabled: false, chunks: [], totalDuration: 0 },
        screen: { enabled: false, chunks: [], totalDuration: 0 },
        audio: { enabled: false, chunks: [], totalDuration: 0 }
      },
      suspiciousActivities: [],
      biometricData: [],
      screenActivity: [],
      networkActivity: []
    };
    
    const session = new ProctoredSession(sessionData);
    await session.save();
    
    console.log('Session created successfully:', session.sessionId);
    
    res.status(201).json({
      sessionId: session.sessionId,
      config: session.proctorConfig,
      message: 'Proctored session initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing proctored session:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to initialize proctored session',
      error: error.message 
    });
  }
});

// Start proctored session
router.put('/sessions/:sessionId/start', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { systemCheck } = req.body;
    
    const session = await ProctoredSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Proctored session not found' });
    }
    
    if (session.status !== 'initialized') {
      return res.status(400).json({ message: 'Session cannot be started from current status' });
    }
    
    // Validate system requirements
    const requiredChecks = ['camera', 'microphone', 'screen'];
    const missingRequirements = requiredChecks.filter(check => !systemCheck[check]);
    
    if (missingRequirements.length > 0) {
      return res.status(400).json({
        message: 'System requirements not met',
        missing: missingRequirements
      });
    }
    
    session.status = 'active';
    session.startTime = new Date();
    await session.save();
    
    res.json({
      message: 'Proctored session started successfully',
      sessionId: session.sessionId,
      startTime: session.startTime
    });
  } catch (error) {
    console.error('Error starting proctored session:', error);
    res.status(500).json({ message: error.message });
  }
});

// Record suspicious activity
router.post('/sessions/:sessionId/suspicious-activity', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { type, severity, details } = req.body;
    
    const session = await ProctoredSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Proctored session not found' });
    }
    
    // Determine automatic action based on severity
    let automaticAction = 'none';
    switch (severity) {
      case 'critical':
        automaticAction = session.proctorConfig.autoTerminateOnCritical ? 'terminate' : 'flag';
        break;
      case 'high':
        automaticAction = 'flag';
        break;
      case 'medium':
        automaticAction = 'warning';
        break;
      default:
        automaticAction = 'none';
    }
    
    const suspiciousActivity = {
      type,
      severity,
      details,
      automaticAction,
      timestamp: new Date()
    };
    
    await session.addSuspiciousActivity(suspiciousActivity);
    
    // Check if max suspicious activities reached
    if (session.suspiciousActivities.length >= session.proctorConfig.maxSuspiciousActivities) {
      session.status = 'flagged';
      await session.save();
    }
    
    res.json({
      message: 'Suspicious activity recorded',
      action: automaticAction,
      riskLevel: session.riskLevel,
      securityScore: session.securityScore,
      shouldTerminate: automaticAction === 'terminate'
    });
  } catch (error) {
    console.error('Error recording suspicious activity:', error);
    res.status(500).json({ message: error.message });
  }
});

// Upload recording chunk
router.post('/sessions/:sessionId/upload-recording', upload.fields([
  { name: 'webcam', maxCount: 1 },
  { name: 'screen', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { chunkIndex, recordingType, duration } = req.body;
    
    const session = await ProctoredSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Proctored session not found' });
    }
    
    // Process uploaded files
    const uploadedFiles = {};
    if (req.files) {
      Object.keys(req.files).forEach(fieldname => {
        const file = req.files[fieldname][0];
        uploadedFiles[fieldname] = {
          filename: file.filename,
          path: file.path,
          size: file.size,
          duration: parseFloat(duration) || 0
        };
        
        // Add to session recordings
        if (!session.recordings[fieldname]) {
          session.recordings[fieldname] = { enabled: true, chunks: [], totalDuration: 0 };
        }
        session.recordings[fieldname].chunks.push(file.filename);
        session.recordings[fieldname].totalDuration += parseFloat(duration) || 0;
      });
    }
    
    await session.save();
    
    res.json({
      message: 'Recording chunk uploaded successfully',
      uploadedFiles,
      totalChunks: {
        webcam: session.recordings.webcam?.chunks.length || 0,
        screen: session.recordings.screen?.chunks.length || 0,
        audio: session.recordings.audio?.chunks.length || 0
      }
    });
  } catch (error) {
    console.error('Error uploading recording:', error);
    res.status(500).json({ message: error.message });
  }
});

// Record biometric data
router.post('/sessions/:sessionId/biometric-data', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { faceDetection, eyeTracking, environmentAudio } = req.body;
    
    const session = await ProctoredSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Proctored session not found' });
    }
    
    const biometricEntry = {
      timestamp: new Date(),
      faceDetection,
      eyeTracking,
      environmentAudio
    };
    
    session.biometricData.push(biometricEntry);
    
    // Analyze for suspicious patterns
    if (faceDetection && !faceDetection.detected) {
      await session.addSuspiciousActivity({
        type: 'no_face_detected',
        severity: 'medium',
        details: 'No face detected in webcam feed'
      });
    }
    
    if (faceDetection && faceDetection.multipleFaces) {
      await session.addSuspiciousActivity({
        type: 'multiple_faces',
        severity: 'high',
        details: 'Multiple faces detected in webcam feed'
      });
    }
    
    await session.save();
    
    res.json({ message: 'Biometric data recorded successfully' });
  } catch (error) {
    console.error('Error recording biometric data:', error);
    res.status(500).json({ message: error.message });
  }
});

// Record screen activity
router.post('/sessions/:sessionId/screen-activity', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { action, details, duration } = req.body;
    
    const session = await ProctoredSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Proctored session not found' });
    }
    
    const screenActivity = {
      timestamp: new Date(),
      action,
      details,
      duration
    };
    
    session.screenActivity.push(screenActivity);
    
    // Check for suspicious screen activities
    const suspiciousActions = ['tab_switch', 'window_resize', 'fullscreen_exit', 'copy', 'paste', 'developer_tools'];
    if (suspiciousActions.includes(action)) {
      let severity = 'medium';
      if (['developer_tools', 'copy', 'paste'].includes(action)) {
        severity = 'high';
      }
      
      await session.addSuspiciousActivity({
        type: action,
        severity,
        details: details || `Detected ${action} activity`
      });
    }
    
    await session.save();
    
    res.json({ message: 'Screen activity recorded successfully' });
  } catch (error) {
    console.error('Error recording screen activity:', error);
    res.status(500).json({ message: error.message });
  }
});

// End proctored session
router.put('/sessions/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;
    
    const session = await ProctoredSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Proctored session not found' });
    }
    
    session.status = reason === 'terminated' ? 'terminated' : 'completed';
    session.endTime = new Date();
    
    // Calculate final metrics
    session.calculateRiskLevel();
    
    // Set final decision based on analysis
    if (session.riskLevel === 'critical' || session.securityScore < 50) {
      session.finalDecision = 'flagged';
    } else if (session.riskLevel === 'high' || session.securityScore < 70) {
      session.finalDecision = 'flagged';
    } else {
      session.finalDecision = 'approved';
    }
    
    await session.save();
    
    res.json({
      message: 'Proctored session ended successfully',
      sessionId: session.sessionId,
      duration: session.duration,
      finalDecision: session.finalDecision,
      riskLevel: session.riskLevel,
      securityScore: session.securityScore,
      suspiciousActivities: session.suspiciousActivityCount
    });
  } catch (error) {
    console.error('Error ending proctored session:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get session details
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await ProctoredSession.findOne({ sessionId })
      .populate('assignmentId', 'title courseId timeLimit')
      .lean();
    
    if (!session) {
      return res.status(404).json({ message: 'Proctored session not found' });
    }
    
    // Add computed fields
    session.duration = session.endTime && session.startTime ? 
      Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 1000) : null;
    session.suspiciousActivityCount = session.suspiciousActivities.length;
    
    res.json(session);
  } catch (error) {
    console.error('Error fetching session details:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all sessions for an assignment (Faculty)
router.get('/assignments/:assignmentId/sessions', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status, riskLevel, page = 1, limit = 50 } = req.query;
    
    let filter = { assignmentId };
    if (status) filter.status = status;
    if (riskLevel) filter.riskLevel = riskLevel;
    
    const sessions = await ProctoredSession.find(filter)
      .populate('assignmentId', 'title courseId')
      .select('-biometricData -screenActivity -recordings.chunks') // Exclude large data
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const totalSessions = await ProctoredSession.countDocuments(filter);
    
    // Add computed fields
    sessions.forEach(session => {
      session.duration = session.endTime && session.startTime ? 
        Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 1000) : null;
      session.suspiciousActivityCount = session.suspiciousActivities.length;
    });
    
    res.json({
      sessions,
      totalSessions,
      currentPage: page,
      totalPages: Math.ceil(totalSessions / limit)
    });
  } catch (error) {
    console.error('Error fetching assignment sessions:', error);
    res.status(500).json({ message: error.message });
  }
});

// Real-time monitoring endpoint for faculty
router.get('/sessions/live/monitoring', async (req, res) => {
  try {
    const { assignmentId } = req.query;
    
    let filter = { status: 'active' };
    if (assignmentId) filter.assignmentId = assignmentId;
    
    const activeSessions = await ProctoredSession.find(filter)
      .populate('assignmentId', 'title courseId')
      .select('-biometricData -screenActivity -recordings')
      .sort({ startTime: -1 })
      .lean();
    
    // Add real-time metrics
    activeSessions.forEach(session => {
      session.duration = Math.floor((new Date() - new Date(session.startTime)) / 1000);
      session.suspiciousActivityCount = session.suspiciousActivities.length;
      session.recentActivity = session.suspiciousActivities.slice(-5);
    });
    
    res.json({
      activeSessions: activeSessions.length,
      sessions: activeSessions,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error fetching live monitoring data:', error);
    res.status(500).json({ message: error.message });
  }
});

// Proctor review endpoint
router.post('/sessions/:sessionId/review', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reviewerId, decision, notes, flaggedIncidents, overallRating } = req.body;
    
    const session = await ProctoredSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Proctored session not found' });
    }
    
    session.proctorReview = {
      reviewerId,
      reviewedAt: new Date(),
      decision,
      notes,
      flaggedIncidents,
      overallRating
    };
    
    session.finalDecision = decision;
    await session.save();
    
    res.json({
      message: 'Proctor review submitted successfully',
      sessionId: session.sessionId,
      finalDecision: session.finalDecision
    });
  } catch (error) {
    console.error('Error submitting proctor review:', error);
    res.status(500).json({ message: error.message });
  }
});

// Analytics endpoint
router.get('/analytics/summary', async (req, res) => {
  try {
    const { assignmentId, timeframe = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (timeframe) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    let filter = { startTime: { $gte: startDate } };
    if (assignmentId) filter.assignmentId = assignmentId;
    
    // Aggregate analytics data
    const analytics = await ProctoredSession.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          flaggedSessions: {
            $sum: { $cond: [{ $eq: ['$finalDecision', 'flagged'] }, 1, 0] }
          },
          terminatedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'terminated'] }, 1, 0] }
          },
          averageSecurityScore: { $avg: '$securityScore' },
          totalSuspiciousActivities: { $sum: { $size: '$suspiciousActivities' } }
        }
      }
    ]);
    
    const result = analytics[0] || {
      totalSessions: 0,
      completedSessions: 0,
      flaggedSessions: 0,
      terminatedSessions: 0,
      averageSecurityScore: 100,
      totalSuspiciousActivities: 0
    };
    
    // Risk distribution
    const riskDistribution = await ProctoredSession.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      summary: result,
      riskDistribution,
      timeframe,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;