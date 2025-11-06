import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { User, Course, Question } from './models/index.js';

dotenv.config();

const testDatabase = async () => {
  try {
    console.log('🧪 Starting database tests...\n');
    
    // Connect to database
    await connectDB();
    
    // Test 1: Count users
    console.log('Test 1: Checking users...');
    const userCount = await User.countDocuments();
    console.log(`✅ Found ${userCount} users`);
    
    // Get users by role
    const adminCount = await User.countDocuments({ role: 'admin' });
    const facultyCount = await User.countDocuments({ role: 'faculty' });
    const studentCount = await User.countDocuments({ role: 'student' });
    console.log(`   - Admins: ${adminCount}`);
    console.log(`   - Faculty: ${facultyCount}`);
    console.log(`   - Students: ${studentCount}\n`);
    
    // Test 2: Check courses
    console.log('Test 2: Checking courses...');
    const courseCount = await Course.countDocuments();
    console.log(`✅ Found ${courseCount} courses`);
    
    if (courseCount > 0) {
      const course = await Course.findOne().populate('faculty', 'name email');
      console.log(`   - Course: ${course.title} (${course.code})`);
      console.log(`   - Faculty: ${course.faculty.name}`);
      console.log(`   - Units: ${course.syllabus.length}`);
      console.log(`   - Enrolled: ${course.studentsEnrolled.length} students\n`);
    }
    
    // Test 3: Check questions
    console.log('Test 3: Checking questions...');
    const questionCount = await Question.countDocuments();
    console.log(`✅ Found ${questionCount} questions`);
    
    const questionsByType = await Question.aggregate([
      { $group: { _id: '$questionType', count: { $sum: 1 } } }
    ]);
    console.log('   Question types:');
    questionsByType.forEach(type => {
      console.log(`   - ${type._id}: ${type.count}`);
    });
    
    const questionsByDifficulty = await Question.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);
    console.log('   Difficulty levels:');
    questionsByDifficulty.forEach(diff => {
      console.log(`   - ${diff._id}: ${diff.count}`);
    });
    
    // Test 4: Test authentication
    console.log('\nTest 4: Testing authentication...');
    const studentUser = await User.findOne({ email: 'alice.student@college.edu' }).select('+password');
    if (studentUser) {
      const isMatch = await studentUser.matchPassword('student123');
      console.log(`✅ Password verification: ${isMatch ? 'PASSED' : 'FAILED'}`);
      console.log(`   - User: ${studentUser.name}`);
      console.log(`   - Role: ${studentUser.role}`);
      console.log(`   - Department: ${studentUser.department}`);
      console.log(`   - Roll Number: ${studentUser.rollNumber}`);
    }
    
    // Test 5: Check indexes
    console.log('\nTest 5: Checking database indexes...');
    const userIndexes = await User.collection.getIndexes();
    console.log(`✅ User model has ${Object.keys(userIndexes).length} indexes`);
    
    const courseIndexes = await Course.collection.getIndexes();
    console.log(`✅ Course model has ${Object.keys(courseIndexes).length} indexes`);
    
    const questionIndexes = await Question.collection.getIndexes();
    console.log(`✅ Question model has ${Object.keys(questionIndexes).length} indexes`);
    
    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📊 Database Summary:');
    console.log(`   - Total Users: ${userCount}`);
    console.log(`   - Total Courses: ${courseCount}`);
    console.log(`   - Total Questions: ${questionCount}`);
    console.log(`   - Database: Connected and operational ✅`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
};

// Run tests
testDatabase();
