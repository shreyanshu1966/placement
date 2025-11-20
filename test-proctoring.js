#!/usr/bin/env node

// Quick test script to verify proctored exam functionality
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testProctoredAssignment() {
  try {
    console.log('🔍 Testing Proctored Assignment Creation...');
    
    // First, get available courses
    const coursesRes = await axios.get(`${API_BASE}/courses`);
    console.log(`📚 Found ${coursesRes.data.length} courses`);
    
    if (coursesRes.data.length === 0) {
      console.log('❌ No courses found. Please create a course first.');
      return;
    }
    
    const courseId = coursesRes.data[0]._id;
    console.log(`📖 Using course: ${coursesRes.data[0].title}`);
    
    // Create a proctored assignment
    const assignmentData = {
      courseId: courseId,
      selectedTopics: ['Arrays', 'Algorithms'],
      assignedStudents: ['demo-student', 'test-student'],
      createdBy: 'faculty-user',
      title: 'Test Proctored Assignment',
      proctorConfig: {
        enabled: true,
        webcamRequired: true,
        screenRecording: true,
        faceDetection: true,
        browserLockdown: true,
        preventCopyPaste: true,
        preventRightClick: true,
        preventTabSwitch: true,
        maxSuspiciousActivities: 5,
        autoTerminateOnCritical: true
      }
    };
    
    console.log('🚀 Creating proctored assignment...');
    const assignmentRes = await axios.post(`${API_BASE}/assignments/create`, assignmentData);
    
    console.log('✅ Assignment created successfully!');
    console.log(`📝 Assignment ID: ${assignmentRes.data._id}`);
    console.log(`🔒 Proctoring enabled: ${assignmentRes.data.proctorConfig?.enabled}`);
    console.log(`📹 Webcam required: ${assignmentRes.data.proctorConfig?.webcamRequired}`);
    console.log(`🖥️  Screen recording: ${assignmentRes.data.proctorConfig?.screenRecording}`);
    
    // Test student access
    console.log('\n🧑‍🎓 Testing student access...');
    const studentRes = await axios.get(`${API_BASE}/assignments/${assignmentRes.data._id}/student/demo-student`);
    
    console.log('✅ Student can access assignment!');
    console.log(`🔒 Proctoring status: ${studentRes.data.proctorConfig?.enabled ? 'ENABLED' : 'DISABLED'}`);
    
    if (studentRes.data.proctorConfig?.enabled) {
      console.log('\n🎉 SUCCESS! Proctored exam is properly configured and accessible!');
      console.log('\n📋 Next steps:');
      console.log('1. Go to http://localhost:5174');
      console.log('2. Login as a student');
      console.log('3. Look for the assignment with "Proctored" badge');
      console.log('4. Click "Start Proctored Test"');
    } else {
      console.log('❌ ISSUE: Proctoring not enabled on student side');
    }
    
  } catch (error) {
    console.error('❌ Error testing proctored assignment:', error.response?.data || error.message);
  }
}

// Run the test
testProctoredAssignment();