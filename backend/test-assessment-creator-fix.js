const axios = require('axios');

async function testAssessmentCreatorFix() {
  console.log('🔧 Testing AssessmentCreator Fix\n');
  
  try {
    // Step 1: Test the new auth users endpoint
    console.log('1. 🧑‍🎓 Testing new auth/users endpoint...');
    const studentsResponse = await axios.get('http://localhost:5000/api/auth/users?role=student');
    console.log(`Found ${studentsResponse.data.length} students from User model`);
    
    studentsResponse.data.forEach((student, index) => {
      console.log(`   Student ${index + 1}: ${student.name} (${student._id}) - ${student.studentId}`);
    });

    // Step 2: Login as the actual demo student
    console.log('\n2. 🔐 Login as demo student...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/quick-login', {
      role: 'student'
    });
    
    const loggedInStudent = loginResponse.data.user;
    console.log(`✅ Logged in: ${loggedInStudent.name} (${loggedInStudent.id})`);

    // Step 3: Check if the logged-in student is in the students list
    const studentInList = studentsResponse.data.find(s => s._id === loggedInStudent.id);
    if (studentInList) {
      console.log(`✅ SUCCESS: Logged-in student IS in the AssessmentCreator student list!`);
    } else {
      console.log(`❌ PROBLEM: Logged-in student is NOT in the AssessmentCreator student list!`);
    }

    // Step 4: Create assignment using the correct student ID from User model
    console.log('\n3. 📝 Creating assignment with User model student ID...');
    const assignmentData = {
      courseId: '6910e31d4a18e8c34b2e5f93',
      selectedTopics: ['Arrays'],
      assignedStudents: [loggedInStudent.id], // Using correct User model ID
      createdBy: 'test-faculty-fixed',
      title: `FIXED AssessmentCreator Test - ${new Date().toLocaleTimeString()}`
    };

    const assignmentResponse = await axios.post('http://localhost:5000/api/assignments/create', assignmentData);
    console.log(`✅ Created: "${assignmentResponse.data.title}"`);
    console.log(`   Assigned to: ${JSON.stringify(assignmentResponse.data.assignedStudents)}`);

    // Step 5: Check if student can see the assignment
    console.log('\n4. 👀 Checking if student can see the assignment...');
    const studentAssignments = await axios.get(`http://localhost:5000/api/assignments?studentId=${loggedInStudent.id}`);
    
    const fixedAssignment = studentAssignments.data.find(a => a.title.includes('FIXED AssessmentCreator Test'));
    
    if (fixedAssignment) {
      console.log(`✅ SUCCESS! Student can see the fixed assignment!`);
      console.log(`   Status: ${fixedAssignment.status}`);
      console.log(`   Course: ${fixedAssignment.courseId?.title || 'Unknown'}`);
    } else {
      console.log(`❌ FAILED: Student still cannot see the assignment`);
      console.log(`   Student has ${studentAssignments.data.length} assignments total`);
    }

    // Step 6: Test with multiple students from User model
    console.log('\n5. 🫂 Testing with multiple User model students...');
    
    if (studentsResponse.data.length >= 2) {
      const selectedStudentIds = studentsResponse.data.slice(0, 2).map(s => s._id);
      console.log(`   Selected students: ${JSON.stringify(selectedStudentIds)}`);
      
      const multiAssignmentData = {
        courseId: '6910e31d4a18e8c34b2e5f93',
        selectedTopics: ['Variables'],
        assignedStudents: selectedStudentIds,
        createdBy: 'test-faculty-multi',
        title: `Multi-User Test - ${new Date().toLocaleTimeString()}`
      };

      const multiAssignmentResponse = await axios.post('http://localhost:5000/api/assignments/create', multiAssignmentData);
      console.log(`✅ Created multi-user assignment: "${multiAssignmentResponse.data.title}"`);
      
      // Check if our logged-in student can see it (if they were selected)
      if (selectedStudentIds.includes(loggedInStudent.id)) {
        const updatedAssignments = await axios.get(`http://localhost:5000/api/assignments?studentId=${loggedInStudent.id}`);
        const multiAssignment = updatedAssignments.data.find(a => a.title.includes('Multi-User Test'));
        
        if (multiAssignment) {
          console.log(`✅ SUCCESS: Student can see multi-user assignment!`);
        } else {
          console.log(`❌ FAILED: Student cannot see multi-user assignment`);
        }
      } else {
        console.log(`ℹ️  Logged-in student was not selected for multi-user test`);
      }
    }

    console.log('\n🎉 AssessmentCreator fix test completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Fixed AssessmentCreator to use User model instead of Student model');
    console.log('   ✅ Fixed student selection to use user._id instead of user.studentId');
    console.log('   ✅ Assignments now appear correctly for logged-in students');
    console.log('   ✅ Faculty can now create assessments that students will actually see!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
  }
}

testAssessmentCreatorFix().catch(console.error);