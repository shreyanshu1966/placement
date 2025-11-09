const mongoose = require('mongoose');
require('dotenv').config();

async function getStudentIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    const students = await db.collection('users').find({ role: 'student' }).toArray();
    
    console.log('👨‍🎓 Available Students:');
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} (${student.email})`);
      console.log(`   ID: ${student._id}`);
    });
    
    if (students.length > 0) {
      console.log('\n✅ Use this student ID for testing:', students[0]._id);
    } else {
      console.log('\n❌ No students found! Please run the seed script first.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

getStudentIds();