const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const demoUsers = [
  {
    email: 'faculty@demo.com',
    password: 'faculty123',
    name: 'Dr. John Smith',
    role: 'faculty',
    department: 'Computer Science'
  },
  {
    email: 'student@demo.com',
    password: 'student123',
    name: 'Alice Johnson',
    role: 'student',
    studentId: 'STU-2024-001'
  },
  {
    email: 'demo-faculty@example.com',
    password: '123456',
    name: 'Demo Faculty',
    role: 'faculty',
    department: 'Computer Science'
  },
  {
    email: 'demo-student@example.com',
    password: '123456',
    name: 'Demo Student',
    role: 'student',
    studentId: 'DEMO-STU-001'
  }
];

async function createDemoUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`✓ User ${userData.email} already exists`);
      } else {
        const user = new User(userData);
        await user.save();
        console.log(`✓ Created user: ${userData.email} (${userData.role})`);
      }
    }

    console.log('\n✅ Demo users setup complete!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 DEMO CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n👨‍🏫 FACULTY LOGIN:');
    console.log('   Email: faculty@demo.com');
    console.log('   Password: faculty123');
    console.log('\n🎓 STUDENT LOGIN:');
    console.log('   Email: student@demo.com');
    console.log('   Password: student123');
    console.log('\n🚀 QUICK LOGIN (via buttons):');
    console.log('   • Just click "Login as Student" or "Login as Faculty"');
    console.log('   • Uses auto-created demo accounts');
    console.log('═══════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating demo users:', error);
    process.exit(1);
  }
}

createDemoUsers();
