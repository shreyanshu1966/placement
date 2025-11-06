import dotenv from 'dotenv';

// Load environment variables BEFORE importing services
dotenv.config();

// Use dynamic imports to ensure env vars are loaded first
const { default: ollamaService } = await import('./services/ollamaService.js');
const { default: questionGeneratorService } = await import('./services/questionGeneratorService.js');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

async function testOllamaConnection() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing Ollama Connection');
  console.log('='.repeat(60) + '\n');

  try {
    const isAvailable = await ollamaService.isAvailable();
    
    if (isAvailable) {
      log.success('Ollama service is running');
      
      // List models
      const models = await ollamaService.listModels();
      if (models.length > 0) {
        log.info(`Found ${models.length} model(s):`);
        models.forEach(m => {
          console.log(`  - ${m.name} (${(m.size / 1024 / 1024 / 1024).toFixed(2)} GB)`);
        });
      } else {
        log.warn('No models found. Run: ollama pull llama2');
      }
      
      return true;
    } else {
      log.error('Ollama service is not running');
      log.info('Start Ollama with: ollama serve');
      return false;
    }
  } catch (error) {
    log.error(`Connection test failed: ${error.message}`);
    return false;
  }
}

async function testTextGeneration() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing Text Generation');
  console.log('='.repeat(60) + '\n');

  try {
    log.info('Generating a simple greeting...');
    
    const prompt = "Say 'Hello! I am working correctly.' in exactly one sentence.";
    const response = await ollamaService.generate(prompt, {
      temperature: 0.3,
      max_tokens: 50
    });

    log.success('Generation successful!');
    console.log(`\nResponse: "${response.trim()}"\n`);
    
    return true;
  } catch (error) {
    log.error(`Generation test failed: ${error.message}`);
    return false;
  }
}

async function testQuestionGeneration() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing Question Generation');
  console.log('='.repeat(60) + '\n');

  try {
    log.info('Generating a sample question...');
    
    const questions = await questionGeneratorService.generateQuestions({
      topic: 'Arrays',
      difficulty: 'easy',
      count: 1,
      questionType: 'multiple-choice',
      course: '000000000000000000000000', // Dummy ID
      context: 'Basic array concepts'
    });

    if (questions.length > 0) {
      log.success('Question generation successful!');
      
      const q = questions[0];
      console.log('\n--- Generated Question ---');
      console.log(`Q: ${q.questionText}`);
      
      if (q.options) {
        q.options.forEach((opt, i) => {
          const marker = opt.isCorrect ? '✓' : ' ';
          console.log(`  ${String.fromCharCode(65 + i)}) [${marker}] ${opt.text}`);
        });
      }
      
      if (q.explanation) {
        console.log(`\nExplanation: ${q.explanation}`);
      }
      
      console.log(`Difficulty: ${q.difficulty}`);
      console.log(`Marks: ${q.marks}`);
      console.log('--- End of Question ---\n');
      
      return true;
    } else {
      log.warn('No questions generated');
      return false;
    }
  } catch (error) {
    log.error(`Question generation test failed: ${error.message}`);
    log.info('This might be due to prompt parsing. Check Ollama model output format.');
    return false;
  }
}

async function testChatCompletion() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing Chat Completion');
  console.log('='.repeat(60) + '\n');

  try {
    log.info('Testing chat with context...');
    
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful programming tutor.'
      },
      {
        role: 'user',
        content: 'What is a variable in programming? Answer in one sentence.'
      }
    ];

    const response = await ollamaService.chat(messages, {
      temperature: 0.5
    });

    log.success('Chat completion successful!');
    console.log(`\nResponse: "${response.trim()}"\n`);
    
    return true;
  } catch (error) {
    log.error(`Chat test failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 AI Services Test Suite');
  console.log('='.repeat(60));

  const results = {
    connection: false,
    textGeneration: false,
    questionGeneration: false,
    chatCompletion: false
  };

  // Test 1: Connection
  results.connection = await testOllamaConnection();
  
  if (!results.connection) {
    console.log('\n' + '='.repeat(60));
    log.error('Ollama is not available. Cannot proceed with other tests.');
    log.info('Please ensure:');
    console.log('  1. Ollama is installed: https://ollama.ai/download');
    console.log('  2. Ollama service is running: ollama serve');
    console.log('  3. A model is pulled: ollama pull llama2');
    console.log('='.repeat(60) + '\n');
    return;
  }

  // Test 2: Text Generation
  results.textGeneration = await testTextGeneration();
  
  // Give the model a moment to cool down
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 3: Chat Completion
  results.chatCompletion = await testChatCompletion();
  
  // Give the model a moment to cool down
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 4: Question Generation (longer test)
  results.questionGeneration = await testQuestionGeneration();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
  const tests = [
    ['Ollama Connection', results.connection],
    ['Text Generation', results.textGeneration],
    ['Chat Completion', results.chatCompletion],
    ['Question Generation', results.questionGeneration]
  ];

  tests.forEach(([name, passed]) => {
    const status = passed ? `${colors.green}✅ PASS${colors.reset}` : `${colors.red}❌ FAIL${colors.reset}`;
    console.log(`  ${name.padEnd(25)} ${status}`);
  });

  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;

  console.log('\n' + '='.repeat(60));
  
  if (passedCount === totalCount) {
    log.success(`All tests passed! (${passedCount}/${totalCount})`);
    console.log('\n🎉 Your AI services are ready to use!');
  } else {
    log.warn(`Some tests failed (${passedCount}/${totalCount} passed)`);
    console.log('\n💡 Check the error messages above for troubleshooting.');
  }
  
  console.log('='.repeat(60) + '\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
