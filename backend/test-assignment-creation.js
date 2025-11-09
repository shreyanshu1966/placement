const axios = require('axios');

async function testAssignmentCreation() {
  try {
    console.log('🧪 Testing Enhanced Assignment Creation...\n');
    
    // Test data - Updated with valid IDs from database
    const testAssignment = {
      courseId: '6910e31d4a18e8c34b2e5f93', // Data Structures and Algorithms
      selectedTopics: ['Arrays', 'Linked Lists'],
      assignedStudents: ['6910e3246368f5e52837d34e'], // Alice Johnson
      title: 'Test Assignment - Enhanced Question Generation',
      createdBy: 'test-faculty'
    };
    
    console.log('📝 Creating assignment with data:');
    console.log('- Course ID:', testAssignment.courseId);
    console.log('- Topics:', testAssignment.selectedTopics.join(', '));
    console.log('- Students:', testAssignment.assignedStudents.length);
    console.log('- Title:', testAssignment.title);
    
    // Create assignment
    const response = await axios.post('http://localhost:5000/api/assignments/create', testAssignment);
    
    console.log('\n✅ Assignment creation successful!');
    console.log('- Assignment ID:', response.data._id);
    console.log('- Questions Generated:', response.data.questionsGenerated?.length || 0);
    console.log('- Status:', response.data.status);
    
    if (response.data.questionsGenerated?.length > 0) {
      console.log('\n📋 Sample Questions:');
      response.data.questionsGenerated.slice(0, 2).forEach((q, index) => {
        console.log(`${index + 1}. ${q.question}`);
        console.log(`   Topic: ${q.topic}, Difficulty: ${q.difficulty}`);
        console.log(`   Options: ${q.options?.length || 0}`);
      });
    }
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Assignment creation failed:');
    console.error('- Error:', error.response?.data?.message || error.message);
    console.error('- Status:', error.response?.status);
    
    if (error.response?.data) {
      console.error('- Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    return null;
  }
}

async function testQuestionPreview() {
  try {
    console.log('\n🔍 Testing Question Preview...\n');
    
    const previewData = {
      courseId: '6910e31d4a18e8c34b2e5f93', // Data Structures and Algorithms
      selectedTopics: ['Arrays', 'Stacks'],
      questionsPerTopic: 2
    };
    
    console.log('📝 Generating preview for:');
    console.log('- Topics:', previewData.selectedTopics.join(', '));
    console.log('- Questions per topic:', previewData.questionsPerTopic);
    
    const response = await axios.post('http://localhost:5000/api/assignments/preview-questions', previewData);
    
    console.log('\n✅ Preview generation successful!');
    console.log('- Total questions:', response.data.questions?.length || 0);
    
    if (response.data.questions?.length > 0) {
      console.log('\n📋 Preview Questions:');
      response.data.questions.slice(0, 3).forEach((q, index) => {
        console.log(`${index + 1}. ${q.question}`);
        console.log(`   Topic: ${q.topic}, Difficulty: ${q.difficulty}`);
        console.log(`   Correct Answer: ${q.options?.[q.correctAnswer] || 'N/A'}`);
      });
    }
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Preview generation failed:');
    console.error('- Error:', error.response?.data?.message || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Enhanced Assignment System Tests\n');
  console.log('=' .repeat(50));
  
  // Test 1: Question Preview
  await testQuestionPreview();
  
  console.log('\n' + '=' .repeat(50));
  
  // Test 2: Assignment Creation
  const assignment = await testAssignmentCreation();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎯 Test Summary:');
  
  if (assignment && assignment.questionsGenerated?.length > 0) {
    console.log('✅ All tests passed! Enhanced assignment system is working.');
    console.log(`✅ Assignment created with ${assignment.questionsGenerated.length} questions.`);
  } else {
    console.log('❌ Tests failed. Please check the issues above.');
  }
  
  console.log('\n🏁 Test complete!');
}

runTests().catch(console.error);