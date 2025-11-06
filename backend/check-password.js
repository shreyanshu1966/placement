import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const checkPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    const user = await mongoose.connection.db.collection('users').findOne({ 
      email: 'alice.student@college.edu' 
    });
    
    console.log('User found:', user.name);
    console.log('Stored hash:', user.password);
    
    // Test with plain password
    const match1 = await bcrypt.compare('student123', user.password);
    console.log('Match with "student123":', match1);
    
    // Test if password is already hashed (double hashing issue)
    const testHash = await bcrypt.hash('student123', 10);
    console.log('New hash created:', testHash);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkPassword();
