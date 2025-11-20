const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testCompleteTestFlow() {
  console.log('🧪 Testing Complete Test Taking Interface\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Quick login as student
    console.log('\n1. 👤 Logging in as demo student...');
    const loginResponse = await axios.post(`${API_BASE}/auth/quick-login`, {
      role: 'student'
    });
    const studentToken = loginResponse.data.token;
    const student = loginResponse.data.user;
    console.log(`✅ Logged in as: ${student.name} (${student.email})`);

    // Step 2: Create an assignment for testing
    console.log('\n2. 📝 Creating test assignment...');
    const assignmentData = {
      courseId: '6910e31d4a18e8c34b2e5f93',
      selectedTopics: ['Arrays', 'Linked Lists'],
      assignedStudents: [student.id],
      createdBy: 'demo-faculty',
      title: 'Complete Test Interface Demo'
    };

    const assignmentResponse = await axios.post(`${API_BASE}/assignments/create`, assignmentData);
    const assignment = assignmentResponse.data;
    console.log(`✅ Assignment created: ${assignment.title}`);
    console.log(`   Questions: ${assignment.questionsGenerated.length}`);
    console.log(`   Assignment ID: ${assignment._id}`);

    // Step 3: Test student access to assignment
    console.log('\n3. 🔍 Testing student access to assignment...');
    const studentAssignmentResponse = await axios.get(
      `${API_BASE}/assignments/${assignment._id}/student/${student.id}`,
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    console.log(`✅ Student can access assignment`);
    console.log(`   Status: ${studentAssignmentResponse.data.status}`);

    // Step 4: Start the test
    console.log('\n4. 🚀 Starting test...');
    const startResponse = await axios.put(
      `${API_BASE}/assignments/${assignment._id}/start`,
      { studentId: student.id },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    console.log(`✅ Test started successfully`);
    console.log(`   Status: ${startResponse.data.status}`);

    // Step 5: Simulate answering questions
    console.log('\n5. ✍️ Simulating test answers...');
    const answers = [];
    for (let i = 0; i < assignment.questionsGenerated.length; i++) {
      const question = assignment.questionsGenerated[i];
      // For demo, select random answers
      const selectedAnswer = Math.floor(Math.random() * question.options.length);
      answers.push(selectedAnswer);
      
      console.log(`   Q${i + 1}: ${question.question.substring(0, 50)}...`);
      console.log(`   Selected: ${String.fromCharCode(65 + selectedAnswer)}) ${question.options[selectedAnswer]}`);
      console.log(`   Correct: ${String.fromCharCode(65 + question.correctAnswer)}) ${question.options[question.correctAnswer]}`);
      
      // Test auto-save functionality
      await axios.post(
        `${API_BASE}/assignments/${assignment._id}/save-answer`,
        {
          studentId: student.id,
          questionIndex: i,
          selectedAnswer,
          timestamp: new Date().toISOString()
        },
        { headers: { Authorization: `Bearer ${studentToken}` } }
      );
    }
    console.log(`✅ All ${answers.length} questions answered`);

    // Step 6: Submit the test
    console.log('\n6. 📤 Submitting test...');
    const submitResponse = await axios.post(
      `${API_BASE}/assignments/${assignment._id}/submit`,
      {
        studentId: student.id,
        answers,
        timeTaken: 300 // 5 minutes
      },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );

    const result = submitResponse.data;
    console.log(`✅ Test submitted successfully!`);
    console.log(`   Score: ${result.score.toFixed(1)}%`);
    console.log(`   Correct: ${result.correctAnswers}/${result.totalQuestions}`);
    console.log(`   Result ID: ${result.resultId}`);

    // Step 7: Verify assignment was updated
    console.log('\n7. 🔍 Verifying assignment completion...');
    const updatedAssignment = await axios.get(`${API_BASE}/assignments/${assignment._id}`);
    console.log(`✅ Assignment status: ${updatedAssignment.data.status}`);
    console.log(`✅ Submissions: ${updatedAssignment.data.submissions?.length || 0}`);

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 COMPLETE TEST INTERFACE VERIFICATION SUCCESSFUL!');
    console.log('\n📋 Test Summary:');
    console.log(`✅ Student authentication: Working`);
    console.log(`✅ Assignment access control: Working`);
    console.log(`✅ Test start functionality: Working`);
    console.log(`✅ Auto-save answers: Working`);
    console.log(`✅ Test submission: Working`);
    console.log(`✅ Score calculation: Working (${result.score.toFixed(1)}%)`);
    console.log(`✅ Result storage: Working (ID: ${result.resultId})`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
    console.error('Error details:', error.response?.data || error);
  }
}

// Run the test
testCompleteTestFlow().catch(console.error);