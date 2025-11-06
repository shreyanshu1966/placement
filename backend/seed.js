import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/database.js';
import { User, Course, Question } from './models/index.js';

dotenv.config();

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@college.edu',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Dr. John Smith',
    email: 'john.smith@college.edu',
    password: 'faculty123',
    role: 'faculty',
    department: 'Computer Science'
  },
  {
    name: 'Alice Johnson',
    email: 'alice.student@college.edu',
    password: 'student123',
    role: 'student',
    rollNumber: 'CS2024001',
    department: 'Computer Science',
    batch: '2024',
    semester: 5
  },
  {
    name: 'Bob Williams',
    email: 'bob.student@college.edu',
    password: 'student123',
    role: 'student',
    rollNumber: 'CS2024002',
    department: 'Computer Science',
    batch: '2024',
    semester: 5
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    
    // Clear existing data
    await User.deleteMany();
    await Course.deleteMany();
    await Question.deleteMany();

    console.log('✅ Existing data cleared');

    // Insert users (one by one to trigger pre-save hooks)
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`✅ Created ${createdUsers.length} users`);

    // Get faculty and student references
    const faculty = createdUsers.find(u => u.role === 'faculty');
    const student = createdUsers.find(u => u.role === 'student');

    // Create sample course
    console.log('📚 Creating sample course...');
    const course = await Course.create({
      title: 'Data Structures and Algorithms',
      code: 'CS301',
      description: 'Introduction to fundamental data structures and algorithms',
      department: 'Computer Science',
      semester: 5,
      credits: 4,
      faculty: faculty._id,
      academicYear: '2024-2025',
      syllabus: [
        {
          unit: 1,
          title: 'Arrays and Linked Lists',
          topics: [
            { name: 'Arrays', description: 'Array operations and applications', weightage: 15 },
            { name: 'Linked Lists', description: 'Singly and doubly linked lists', weightage: 15 },
            { name: 'Stacks', description: 'Stack operations and applications', weightage: 10 }
          ],
          duration: 12
        },
        {
          unit: 2,
          title: 'Trees and Graphs',
          topics: [
            { name: 'Binary Trees', description: 'Tree traversals and operations', weightage: 15 },
            { name: 'Binary Search Trees', description: 'BST operations', weightage: 15 },
            { name: 'Graphs', description: 'Graph representations and traversals', weightage: 15 }
          ],
          duration: 15
        },
        {
          unit: 3,
          title: 'Sorting and Searching',
          topics: [
            { name: 'Sorting Algorithms', description: 'Bubble, Quick, Merge sort', weightage: 10 },
            { name: 'Searching Algorithms', description: 'Linear and Binary search', weightage: 5 }
          ],
          duration: 10
        }
      ],
      learningOutcomes: [
        'Understand fundamental data structures',
        'Implement common algorithms',
        'Analyze time and space complexity'
      ],
      studentsEnrolled: [
        {
          student: student._id,
          progress: 0,
          completedTopics: []
        }
      ]
    });
    console.log('✅ Created sample course');

    // Create sample questions
    console.log('❓ Creating sample questions...');
    const questions = [
      {
        questionText: 'What is the time complexity of binary search?',
        questionType: 'multiple-choice',
        options: [
          { text: 'O(n)', isCorrect: false },
          { text: 'O(log n)', isCorrect: true },
          { text: 'O(n^2)', isCorrect: false },
          { text: 'O(1)', isCorrect: false }
        ],
        course: course._id,
        topic: 'Searching Algorithms',
        difficulty: 'easy',
        bloomsLevel: 'remember',
        tags: ['time-complexity', 'binary-search'],
        source: 'manual',
        generatedBy: faculty._id,
        explanation: 'Binary search divides the search space in half each time, resulting in O(log n) complexity.'
      },
      {
        questionText: 'Which data structure uses LIFO (Last In First Out) principle?',
        questionType: 'multiple-choice',
        options: [
          { text: 'Queue', isCorrect: false },
          { text: 'Stack', isCorrect: true },
          { text: 'Array', isCorrect: false },
          { text: 'Tree', isCorrect: false }
        ],
        course: course._id,
        topic: 'Stacks',
        difficulty: 'easy',
        bloomsLevel: 'remember',
        tags: ['stack', 'lifo'],
        source: 'manual',
        generatedBy: faculty._id
      },
      {
        questionText: 'In a binary search tree, for any node, all values in the left subtree are _____ than the node value.',
        questionType: 'short-answer',
        correctAnswer: 'less',
        course: course._id,
        topic: 'Binary Search Trees',
        difficulty: 'medium',
        bloomsLevel: 'understand',
        tags: ['bst', 'tree-properties'],
        source: 'manual',
        generatedBy: faculty._id
      },
      {
        questionText: 'Write a function to reverse a singly linked list.',
        questionType: 'coding',
        correctAnswer: 'def reverse_linked_list(head): ...',
        course: course._id,
        topic: 'Linked Lists',
        difficulty: 'hard',
        bloomsLevel: 'apply',
        tags: ['linked-list', 'coding', 'reverse'],
        source: 'manual',
        generatedBy: faculty._id,
        explanation: 'Iterate through the list, reversing pointers as you go.'
      }
    ];

    await Question.insertMany(questions);
    console.log(`✅ Created ${questions.length} sample questions`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Courses: 1`);
    console.log(`   Questions: ${questions.length}`);
    console.log('\n👤 Test Credentials:');
    console.log('   Admin:   admin@college.edu / admin123');
    console.log('   Faculty: john.smith@college.edu / faculty123');
    console.log('   Student: alice.student@college.edu / student123');
    console.log('   Student: bob.student@college.edu / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
