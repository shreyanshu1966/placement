const mongoose = require('mongoose');
const Course = require('./models/Course');
const Context = require('./models/Context');
require('dotenv').config();

// Sample course data
const sampleCourses = [
  {
    title: "Data Structures and Algorithms",
    description: "Comprehensive course covering fundamental data structures and algorithms essential for placement preparation",
    faculty: "Dr. Smith",
    syllabus: [
      {
        topic: "Arrays and Strings",
        subtopics: ["Array traversal", "Two-pointer technique", "Sliding window", "String manipulation"],
        difficulty: "easy"
      },
      {
        topic: "Linked Lists",
        subtopics: ["Singly linked list", "Doubly linked list", "Circular linked list", "List reversal"],
        difficulty: "medium"
      },
      {
        topic: "Stacks and Queues",
        subtopics: ["Stack operations", "Queue operations", "Priority queue", "Deque"],
        difficulty: "medium"
      },
      {
        topic: "Trees and Binary Search Trees",
        subtopics: ["Binary tree traversal", "BST operations", "Tree balancing", "Tree algorithms"],
        difficulty: "hard"
      },
      {
        topic: "Dynamic Programming",
        subtopics: ["Memoization", "Tabulation", "Classic DP problems", "Optimization techniques"],
        difficulty: "hard"
      }
    ]
  },
  {
    title: "Web Development Fundamentals",
    description: "Full-stack web development covering modern frameworks and technologies",
    faculty: "Prof. Johnson",
    syllabus: [
      {
        topic: "HTML and CSS",
        subtopics: ["Semantic HTML", "CSS Grid", "Flexbox", "Responsive design"],
        difficulty: "easy"
      },
      {
        topic: "JavaScript Fundamentals",
        subtopics: ["ES6+ features", "DOM manipulation", "Event handling", "Async programming"],
        difficulty: "medium"
      },
      {
        topic: "React.js",
        subtopics: ["Components", "State management", "Hooks", "Context API"],
        difficulty: "medium"
      },
      {
        topic: "Node.js and Express",
        subtopics: ["Server setup", "RESTful APIs", "Middleware", "Database integration"],
        difficulty: "hard"
      }
    ]
  },
  {
    title: "Database Management Systems",
    description: "Comprehensive database concepts and SQL programming",
    faculty: "Dr. Wilson",
    syllabus: [
      {
        topic: "Database Fundamentals",
        subtopics: ["RDBMS concepts", "ER diagrams", "Normalization", "ACID properties"],
        difficulty: "easy"
      },
      {
        topic: "SQL Programming",
        subtopics: ["Basic queries", "Joins", "Subqueries", "Stored procedures"],
        difficulty: "medium"
      },
      {
        topic: "Database Design",
        subtopics: ["Schema design", "Indexing", "Query optimization", "Performance tuning"],
        difficulty: "hard"
      }
    ]
  }
];

// Sample student contexts
const sampleContexts = [
  {
    studentId: "student-001",
    strengths: ["HTML and CSS", "JavaScript Fundamentals"],
    weaknesses: ["Dynamic Programming", "Trees and Binary Search Trees"],
    performanceHistory: [
      { topic: "Arrays and Strings", score: 85, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { topic: "HTML and CSS", score: 90, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { topic: "Dynamic Programming", score: 45, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    ],
    learningStyle: "visual"
  },
  {
    studentId: "student-002",
    strengths: ["SQL Programming", "Database Fundamentals"],
    weaknesses: ["React.js", "Node.js and Express"],
    performanceHistory: [
      { topic: "Database Fundamentals", score: 88, date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      { topic: "SQL Programming", score: 92, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { topic: "React.js", score: 52, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
    ],
    learningStyle: "kinesthetic"
  },
  {
    studentId: "student-003",
    strengths: ["Arrays and Strings", "Linked Lists"],
    weaknesses: ["Database Design", "JavaScript Fundamentals"],
    performanceHistory: [
      { topic: "Arrays and Strings", score: 89, date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
      { topic: "Linked Lists", score: 87, date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      { topic: "Database Design", score: 48, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) }
    ],
    learningStyle: "auditory"
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_system');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Course.deleteMany({});
    await Context.deleteMany({});
    console.log('Cleared existing data');

    // Insert sample courses
    const courses = await Course.insertMany(sampleCourses);
    console.log(`Inserted ${courses.length} courses`);

    // Insert sample contexts
    const contexts = await Context.insertMany(sampleContexts);
    console.log(`Inserted ${contexts.length} student contexts`);

    console.log('Database seeded successfully!');
    console.log('\nSample courses created:');
    courses.forEach(course => {
      console.log(`- ${course.title} (${course.syllabus.length} topics)`);
    });

    console.log('\nSample student contexts created:');
    contexts.forEach(context => {
      console.log(`- ${context.studentId} (${context.strengths.length} strengths, ${context.weaknesses.length} weaknesses)`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the seed function
seedDatabase();