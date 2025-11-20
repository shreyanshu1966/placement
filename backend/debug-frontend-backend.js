const axios = require('axios');

async function debugFrontendBackendMismatch() {
  console.log('🔍 Debugging Frontend-Backend Authentication Mismatch\n');
  
  try {
    // Step 1: Test the quick-login endpoint that frontend uses
    console.log('1. 🧪 Testing frontend quick-login flow...');
    const quickLoginResponse = await axios.post('http://localhost:5000/api/auth/quick-login', {
      role: 'student'
    });
    
    console.log('✅ Quick login response structure:');
    console.log(`   user.id: ${quickLoginResponse.data.user.id}`);
    console.log(`   user._id: ${quickLoginResponse.data.user._id}`);
    console.log(`   user.studentId: ${quickLoginResponse.data.user.studentId}`);
    console.log(`   user.email: ${quickLoginResponse.data.user.email}`);
    console.log(`   user.name: ${quickLoginResponse.data.user.name}`);
    console.log(`   user.role: ${quickLoginResponse.data.user.role}`);
    
    const studentUser = quickLoginResponse.data.user;
    
    // Step 2: Test what the StudentDashboard would use
    console.log('\n2. 🎯 Testing StudentDashboard logic...');
    
    // This mimics the logic in StudentDashboard.jsx line 19:
    // const studentId = user?.id || user?.studentId || 'demo-student';
    let frontendStudentId = studentUser?.id || studentUser?.studentId || 'demo-student';
    console.log(`Frontend would use studentId: "${frontendStudentId}"`);
    
    // Step 3: Test the assignment API call that frontend makes
    console.log('\n3. 📡 Testing assignment API call frontend makes...');
    const frontendApiCall = await axios.get(`http://localhost:5000/api/assignments?studentId=${frontendStudentId}`);
    console.log(`✅ Frontend API call result: ${frontendApiCall.data.length} assignments`);
    
    // Step 4: Create assignment and test if frontend would see it
    console.log('\n4. 📝 Creating assignment specifically for frontend test...');
    const testAssignmentData = {
      courseId: '6910e31d4a18e8c34b2e5f93',
      selectedTopics: ['Testing'],
      assignedStudents: [frontendStudentId], // Using what frontend would use
      createdBy: 'frontend-test',
      title: `Frontend Test Assignment - ${new Date().toLocaleTimeString()}`
    };

    const testAssignmentResponse = await axios.post('http://localhost:5000/api/assignments/create', testAssignmentData);
    console.log(`✅ Created test assignment: "${testAssignmentResponse.data.title}"`);
    
    // Step 5: Check if frontend would see the new assignment
    console.log('\n5. 👀 Check if frontend would see new assignment...');
    const frontendCheckResponse = await axios.get(`http://localhost:5000/api/assignments?studentId=${frontendStudentId}`);
    const frontendTestAssignment = frontendCheckResponse.data.find(a => a.title.includes('Frontend Test Assignment'));
    
    if (frontendTestAssignment) {
      console.log(`✅ SUCCESS: Frontend would see the new assignment!`);
    } else {
      console.log(`❌ PROBLEM: Frontend would NOT see the new assignment!`);
    }
    
    // Step 6: Check what happens if we use different student ID formats
    console.log('\n6. 🔧 Testing edge cases...');
    
    // Test with user._id instead of user.id
    if (studentUser._id && studentUser._id !== studentUser.id) {
      console.log(`Testing with user._id: "${studentUser._id}"`);
      const idTestResponse = await axios.get(`http://localhost:5000/api/assignments?studentId=${studentUser._id}`);
      console.log(`   Result: ${idTestResponse.data.length} assignments`);
    }
    
    // Test with empty/null studentId
    try {
      const nullTestResponse = await axios.get(`http://localhost:5000/api/assignments?studentId=`);
      console.log(`   Empty studentId result: ${nullTestResponse.data.length} assignments`);
    } catch (err) {
      console.log(`   Empty studentId error: ${err.response?.status || err.message}`);
    }

    console.log('\n📋 Summary:');
    console.log(`   Frontend studentId logic: user?.id || user?.studentId || 'demo-student'`);
    console.log(`   Resolved to: "${frontendStudentId}"`);
    console.log(`   API assignments found: ${frontendCheckResponse.data.length}`);
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
  }
}

debugFrontendBackendMismatch().catch(console.error);