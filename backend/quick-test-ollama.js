import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2:latest';

console.log('🔧 Configuration:');
console.log(`  OLLAMA_URL: ${OLLAMA_URL}`);
console.log(`  MODEL: ${MODEL}\n`);

async function quickTest() {
  try {
    // Test 1: Check if Ollama is available
    console.log('1️⃣ Testing Ollama connection...');
    const healthCheck = await axios.get(`${OLLAMA_URL}/api/tags`);
    console.log('✅ Ollama is running');
    console.log(`   Found ${healthCheck.data.models.length} models\n`);

    // Test 2: Generate simple text
    console.log('2️⃣ Testing text generation...');
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: MODEL,
      prompt: 'What is 2+2? Answer in one sentence.',
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 50
      }
    });

    console.log('✅ Text generated successfully');
    console.log(`   Response: ${response.data.response}\n`);

    console.log('🎉 All tests passed! Layer 3 is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response data:', error.response.data);
    }
  }
}

quickTest();
