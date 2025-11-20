#!/usr/bin/env node

// Comprehensive Proctored Exam System Demonstration
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

class ProctoredExamDemo {
  constructor() {
    this.assignmentId = null;
    this.sessionId = null;
    this.studentId = 'demo-student-001';
    this.facultyId = 'faculty-demo';
  }

  async runCompleteDemo() {
    console.log('🎓 PROCTORED EXAM SYSTEM DEMONSTRATION');
    console.log('=====================================\n');

    try {
      // Step 1: Faculty creates proctored assignment
      await this.step1_CreateProctoredAssignment();
      
      // Step 2: Student starts proctored exam
      await this.step2_InitializeProctoredSession();
      
      // Step 3: Simulate exam monitoring
      await this.step3_SimulateExamMonitoring();
      
      // Step 4: Faculty monitoring dashboard
      await this.step4_FacultyMonitoring();
      
      // Step 5: End exam and review
      await this.step5_EndExamAndReview();
      
      console.log('\n🎉 DEMONSTRATION COMPLETE!');
      console.log('✅ All proctored exam features demonstrated successfully');
      
    } catch (error) {
      console.error('❌ Demo failed:', error.message);
    }
  }

  async step1_CreateProctoredAssignment() {
    console.log('📝 STEP 1: Faculty Creates Proctored Assignment');
    console.log('-----------------------------------------------');
    
    try {
      // Get available courses
      const coursesRes = await axios.get(`${API_BASE}/courses`);
      const courseId = coursesRes.data[0]._id;
      console.log(`📚 Using course: ${coursesRes.data[0].title}`);
      
      // Create proctored assignment with full configuration
      const assignmentData = {
        courseId: courseId,
        selectedTopics: ['Arrays', 'Algorithms', 'Data Structures'],
        assignedStudents: [this.studentId, 'demo-student-002', 'demo-student-003'],
        createdBy: this.facultyId,
        title: '🔒 DEMO: Advanced Data Structures - Proctored Assessment',
        proctorConfig: {
          enabled: true,
          webcamRequired: true,
          screenRecording: true,
          audioMonitoring: true,
          faceDetection: true,
          eyeTracking: false,
          browserLockdown: true,
          preventCopyPaste: true,
          preventRightClick: true,
          preventTabSwitch: true,
          allowCalculator: false,
          allowNotes: false,
          maxSuspiciousActivities: 3,
          autoTerminateOnCritical: true,
          recordingQuality: 'high'
        }
      };
      
      const response = await axios.post(`${API_BASE}/assignments/create`, assignmentData);
      this.assignmentId = response.data._id;
      
      console.log('✅ Proctored assignment created successfully!');
      console.log(`📋 Assignment ID: ${this.assignmentId}`);
      console.log(`🔒 Proctoring enabled: ${response.data.proctorConfig?.enabled}`);
      console.log(`📹 Features enabled:`);
      console.log(`   - Webcam recording: ${response.data.proctorConfig?.webcamRequired}`);
      console.log(`   - Screen recording: ${response.data.proctorConfig?.screenRecording}`);
      console.log(`   - Face detection: ${response.data.proctorConfig?.faceDetection}`);
      console.log(`   - Browser lockdown: ${response.data.proctorConfig?.browserLockdown}`);
      console.log(`   - Max violations: ${response.data.proctorConfig?.maxSuspiciousActivities}`);
      console.log(`📊 Questions generated: ${response.data.questionsGenerated?.length}`);
      
    } catch (error) {
      console.error('❌ Failed to create assignment:', error.response?.data || error.message);
      throw error;
    }
    
    console.log('\n');
  }

  async step2_InitializeProctoredSession() {
    console.log('🧑‍🎓 STEP 2: Student Initializes Proctored Session');
    console.log('------------------------------------------------');
    
    try {
      // Initialize proctoring session
      const sessionData = {
        assignmentId: this.assignmentId,
        studentId: this.studentId,
        proctorConfig: {
          enabled: true,
          webcamRequired: true,
          screenRecording: true,
          faceDetection: true,
          browserLockdown: true
        },
        browserInfo: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.0.0',
          screenResolution: '1920x1080',
          timezone: 'America/New_York',
          language: 'en-US',
          platform: 'Win32'
        },
        deviceInfo: {
          type: 'desktop',
          cameras: 1,
          microphones: 1,
          speakers: 2
        }
      };
      
      const response = await axios.post(`${API_BASE}/proctoring/sessions/initialize`, sessionData);
      this.sessionId = response.data.sessionId;
      
      console.log('✅ Proctoring session initialized!');
      console.log(`🆔 Session ID: ${this.sessionId}`);
      console.log(`⚙️  Configuration loaded:`);
      console.log(`   - Webcam required: ${response.data.config.webcamRequired}`);
      console.log(`   - Screen recording: ${response.data.config.screenRecording}`);
      console.log(`   - Face detection: ${response.data.config.faceDetection}`);
      console.log(`   - Browser lockdown: ${response.data.config.browserLockdown}`);
      
      // Start the session
      const systemCheck = {
        camera: true,
        microphone: true,
        screen: true,
        browser: true,
        network: true
      };
      
      await axios.put(`${API_BASE}/proctoring/sessions/${this.sessionId}/start`, { systemCheck });
      console.log('🚀 Proctored session started with system validation!');
      
    } catch (error) {
      console.error('❌ Failed to initialize session:', error.response?.data || error.message);
      throw error;
    }
    
    console.log('\n');
  }

  async step3_SimulateExamMonitoring() {
    console.log('👁️  STEP 3: Simulating Real-Time Exam Monitoring');
    console.log('-----------------------------------------------');
    
    try {
      // Simulate biometric data collection
      console.log('📊 Collecting biometric data...');
      await axios.post(`${API_BASE}/proctoring/sessions/${this.sessionId}/biometric-data`, {
        timestamp: new Date(),
        faceDetection: {
          detected: true,
          confidence: 0.95,
          position: { x: 640, y: 360, width: 150, height: 200 },
          multipleFaces: false
        },
        eyeTracking: {
          gazeDirection: 'center',
          lookAwayDuration: 0
        },
        environmentAudio: {
          detected: true,
          suspiciousNoises: false,
          multipleVoices: false
        }
      });
      console.log('✅ Biometric data recorded - Student properly positioned');
      
      // Simulate screen activity
      console.log('🖥️  Recording screen activity...');
      await axios.post(`${API_BASE}/proctoring/sessions/${this.sessionId}/screen-activity`, {
        timestamp: new Date(),
        action: 'focus_gained',
        details: 'Student focused on exam window',
        duration: 1000
      });
      console.log('✅ Screen activity logged - Normal behavior');
      
      // Simulate a suspicious activity
      console.log('⚠️  Detecting suspicious activity...');
      await axios.post(`${API_BASE}/proctoring/sessions/${this.sessionId}/suspicious-activity`, {
        type: 'tab_switch',
        severity: 'medium',
        details: 'Student briefly switched to another tab',
        timestamp: new Date(),
        automaticAction: 'warning'
      });
      console.log('🚨 Suspicious activity flagged - Tab switching detected');
      
      // Simulate another violation
      await axios.post(`${API_BASE}/proctoring/sessions/${this.sessionId}/suspicious-activity`, {
        type: 'copy_paste',
        severity: 'high',
        details: 'Attempted to copy text from external source',
        timestamp: new Date(),
        automaticAction: 'flag'
      });
      console.log('🚨 High severity violation - Copy/paste attempt blocked');
      
      // Simulate face detection issue
      await axios.post(`${API_BASE}/proctoring/sessions/${this.sessionId}/suspicious-activity`, {
        type: 'no_face_detected',
        severity: 'medium',
        details: 'Face not visible for 15 seconds',
        timestamp: new Date(),
        automaticAction: 'warning'
      });
      console.log('🚨 Face detection alert - Student face not visible');
      
      console.log('📈 Monitoring data collected successfully!');
      
    } catch (error) {
      console.error('❌ Failed to record monitoring data:', error.response?.data || error.message);
      throw error;
    }
    
    console.log('\n');
  }

  async step4_FacultyMonitoring() {
    console.log('👨‍🏫 STEP 4: Faculty Real-Time Monitoring Dashboard');
    console.log('------------------------------------------------');
    
    try {
      // Get live monitoring data
      console.log('📡 Accessing live monitoring dashboard...');
      const liveRes = await axios.get(`${API_BASE}/proctoring/sessions/live/monitoring`);
      console.log(`✅ Live sessions found: ${liveRes.data.sessions?.length || 0}`);
      
      if (liveRes.data.sessions && liveRes.data.sessions.length > 0) {
        const session = liveRes.data.sessions.find(s => s.sessionId === this.sessionId);
        if (session) {
          console.log(`📊 Session Status: ${session.status}`);
          console.log(`⏱️  Duration: ${session.duration || 'calculating...'}`);
          console.log(`🚨 Violations: ${session.suspiciousActivities?.length || 0}`);
          console.log(`📈 Security Score: ${session.securityScore || 100}/100`);
        }
      }
      
      // Get session details
      console.log('📋 Retrieving detailed session information...');
      const sessionRes = await axios.get(`${API_BASE}/proctoring/sessions/${this.sessionId}`);
      const session = sessionRes.data;
      
      console.log('✅ Session details retrieved:');
      console.log(`   📅 Started: ${new Date(session.startTime).toLocaleString()}`);
      console.log(`   👤 Student: ${session.studentId}`);
      console.log(`   📊 Status: ${session.status}`);
      console.log(`   🚨 Suspicious activities: ${session.suspiciousActivities?.length || 0}`);
      console.log(`   📈 Security score: ${session.securityScore || 100}/100`);
      console.log(`   ⚠️  Risk level: ${session.riskLevel || 'low'}`);
      
      if (session.suspiciousActivities && session.suspiciousActivities.length > 0) {
        console.log('   🚨 Recent violations:');
        session.suspiciousActivities.slice(-3).forEach((activity, index) => {
          console.log(`      ${index + 1}. ${activity.type} (${activity.severity}) - ${activity.details}`);
        });
      }
      
      // Get assignment sessions
      console.log('📈 Checking all sessions for this assignment...');
      const assignmentSessionsRes = await axios.get(`${API_BASE}/proctoring/assignments/${this.assignmentId}/sessions`);
      console.log(`✅ Total sessions for assignment: ${assignmentSessionsRes.data.sessions?.length || 0}`);
      
    } catch (error) {
      console.error('❌ Failed to access monitoring dashboard:', error.response?.data || error.message);
      throw error;
    }
    
    console.log('\n');
  }

  async step5_EndExamAndReview() {
    console.log('📝 STEP 5: End Exam and Faculty Review');
    console.log('-------------------------------------');
    
    try {
      // End the proctoring session
      console.log('🏁 Ending proctoring session...');
      await axios.put(`${API_BASE}/proctoring/sessions/${this.sessionId}/end`, {
        reason: 'exam_completed',
        timestamp: new Date()
      });
      console.log('✅ Proctoring session ended successfully');
      
      // Faculty review
      console.log('👨‍🏫 Conducting faculty review...');
      await axios.post(`${API_BASE}/proctoring/sessions/${this.sessionId}/review`, {
        reviewerId: this.facultyId,
        decision: 'flagged',
        notes: 'Student had multiple suspicious activities including tab switching and copy/paste attempts. Recommend manual review of exam responses.',
        flaggedIncidents: ['tab_switch', 'copy_paste', 'no_face_detected'],
        overallRating: 6,
        timestamp: new Date()
      });
      console.log('✅ Faculty review completed');
      
      // Get final session summary
      console.log('📊 Generating final session report...');
      const finalSessionRes = await axios.get(`${API_BASE}/proctoring/sessions/${this.sessionId}`);
      const finalSession = finalSessionRes.data;
      
      console.log('\n📋 FINAL SESSION REPORT:');
      console.log('========================');
      console.log(`🆔 Session ID: ${finalSession.sessionId}`);
      console.log(`👤 Student: ${finalSession.studentId}`);
      console.log(`📅 Duration: ${new Date(finalSession.startTime).toLocaleString()} - ${new Date(finalSession.endTime).toLocaleString()}`);
      console.log(`📊 Final Status: ${finalSession.status}`);
      console.log(`📈 Security Score: ${finalSession.securityScore}/100`);
      console.log(`⚠️  Risk Level: ${finalSession.riskLevel}`);
      console.log(`🚨 Total Violations: ${finalSession.suspiciousActivities?.length || 0}`);
      
      if (finalSession.proctorReview) {
        console.log(`👨‍🏫 Faculty Decision: ${finalSession.proctorReview.decision}`);
        console.log(`📝 Faculty Notes: ${finalSession.proctorReview.notes}`);
        console.log(`⭐ Overall Rating: ${finalSession.proctorReview.overallRating}/10`);
      }
      
      // Get analytics summary
      console.log('\n📈 Getting system analytics...');
      const analyticsRes = await axios.get(`${API_BASE}/proctoring/analytics/summary`);
      const analytics = analyticsRes.data;
      
      console.log('\n📊 SYSTEM ANALYTICS SUMMARY:');
      console.log('============================');
      console.log(`📋 Total Sessions: ${analytics.totalSessions || 0}`);
      console.log(`✅ Completed Sessions: ${analytics.completedSessions || 0}`);
      console.log(`🚨 Flagged Sessions: ${analytics.flaggedSessions || 0}`);
      console.log(`📈 Average Security Score: ${analytics.averageSecurityScore || 100}/100`);
      console.log(`⚠️  Most Common Violation: ${analytics.commonViolations?.[0]?.type || 'None'}`);
      
    } catch (error) {
      console.error('❌ Failed to complete exam review:', error.response?.data || error.message);
      throw error;
    }
    
    console.log('\n');
  }
}

// Run the complete demonstration
async function main() {
  const demo = new ProctoredExamDemo();
  await demo.runCompleteDemo();
  
  console.log('\n🎯 DEMONSTRATION SUMMARY:');
  console.log('========================');
  console.log('✅ Assignment Creation - Faculty created proctored exam with full configuration');
  console.log('✅ Session Initialization - Student started proctored session with system checks');
  console.log('✅ Real-Time Monitoring - Biometric data, screen activity, and violations tracked');
  console.log('✅ Faculty Dashboard - Live monitoring and session management demonstrated');
  console.log('✅ Session Review - Complete faculty review and final reporting');
  console.log('\n🌟 All proctored exam features demonstrated successfully!');
  console.log('\n📱 Next: Open http://localhost:5174 to see the UI in action!');
}

// Execute demonstration
main().catch(console.error);