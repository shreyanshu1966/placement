const mongoose = require('mongoose');
const Assignment = require('./models/Assignment');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

const addSampleQuestions = async () => {
  try {
    const assignmentId = '6910dd2c8159a231b2ea37d3'; // Latest assignment
    
    const sampleQuestions = [
      {
        question: "What is the time complexity of accessing an element in an array by index?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        correctAnswer: 0,
        topic: "Arrays and Strings",
        difficulty: "easy"
      },
      {
        question: "Which of the following operations is most efficient in an array?",
        options: ["Insertion at beginning", "Deletion at beginning", "Random access", "Searching unsorted"],
        correctAnswer: 2,
        topic: "Arrays and Strings", 
        difficulty: "medium"
      },
      {
        question: "What is the space complexity of the two-pointer technique?",
        options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
        correctAnswer: 2,
        topic: "Arrays and Strings",
        difficulty: "medium"
      },
      {
        question: "In string concatenation, what happens to the time complexity as strings get larger?",
        options: ["Remains O(1)", "Becomes O(n)", "Becomes O(log n)", "Becomes O(n²)"],
        correctAnswer: 1,
        topic: "Arrays and Strings",
        difficulty: "hard"
      },
      {
        question: "Which technique is best for finding a subarray with a specific sum?",
        options: ["Binary search", "Two-pointer technique", "Bubble sort", "Linear search"],
        correctAnswer: 1,
        topic: "Arrays and Strings",
        difficulty: "medium"
      }
    ];

    const result = await Assignment.findByIdAndUpdate(
      assignmentId,
      { 
        $set: { 
          questionsGenerated: sampleQuestions,
          status: 'generated'
        }
      },
      { new: true }
    );

    if (result) {
      console.log('Successfully added sample questions to assignment');
      console.log(`Assignment: ${result.title}`);
      console.log(`Questions: ${result.questionsGenerated.length}`);
    } else {
      console.log('Assignment not found');
    }

  } catch (error) {
    console.error('Error adding questions:', error);
  } finally {
    mongoose.connection.close();
  }
};

addSampleQuestions();