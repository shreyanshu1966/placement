const mongoose = require('mongoose');
require('dotenv').config();

async function getCourseIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Use simple aggregation to avoid schema issues
    const db = mongoose.connection.db;
    const courses = await db.collection('courses').find({}).toArray();
    
    console.log('📚 Available Courses:');
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} (${course.code})`);
      console.log(`   ID: ${course._id}`);
      console.log(`   Students: ${course.studentsEnrolled?.length || 0}`);
    });
    
    if (courses.length > 0) {
      console.log('\n✅ Use this course ID for testing:', courses[0]._id);
    } else {
      console.log('\n❌ No courses found! Please run the seed script first.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

getCourseIds();