const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📦 Available Collections:');
    collections.forEach(col => console.log('-', col.name));
    
    // Check students collection
    console.log('\n👨‍🎓 Checking students collection:');
    const students = await db.collection('students').find({}).toArray();
    console.log('Students found:', students.length);
    
    if (students.length > 0) {
      students.slice(0, 3).forEach(student => {
        console.log(`- ${student.name} (${student.email})`);
        console.log(`  ID: ${student._id}`);
      });
      console.log('\n✅ Use this student ID:', students[0]._id);
    }
    
    // Check courses
    console.log('\n📚 Checking courses:');
    const courses = await db.collection('courses').find({}).toArray();
    console.log('Courses found:', courses.length);
    
    if (courses.length > 0) {
      courses.slice(0, 2).forEach(course => {
        console.log(`- ${course.title}`);
        console.log(`  ID: ${course._id}`);
      });
      console.log('\n✅ Use this course ID:', courses[0]._id);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkDatabase();