const mongoose = require('mongoose');
const Assignment = require('./models/Assignment');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

const cleanupEmptyAssignments = async () => {
  try {
    // Delete assignments with empty questionsGenerated arrays
    const result = await Assignment.deleteMany({
      $or: [
        { questionsGenerated: { $size: 0 } },
        { questionsGenerated: { $exists: false } }
      ]
    });

    console.log(`Deleted ${result.deletedCount} assignments with no questions`);
    
    // Show remaining assignments
    const remaining = await Assignment.find({}).populate('courseId');
    console.log('\nRemaining assignments:');
    remaining.forEach(assignment => {
      console.log(`- ${assignment.title} (${assignment.questionsGenerated.length} questions)`);
    });

  } catch (error) {
    console.error('Error cleaning up assignments:', error);
  } finally {
    mongoose.connection.close();
  }
};

cleanupEmptyAssignments();