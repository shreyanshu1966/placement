const axios = require('axios');

async function debugStudentAssignments() {
  console.log('🔍 Debugging Student Assignment Display Issue\n');
  
  try {
    // Step 1: Login as student
    console.log('1. 👤 Logging in as demo student...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/quick-login', {
      role: 'student'
    });
    
    const student = loginResponse.data.user;
    console.log(`✅ Student: ${student.name}`);
    console.log(`   ID: ${student.id}`);
    console.log(`   Student ID: ${student.studentId}`);
    console.log(`   Email: ${student.email}`);

    // Step 2: Check what assignments exist in database
    console.log('\n2. 📋 Checking all assignments in database...');
    const allAssignmentsResponse = await axios.get('http://localhost:5000/api/assignments');
    console.log(`   Total assignments in DB: ${allAssignmentsResponse.data.length}`);
    
    allAssignmentsResponse.data.forEach((assignment, index) => {
      console.log(`   Assignment ${index + 1}: ${assignment.title}`);
      console.log(`     ID: ${assignment._id}`);
      console.log(`     Assigned Students: ${JSON.stringify(assignment.assignedStudents)}`);
      console.log(`     Status: ${assignment.status}`);
      console.log(`     Created: ${new Date(assignment.createdAt).toLocaleString()}`);
    });

    // Step 3: Check assignments for this specific student using different ID formats
    console.log('\n3. 🔍 Testing assignment queries with different student ID formats...');
    
    // Test with user.id
    console.log(`\n   Testing with user.id: "${student.id}"`);
    try {
      const assignmentsById = await axios.get(`http://localhost:5000/api/assignments?studentId=${student.id}`);
      console.log(`   ✅ Found ${assignmentsById.data.length} assignments with user.id`);
    } catch (err) {
      console.log(`   ❌ Error with user.id: ${err.response?.data?.message || err.message}`);
    }

    // Test with user.studentId
    console.log(`\n   Testing with user.studentId: "${student.studentId}"`);
    try {
      const assignmentsByStudentId = await axios.get(`http://localhost:5000/api/assignments?studentId=${student.studentId}`);
      console.log(`   ✅ Found ${assignmentsByStudentId.data.length} assignments with user.studentId`);
    } catch (err) {
      console.log(`   ❌ Error with user.studentId: ${err.response?.data?.message || err.message}`);
    }

    // Test with email
    console.log(`\n   Testing with user.email: "${student.email}"`);
    try {
      const assignmentsByEmail = await axios.get(`http://localhost:5000/api/assignments?studentId=${student.email}`);
      console.log(`   ✅ Found ${assignmentsByEmail.data.length} assignments with user.email`);
    } catch (err) {
      console.log(`   ❌ Error with user.email: ${err.response?.data?.message || err.message}`);
    }

    // Step 4: Create a new assignment and check if it appears
    console.log('\n4. 📝 Creating new assignment for testing...');
    const newAssignmentData = {
      courseId: '6910e31d4a18e8c34b2e5f93',
      selectedTopics: ['Arrays'],
      assignedStudents: [student.id], // Using user.id format
      createdBy: 'debug-faculty',
      title: 'Debug Test Assignment'
    };

    const newAssignmentResponse = await axios.post('http://localhost:5000/api/assignments/create', newAssignmentData);
    const newAssignment = newAssignmentResponse.data;
    console.log(`✅ Created assignment: ${newAssignment.title}`);
    console.log(`   Assigned to: ${JSON.stringify(newAssignment.assignedStudents)}`);

    // Step 5: Test if new assignment appears for student
    console.log('\n5. 🔍 Testing if new assignment appears...');
    const updatedAssignments = await axios.get(`http://localhost:5000/api/assignments?studentId=${student.id}`);
    console.log(`✅ Student now has ${updatedAssignments.data.length} assignments`);
    
    updatedAssignments.data.forEach((assignment, index) => {
      console.log(`   Assignment ${index + 1}: ${assignment.title} (Status: ${assignment.status})`);
    });

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data?.message || error.message);
  }
}

debugStudentAssignments().catch(console.error);