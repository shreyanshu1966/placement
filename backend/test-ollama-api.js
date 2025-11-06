import axios from 'axios';

const OLLAMA_URL = 'http://localhost:11434';

async function testAPI() {
  console.log('Testing Ollama API endpoints...\n');
  
  // Test 1: List models (this works)
  try {
    console.log('1. GET /api/tags');
    const tags = await axios.get(`${OLLAMA_URL}/api/tags`);
    console.log('✅ Success:', tags.data.models.length, 'models found\n');
  } catch (error) {
    console.log('❌ Failed:', error.message, '\n');
  }

  // Test 2: Generate endpoint with different payloads
  try {
    console.log('2. POST /api/generate (with model llama3.2:1b)');
    const gen = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'llama3.2:1b',
      prompt: 'What is 2+2?',
      stream: false
    });
    console.log('✅ Success:', gen.data.response.substring(0, 50));
  } catch (error) {
    console.log('❌ Failed:', error.response?.status, error.response?.data || error.message);
  }

  // Test 3: Try with timeout
  try {
    console.log('\n3. POST /api/generate (with longer timeout)');
    const gen2 = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: 'llama3.2:1b',
        prompt: 'Say hello',
        stream: false
      },
      { timeout: 60000 }
    );
    console.log('✅ Success:', gen2.data.response);
  } catch (error) {
    console.log('❌ Failed:', error.response?.status, error.response?.data || error.message);
  }

  // Test 4: Chat endpoint
  try {
    console.log('\n4. POST /api/chat');
    const chat = await axios.post(`${OLLAMA_URL}/api/chat`, {
      model: 'llama3.2:1b',
      messages: [{ role: 'user', content: 'Hello' }],
      stream: false
    });
    console.log('✅ Success:', chat.data.message.content);
  } catch (error) {
    console.log('❌ Failed:', error.response?.status, error.response?.data || error.message);
  }
}

testAPI();
