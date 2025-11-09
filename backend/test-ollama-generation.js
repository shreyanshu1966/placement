const axios = require('axios');

async function testOllamaQuestionGeneration() {
  try {
    console.log('🧪 Testing Ollama Question Generation...\n');
    
    // Test 1: Direct Ollama connection
    console.log('1. Testing direct Ollama connection...');
    try {
      const ollamaTest = await axios.get('http://localhost:11434/api/tags');
      console.log('✅ Ollama is running');
      console.log(`   Available models: ${ollamaTest.data.models.map(m => m.name).join(', ')}`);
    } catch (err) {
      console.log('❌ Ollama connection failed:', err.message);
      return;
    }
    
    // Test 2: Our question generation API
    console.log('\n2. Testing our question generation API...');
    const response = await axios.post('http://localhost:5000/api/questions/generate', {
      topic: 'Arrays',
      difficulty: 'medium',
      count: 2,
      courseId: '6910e31d4a18e8c34b2e5f93'
    });
    
    console.log('Response:', response.data);
    
    if (response.data.questions && response.data.questions.length > 0) {
      console.log('✅ Question generation successful!');
      console.log(`   Generated ${response.data.questions.length} questions`);
      console.log(`   Source: ${response.data.source} (AI: ${response.data.ollamaConnected})`);
      
      response.data.questions.forEach((q, index) => {
        console.log(`\n   Question ${index + 1}:`);
        console.log(`   Q: ${q.question}`);
        console.log(`   Topic: ${q.topic}, Difficulty: ${q.difficulty}`);
        if (q.options) {
          q.options.forEach((opt, i) => {
            const marker = i === q.correctAnswer ? '✓' : ' ';
            console.log(`     ${String.fromCharCode(65 + i)}) [${marker}] ${opt}`);
          });
        }
      });
    } else {
      console.log('❌ Question generation returned no questions');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error testing question generation:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testOllamaQuestionGeneration();