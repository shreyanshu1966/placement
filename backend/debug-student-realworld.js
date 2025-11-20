const axios = require('axios');

async function debugStudentDashboardRealWorld() {
  console.log('🔍 Debugging Real-World Student Dashboard Issue\n');
  
  try {
    // Step 1: Check what students actually exist in the database
    console.log('1. 📊 Checking what students exist in database...');
    
    // Step 2: Login as demo student 
    console.log('\n2. 🔐 Login as demo student...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/quick-login', {
      role: 'student'
    });
    
    const student = loginResponse.data.user;
    console.log(`✅ Student logged in:`);
    console.log(`   Name: ${student.name}`);
    console.log(`   ID: ${student.id}`);
    console.log(`   Student ID: ${student.studentId}`);
    console.log(`   Email: ${student.email}`);

    // Step 3: Check assignments with different ID formats that frontend might use
    console.log('\n3. 🔍 Testing different student ID formats...');
    
    // Test with user.id (should be correct)
    const assignmentsById = await axios.get(`http://localhost:5000/api/assignments?studentId=${student.id}`);
    console.log(`   Using user.id "${student.id}": ${assignmentsById.data.length} assignments`);
    
    // Test with user.studentId (fallback in frontend)
    const assignmentsByStudentId = await axios.get(`http://localhost:5000/api/assignments?studentId=${student.studentId}`);
    console.log(`   Using user.studentId "${student.studentId}": ${assignmentsByStudentId.data.length} assignments`);
    
    // Test with email (another fallback)
    const assignmentsByEmail = await axios.get(`http://localhost:5000/api/assignments?studentId=${student.email}`);
    console.log(`   Using user.email "${student.email}": ${assignmentsByEmail.data.length} assignments`);

    // Step 4: Create a fresh assignment RIGHT NOW and test immediately
    console.log('\n4. 📝 Creating fresh assignment RIGHT NOW...');
    const newAssignmentData = {
      courseId: '6910e31d4a18e8c34b2e5f93',
      selectedTopics: ['Variables'],
      assignedStudents: [student.id],
      createdBy: 'test-faculty-live',
      title: `Live Test Assignment - ${new Date().toLocaleTimeString()}`
    };

    const newAssignmentResponse = await axios.post('http://localhost:5000/api/assignments/create', newAssignmentData);
    const newAssignment = newAssignmentResponse.data;
    console.log(`✅ Created: "${newAssignment.title}"`);
    console.log(`   Assigned to: ${JSON.stringify(newAssignment.assignedStudents)}`);

    // Step 5: Immediately check if it appears
    console.log('\n5. ⚡ IMMEDIATE check if new assignment appears...');
    const immediateCheck = await axios.get(`http://localhost:5000/api/assignments?studentId=${student.id}`);
    const liveAssignment = immediateCheck.data.find(a => a.title.includes('Live Test Assignment'));
    
    if (liveAssignment) {
      console.log(`✅ SUCCESS: Live assignment appears immediately!`);
    } else {
      console.log(`❌ PROBLEM: Live assignment NOT appearing!`);
    }

    // Step 6: List ALL assignments for debugging
    console.log('\n6. 📋 ALL assignments for this student:');
    immediateCheck.data.forEach((assignment, index) => {
      console.log(`   ${index + 1}. "${assignment.title}"`);
      console.log(`      Status: ${assignment.status}`);
      console.log(`      Created: ${new Date(assignment.createdAt).toLocaleString()}`);
      console.log(`      Assigned to: ${JSON.stringify(assignment.assignedStudents)}`);
      console.log(`      Course: ${assignment.courseId?.title || assignment.courseId}`);
      console.log('');
    });

    // Step 7: Check if there's a frontend caching issue
    console.log('\n7. 🔄 Testing for caching issues by making multiple requests...');
    for (let i = 0; i < 3; i++) {
      const testResponse = await axios.get(`http://localhost:5000/api/assignments?studentId=${student.id}`);
      console.log(`   Request ${i+1}: ${testResponse.data.length} assignments`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
  }
}

debugStudentDashboardRealWorld().catch(console.error);