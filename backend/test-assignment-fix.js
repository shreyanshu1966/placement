const axios = require('axios');

async function testAssignmentFix() {
  console.log('🔧 Testing Assignment Display Fix\n');
  
  try {
    // Step 1: Login as student
    console.log('1. 👤 Logging in as demo student...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/quick-login', {
      role: 'student'
    });
    
    const student = loginResponse.data.user;
    console.log(`✅ Student: ${student.name} (${student.id})`);

    // Step 2: Create a new assignment with proper student ID format
    console.log('\n2. 📝 Creating assignment with correct student ID...');
    const newAssignmentData = {
      courseId: '6910e31d4a18e8c34b2e5f93',
      selectedTopics: ['Arrays', 'Loops'],
      assignedStudents: [student.id], // Using correct user.id format
      createdBy: 'test-faculty',
      title: 'Fixed Assignment Test'
    };

    const newAssignmentResponse = await axios.post('http://localhost:5000/api/assignments/create', newAssignmentData);
    const newAssignment = newAssignmentResponse.data;
    console.log(`✅ Created: "${newAssignment.title}"`);
    console.log(`   ID: ${newAssignment._id}`);
    console.log(`   Assigned to: ${JSON.stringify(newAssignment.assignedStudents)}`);

    // Step 3: Check if assignment appears for student
    console.log('\n3. 🔍 Checking student dashboard assignments...');
    const dashboardAssignments = await axios.get(`http://localhost:5000/api/assignments?studentId=${student.id}`);
    console.log(`✅ Student has ${dashboardAssignments.data.length} assignments`);
    
    const fixedAssignment = dashboardAssignments.data.find(a => a.title === 'Fixed Assignment Test');
    if (fixedAssignment) {
      console.log(`✅ SUCCESS: Fixed assignment appears on student dashboard!`);
      console.log(`   Status: ${fixedAssignment.status}`);
      console.log(`   Questions: ${fixedAssignment.questions?.length || 0}`);
    } else {
      console.log(`❌ FAILED: Fixed assignment does not appear on student dashboard`);
    }

    // Step 4: Compare with old hardcoded assignments
    console.log('\n4. 📊 Checking all assignments for this student...');
    dashboardAssignments.data.forEach((assignment, index) => {
      console.log(`   ${index + 1}. ${assignment.title} (${assignment.status})`);
      console.log(`      Created: ${new Date(assignment.createdAt).toLocaleString()}`);
    });

    // Step 5: Test creating another assignment with multiple students
    console.log('\n5. 🫂 Testing with multiple students...');
    const multiStudentData = {
      courseId: '6910e31d4a18e8c34b2e5f93',
      selectedTopics: ['Functions'],
      assignedStudents: [student.id, 'fake-student-id'], // Mix of real and fake
      createdBy: 'test-faculty',
      title: 'Multi-Student Test Assignment'
    };

    const multiAssignmentResponse = await axios.post('http://localhost:5000/api/assignments/create', multiStudentData);
    console.log(`✅ Created multi-student assignment: "${multiAssignmentResponse.data.title}"`);

    // Check if it appears for our student
    const updatedAssignments = await axios.get(`http://localhost:5000/api/assignments?studentId=${student.id}`);
    const multiAssignment = updatedAssignments.data.find(a => a.title === 'Multi-Student Test Assignment');
    if (multiAssignment) {
      console.log(`✅ SUCCESS: Multi-student assignment appears for our student!`);
    } else {
      console.log(`❌ FAILED: Multi-student assignment does not appear`);
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testAssignmentFix().catch(console.error);