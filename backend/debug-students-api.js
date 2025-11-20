const axios = require('axios');

async function debugStudentsAPI() {
  console.log('🧑‍🎓 Debugging Students API\n');
  
  try {
    // Step 1: Check what students API returns
    console.log('1. 📊 Checking students API response...');
    const studentsResponse = await axios.get('http://localhost:5000/api/students');
    console.log(`Found ${studentsResponse.data.length} students`);
    
    studentsResponse.data.forEach((student, index) => {
      console.log(`\n   Student ${index + 1}:`);
      console.log(`     id: ${student._id || student.id}`);
      console.log(`     studentId: ${student.studentId}`);
      console.log(`     name: ${student.name}`);
      console.log(`     email: ${student.email}`);
    });

    // Step 2: Check what students API returns for a specific course
    console.log('\n2. 📚 Checking students for specific course...');
    const courseStudentsResponse = await axios.get('http://localhost:5000/api/students?courseId=6910e31d4a18e8c34b2e5f93');
    console.log(`Found ${courseStudentsResponse.data.length} students for this course`);
    
    courseStudentsResponse.data.forEach((student, index) => {
      console.log(`\n   Course Student ${index + 1}:`);
      console.log(`     id: ${student._id || student.id}`);
      console.log(`     studentId: ${student.studentId}`);
      console.log(`     name: ${student.name}`);
      console.log(`     email: ${student.email}`);
    });

    // Step 3: Compare with User model (what authentication uses)
    console.log('\n3. 🔐 Checking User model for comparison...');
    const userLoginResponse = await axios.post('http://localhost:5000/api/auth/quick-login', {
      role: 'student'
    });
    
    const userStudent = userLoginResponse.data.user;
    console.log(`\n   User model student:`);
    console.log(`     id: ${userStudent.id}`);
    console.log(`     studentId: ${userStudent.studentId}`);
    console.log(`     name: ${userStudent.name}`);
    console.log(`     email: ${userStudent.email}`);

    // Step 4: Test the mismatch scenario
    console.log('\n4. ⚠️  Testing the ID mismatch scenario...');
    
    if (courseStudentsResponse.data.length > 0) {
      const testStudent = courseStudentsResponse.data[0];
      const testStudentId = testStudent.studentId; // This is what AssessmentCreator uses
      const testStudentDbId = testStudent._id || testStudent.id; // This is what should be used
      
      console.log(`\n   Testing assignment creation with student.studentId: "${testStudentId}"`);
      
      // Create assignment with studentId (wrong way)
      const wrongAssignmentData = {
        courseId: '6910e31d4a18e8c34b2e5f93',
        selectedTopics: ['Testing'],
        assignedStudents: [testStudentId], // Using studentId (wrong!)
        createdBy: 'debug-faculty',
        title: `Wrong ID Test - ${new Date().toLocaleTimeString()}`
      };

      const wrongAssignmentResponse = await axios.post('http://localhost:5000/api/assignments/create', wrongAssignmentData);
      console.log(`   ✅ Created assignment with studentId: "${wrongAssignmentResponse.data.title}"`);
      
      // Test if user can see this assignment
      const userCheckResponse = await axios.get(`http://localhost:5000/api/assignments?studentId=${userStudent.id}`);
      const wrongAssignment = userCheckResponse.data.find(a => a.title.includes('Wrong ID Test'));
      
      if (wrongAssignment) {
        console.log(`   ✅ User CAN see assignment created with studentId`);
      } else {
        console.log(`   ❌ User CANNOT see assignment created with studentId`);
      }
      
      console.log(`\n   Testing assignment creation with student._id: "${testStudentDbId}"`);
      
      // Create assignment with _id (correct way)
      const correctAssignmentData = {
        courseId: '6910e31d4a18e8c34b2e5f93',
        selectedTopics: ['Testing'],
        assignedStudents: [testStudentDbId], // Using _id (correct!)
        createdBy: 'debug-faculty',
        title: `Correct ID Test - ${new Date().toLocaleTimeString()}`
      };

      const correctAssignmentResponse = await axios.post('http://localhost:5000/api/assignments/create', correctAssignmentData);
      console.log(`   ✅ Created assignment with _id: "${correctAssignmentResponse.data.title}"`);
      
      // Test if user can see this assignment
      const userCheckResponse2 = await axios.get(`http://localhost:5000/api/assignments?studentId=${userStudent.id}`);
      const correctAssignment = userCheckResponse2.data.find(a => a.title.includes('Correct ID Test'));
      
      if (correctAssignment) {
        console.log(`   ✅ User CAN see assignment created with _id`);
      } else {
        console.log(`   ❌ User CANNOT see assignment created with _id`);
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
  }
}

debugStudentsAPI().catch(console.error);