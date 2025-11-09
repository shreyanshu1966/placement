const mongoose = require('mongoose');
const Student = require('./models/Student');
const Course = require('./models/Course');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

const seedStudents = async () => {
  try {
    // Clear existing students
    await Student.deleteMany({});
    
    // Get course IDs
    const courses = await Course.find({});
    const courseIds = courses.map(c => c._id);
    
    const sampleStudents = [
      {
        studentId: 'student-001',
        name: 'Alice Johnson',
        email: 'alice.johnson@university.edu',
        enrolledCourses: courseIds // Enroll in all courses
      },
      {
        studentId: 'student-002', 
        name: 'Bob Smith',
        email: 'bob.smith@university.edu',
        enrolledCourses: [courseIds[0], courseIds[1]] // First 2 courses
      },
      {
        studentId: 'student-003',
        name: 'Carol Davis',
        email: 'carol.davis@university.edu', 
        enrolledCourses: [courseIds[0]] // First course only
      },
      {
        studentId: 'student-user',
        name: 'Demo Student',
        email: 'demo.student@university.edu',
        enrolledCourses: courseIds // Enroll in all courses
      },
      {
        studentId: 'student-004',
        name: 'David Wilson',
        email: 'david.wilson@university.edu',
        enrolledCourses: [courseIds[1], courseIds[2]] // Last 2 courses
      },
      {
        studentId: 'student-005',
        name: 'Emma Brown',
        email: 'emma.brown@university.edu',
        enrolledCourses: courseIds // Enroll in all courses
      }
    ];

    await Student.insertMany(sampleStudents);
    console.log('Sample students created successfully');
    
    // Display created students
    const students = await Student.find({}).populate('enrolledCourses');
    console.log('\nCreated students:');
    students.forEach(student => {
      console.log(`- ${student.name} (${student.studentId})`);
      console.log(`  Email: ${student.email}`);
      console.log(`  Courses: ${student.enrolledCourses.map(c => c.title).join(', ')}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error seeding students:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedStudents();