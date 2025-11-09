const mongoose = require('mongoose');
require('dotenv').config();

// Define schemas directly since imports are causing issues
const assignmentSchema = new mongoose.Schema({
  title: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  questionsGenerated: [{}],
  status: String,
  createdAt: { type: Date, default: Date.now }
});

const questionSchema = new mongoose.Schema({
  questionText: String,
  questionType: String,
  topic: String,
  difficulty: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  options: [{}]
});

const courseSchema = new mongoose.Schema({
  title: String,
  code: String,
  syllabus: [{}]
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
const Question = mongoose.model('Question', questionSchema);
const Course = mongoose.model('Course', courseSchema);

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log('\n=== CHECKING ASSIGNMENTS ===');
    const assignments = await Assignment.find({}).populate('course').populate('assignedStudents', 'name email');
    
    console.log('Total assignments:', assignments.length);
    
    for (let i = 0; i < assignments.length; i++) {
      const assignment = assignments[i];
      console.log('\n--- Assignment', i + 1, '---');
      console.log('ID:', assignment._id);
      console.log('Title:', assignment.title);
      console.log('Course:', assignment.course?.title || 'Unknown');
      console.log('Assigned Students:', assignment.assignedStudents?.length || 0);
      console.log('Questions Generated:', assignment.questionsGenerated?.length || 0);
      console.log('Status:', assignment.status);
      console.log('Created:', assignment.createdAt);
      
      if (assignment.questionsGenerated?.length > 0) {
        console.log('Sample question:', assignment.questionsGenerated[0]?.question?.substring(0, 50) + '...');
      } else {
        console.log('⚠️  NO QUESTIONS FOUND!');
      }
    }
    
    console.log('\n=== CHECKING QUESTION BANK ===');
    const questionCount = await Question.countDocuments();
    console.log('Total questions in database:', questionCount);
    
    if (questionCount > 0) {
      const sampleQuestion = await Question.findOne().populate('course');
      console.log('Sample question:');
      console.log('- Text:', sampleQuestion.questionText?.substring(0, 80) + '...');
      console.log('- Course:', sampleQuestion.course?.title || 'Unknown');
      console.log('- Topic:', sampleQuestion.topic);
      console.log('- Difficulty:', sampleQuestion.difficulty);
      console.log('- Type:', sampleQuestion.questionType);
      console.log('- Options:', sampleQuestion.options?.length || 0);
    }
    
    console.log('\n=== CHECKING COURSES ===');
    const courses = await Course.find({});
    console.log('Total courses:', courses.length);
    
    if (courses.length > 0) {
      const course = courses[0];
      console.log('Sample course:');
      console.log('- Title:', course.title);
      console.log('- Code:', course.code);
      console.log('- Units:', course.syllabus?.length || 0);
      
      // Check questions for this course
      const courseQuestions = await Question.find({ course: course._id });
      console.log('- Questions in this course:', courseQuestions.length);
    }
    
    console.log('\n=== DIAGNOSIS ===');
    if (assignments.length === 0) {
      console.log('❌ No assignments found - Create an assignment first');
    } else if (questionCount === 0) {
      console.log('❌ No questions in database - Question generation is failing');
    } else {
      const assignmentsWithoutQuestions = assignments.filter(a => !a.questionsGenerated || a.questionsGenerated.length === 0);
      if (assignmentsWithoutQuestions.length > 0) {
        console.log('❌ Found assignments without questions - Question generation is failing during assignment creation');
      } else {
        console.log('✅ All assignments have questions');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkDatabase();