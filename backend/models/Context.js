
const mongoose = require('mongoose');

const contextSchema = new mongoose.Schema({
  studentId: String, // For MVP, using simple string ID
  strengths: [String], // Topics student is strong in
  weaknesses: [String], // Topics student needs improvement
  performanceHistory: [{
    topic: String,
    score: Number,
    date: Date
  }],
  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic'],
    default: 'visual'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Context', contextSchema);