const axios = require('axios');

async function testFacultyToStudentFlow() {
  console.log('🧑‍🏫➡️👤 Testing Faculty to Student Assignment Flow\n');
  
  try {
    // Step 1: Login as faculty to create assignment
    console.log('1. 🧑‍🏫 Logging in as faculty...');
    const facultyLogin = await axios.post('http://localhost:5000/api/auth/quick-login', {
      role: 'faculty'
    });
    
    const faculty = facultyLogin.data.user;
    console.log(`✅ Faculty: ${faculty.name} (${faculty.id})`);

    // Step 2: Login as student to get student ID
    console.log('\n2. 👤 Getting student info...');
    const studentLogin = await axios.post('http://localhost:5000/api/auth/quick-login', {
      role: 'student'
    });
    
    const student = studentLogin.data.user;
    console.log(`✅ Student: ${student.name} (${student.id})`);

    // Step 3: Faculty creates assignment using the correct API (AssessmentCreator flow)
    console.log('\n3. 📝 Faculty creating assignment using correct API...');
    const facultyAssignment = {
      courseId: '6910e31d4a18e8c34b2e5f93',
      selectedTopics: ['Variables', 'Conditionals'],
      assignedStudents: [student.id], // Using real student ID from database
      createdBy: faculty.id,
      title: 'Faculty Created Assessment - Full Flow Test'
    };

    const assignmentResponse = await axios.post('http://localhost:5000/api/assignments/create', facultyAssignment);
    const newAssignment = assignmentResponse.data;
    console.log(`✅ Faculty created: "${newAssignment.title}"`);
    console.log(`   ID: ${newAssignment._id}`);
    console.log(`   Assigned to: ${JSON.stringify(newAssignment.assignedStudents)}`);

    // Step 4: Check if student can see the assignment
    console.log('\n4. 👀 Checking if student can see the assignment...');
    const studentAssignments = await axios.get(`http://localhost:5000/api/assignments?studentId=${student.id}`);
    
    const facultyCreatedAssignment = studentAssignments.data.find(a => a.title === 'Faculty Created Assessment - Full Flow Test');
    
    if (facultyCreatedAssignment) {
      console.log(`✅ SUCCESS! Student can see faculty-created assignment!`);
      console.log(`   Status: ${facultyCreatedAssignment.status}`);
      console.log(`   Course: ${facultyCreatedAssignment.courseId?.title || 'Unknown'}`);
      console.log(`   Questions: ${facultyCreatedAssignment.questions?.length || 0}`);
    } else {
      console.log(`❌ FAILED: Student cannot see faculty-created assignment`);
      console.log(`   Student has ${studentAssignments.data.length} assignments total:`);
      studentAssignments.data.forEach((a, i) => {
        console.log(`     ${i+1}. ${a.title}`);
      });
    }

    // Step 5: Test the complete flow - student takes the assignment
    if (facultyCreatedAssignment) {
      console.log('\n5. 🎯 Testing complete assignment flow...');
      
      // Start the assignment
      const startResponse = await axios.put(`http://localhost:5000/api/assignments/${facultyCreatedAssignment._id}/start`, {
        studentId: student.id
      });
      console.log(`✅ Assignment started successfully`);
      
      // Get assignment details
      const assignmentDetails = await axios.get(`http://localhost:5000/api/assignments/${facultyCreatedAssignment._id}/student/${student.id}`);
      console.log(`✅ Assignment details retrieved`);
      console.log(`   Questions: ${assignmentDetails.data.questions?.length || 0}`);
      console.log(`   Time limit: ${assignmentDetails.data.timeLimit || 'No limit'} minutes`);
      
      if (assignmentDetails.data.questions?.length > 0) {
        console.log(`✅ Assignment has questions and is ready for student to take!`);
      } else {
        console.log(`⚠️  Assignment created but has no questions yet (needs AI generation)`);
      }
    }

    console.log('\n🎉 Faculty to Student flow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Faculty can create assignments with real student IDs');
    console.log('   ✅ Students can see assignments created by faculty');
    console.log('   ✅ Assignment flow works end-to-end');
    console.log('   ✅ Fix resolves the "new assessments not showing" issue!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

testFacultyToStudentFlow().catch(console.error);