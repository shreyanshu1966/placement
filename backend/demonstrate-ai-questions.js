const axios = require('axios');

async function demonstrateOllamaQuestions() {
  try {
    console.log('🤖 DEMONSTRATING OLLAMA AI QUESTION GENERATION\n');
    
    // Test different topics to show AI generation
    const topics = ['Binary Trees', 'Hash Tables', 'Graph Algorithms'];
    
    for (const topic of topics) {
      console.log(`\n📚 Generating AI questions for: ${topic}`);
      console.log('─'.repeat(50));
      
      const response = await axios.post('http://localhost:5000/api/questions/generate', {
        topic,
        difficulty: 'medium',
        count: 2
      });
      
      if (response.data.questions && response.data.questions.length > 0) {
        console.log(`✅ Source: ${response.data.source.toUpperCase()} (Ollama Connected: ${response.data.ollamaConnected})`);
        
        response.data.questions.forEach((q, index) => {
          console.log(`\n${index + 1}. ${q.question}`);
          if (q.options) {
            q.options.forEach((opt, i) => {
              const marker = i === q.correctAnswer ? '✓' : ' ';
              console.log(`   ${String.fromCharCode(65 + i)}) [${marker}] ${opt}`);
            });
          }
        });
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 COMPARISON: AI vs Fallback Questions');
    console.log('='.repeat(60));
    
    console.log('\n🤖 AI-Generated Questions (from Ollama):');
    console.log('- Context-aware and natural language');
    console.log('- Varied question styles and complexity');
    console.log('- Generated based on the specific topic');
    console.log('- Sometimes imperfect but creative');
    
    console.log('\n📝 Fallback Questions (pre-written):');
    console.log('- High-quality, tested questions');
    console.log('- Perfect grammar and structure');
    console.log('- Consistent difficulty levels');
    console.log('- Always available when AI fails');
    
    console.log('\n✅ Your system now uses BOTH for maximum reliability!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

demonstrateOllamaQuestions();