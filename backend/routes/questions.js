const express = require('express');
const router = express.Router();
const axios = require('axios');

// Question generator using Ollama
router.post('/generate', async (req, res) => {
  try {
    const { topic, difficulty = 'medium', count = 5, subtopics = [] } = req.body;
    
    const prompt = `Generate ${count} multiple choice questions about ${topic} ${subtopics.length > 0 ? `focusing on: ${subtopics.join(', ')}` : ''}.
    
Difficulty level: ${difficulty}

For each question, provide:
1. Question text
2. 4 multiple choice options (A, B, C, D)
3. Correct answer (A, B, C, or D)

Format your response as JSON array with this structure:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "topic": "${topic}",
    "difficulty": "${difficulty}"
  }
]

Make sure questions are relevant for placement preparation and industry readiness.`;

    console.log(`Attempting to generate ${count} questions for topic: ${topic}`);
    
    // Check if Ollama URL is configured
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    console.log(`Using Ollama URL: ${ollamaUrl}`);

    try {
      const ollamaResponse = await axios.post(`${ollamaUrl}/api/generate`, {
        model: 'llama3.2:1b',
        prompt: prompt,
        stream: false
      }, {
        timeout: 60000, // 60 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      let generatedText = ollamaResponse.data.response;
      console.log('Ollama response received, processing...');
      
      // Try to extract JSON from the response
      let questions = [];
      try {
        // Look for JSON array in the response
        const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
          console.log(`Successfully parsed ${questions.length} questions from AI`);
        } else {
          // Fallback: create questions from text response
          questions = parseTextToQuestions(generatedText, topic, difficulty);
          console.log(`Parsed ${questions.length} questions from text`);
        }
      } catch (parseError) {
        console.log('JSON parsing failed, using fallback questions');
        questions = createFallbackQuestions(topic, difficulty, count);
      }

      res.json({ 
        questions,
        source: questions.length > 0 && questions[0].question.includes('Sample') ? 'fallback' : 'ai',
        ollamaConnected: true
      });
      
    } catch (ollamaError) {
      console.error('Ollama connection failed:', ollamaError.message);
      
      // Return fallback questions with proper indication
      const fallbackQuestions = createFallbackQuestions(topic, difficulty, count);
      res.json({ 
        questions: fallbackQuestions,
        source: 'fallback',
        ollamaConnected: false,
        error: 'Ollama service not available'
      });
    }
    
  } catch (error) {
    console.error('Error generating questions:', error.message);
    
    // Fallback: return sample questions
    const fallbackQuestions = createFallbackQuestions(req.body.topic, req.body.difficulty, req.body.count);
    res.json({ 
      questions: fallbackQuestions,
      source: 'fallback',
      ollamaConnected: false,
      error: error.message
    });
  }
});

// Fallback function to create sample questions
function createFallbackQuestions(topic, difficulty, count) {
  const questionTemplates = {
    'Arrays and Strings': [
      {
        question: "What is the time complexity of accessing an element in an array by index?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        correctAnswer: 0
      },
      {
        question: "Which operation is most efficient on arrays?",
        options: ["Insertion at beginning", "Deletion at beginning", "Random access", "Searching unsorted array"],
        correctAnswer: 2
      },
      {
        question: "What is the space complexity of the two-pointer technique?",
        options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
        correctAnswer: 2
      },
      {
        question: "In string concatenation using + operator, what happens to time complexity?",
        options: ["Remains O(1)", "Becomes O(n)", "Becomes O(log n)", "Becomes O(n²)"],
        correctAnswer: 1
      },
      {
        question: "Which technique is best for finding subarrays with specific properties?",
        options: ["Binary search", "Sliding window", "Bubble sort", "Linear search"],
        correctAnswer: 1
      }
    ],
    'Linked Lists': [
      {
        question: "What is the main advantage of linked lists over arrays?",
        options: ["Better cache performance", "Dynamic size", "Faster access", "Less memory usage"],
        correctAnswer: 1
      },
      {
        question: "What is the time complexity of inserting at the beginning of a linked list?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        correctAnswer: 0
      },
      {
        question: "In a doubly linked list, what does each node contain?",
        options: ["Data only", "Data and next pointer", "Data and prev pointer", "Data, next and prev pointers"],
        correctAnswer: 3
      }
    ],
    'Stacks and Queues': [
      {
        question: "What principle does a stack follow?",
        options: ["FIFO", "LIFO", "Random access", "Priority based"],
        correctAnswer: 1
      },
      {
        question: "What principle does a queue follow?",
        options: ["FIFO", "LIFO", "Random access", "Priority based"],
        correctAnswer: 0
      }
    ],
    'Trees and Binary Search Trees': [
      {
        question: "What is the time complexity of search in a balanced BST?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        correctAnswer: 2
      },
      {
        question: "In which traversal do we visit root node first?",
        options: ["Inorder", "Preorder", "Postorder", "Level order"],
        correctAnswer: 1
      }
    ],
    'Dynamic Programming': [
      {
        question: "What is the main principle behind dynamic programming?",
        options: ["Divide and conquer", "Optimal substructure", "Greedy choice", "Backtracking"],
        correctAnswer: 1
      },
      {
        question: "What technique helps avoid recomputing overlapping subproblems?",
        options: ["Recursion", "Memoization", "Iteration", "Backtracking"],
        correctAnswer: 1
      }
    ]
  };

  const questions = [];
  const templates = questionTemplates[topic] || [];
  
  if (templates.length === 0) {
    // Generic fallback for unknown topics
    for (let i = 0; i < count; i++) {
      questions.push({
        question: `What is a key concept in ${topic}?`,
        options: [
          `Important aspect of ${topic}`,
          `Basic principle of ${topic}`,
          `Advanced feature of ${topic}`,
          `Common mistake in ${topic}`
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        topic: topic,
        difficulty: difficulty
      });
    }
  } else {
    // Use predefined templates and repeat if needed
    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      questions.push({
        ...template,
        topic: topic,
        difficulty: difficulty
      });
    }
  }
  
  return questions;
}

// Parse text response to questions (fallback method)
function parseTextToQuestions(text, topic, difficulty) {
  // Simple text parsing logic - this is a basic implementation
  const lines = text.split('\n').filter(line => line.trim());
  const questions = [];
  
  let currentQuestion = null;
  let currentOptions = [];
  
  for (const line of lines) {
    if (line.includes('?') && !currentQuestion) {
      currentQuestion = line.trim();
      currentOptions = [];
    } else if (line.match(/^[A-D][\.\)]/)) {
      currentOptions.push(line.replace(/^[A-D][\.\)]\s*/, '').trim());
      
      if (currentOptions.length === 4 && currentQuestion) {
        questions.push({
          question: currentQuestion,
          options: currentOptions,
          correctAnswer: Math.floor(Math.random() * 4), // Random for now
          topic: topic,
          difficulty: difficulty
        });
        currentQuestion = null;
        currentOptions = [];
      }
    }
  }
  
  return questions.length > 0 ? questions : createFallbackQuestions(topic, difficulty, 5);
}

module.exports = router;