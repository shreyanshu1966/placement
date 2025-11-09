const axios = require('axios');

async function testDirectOllama() {
  try {
    console.log('🧪 Testing Direct Ollama Generation...\n');
    
    const prompt = `Generate 1 simple multiple choice question about Arrays in programming.

Format your response as JSON:
{
  "question": "What is the time complexity of accessing an element in an array by index?",
  "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"],
  "correctAnswer": 0,
  "topic": "Arrays",
  "difficulty": "easy"
}

Only return the JSON, no other text.`;

    console.log('Sending request to Ollama...');
    console.log('Prompt length:', prompt.length);
    
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'llama3.2:1b',
      prompt: prompt,
      stream: false
    }, {
      timeout: 30000 // 30 second timeout
    });
    
    console.log('✅ Ollama responded!');
    console.log('Response length:', response.data.response?.length || 0);
    console.log('Response:', response.data.response);
    
    // Try to parse JSON
    try {
      const generatedQuestion = JSON.parse(response.data.response);
      console.log('\n✅ Successfully parsed JSON:');
      console.log('Question:', generatedQuestion.question);
      console.log('Options:', generatedQuestion.options);
      console.log('Correct Answer:', generatedQuestion.options?.[generatedQuestion.correctAnswer]);
    } catch (parseErr) {
      console.log('\n❌ Failed to parse JSON from response');
      console.log('Raw response:', response.data.response);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

testDirectOllama();