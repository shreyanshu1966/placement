import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import { User, Course, Question, Assessment, Result, Analytics } from './models/index.js';

// Load environment variables
dotenv.config();

// Configuration
const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test data storage
const testData = {
  tokens: {},
  users: {},
  courses: {},
  questions: {},
  assessments: {},
  results: {}
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test counters
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Helper functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logTest = (testName) => {
  totalTests++;
  log(`\n📝 Test ${totalTests}: ${testName}`, 'cyan');
};

const logSuccess = (message) => {
  passedTests++;
  log(`✅ ${message}`, 'green');
};

const logError = (message, error = '') => {
  failedTests++;
  log(`❌ ${message}`, 'red');
  if (error) log(`   Error: ${error}`, 'red');
};

const logInfo = (message) => {
  log(`ℹ️  ${message}`, 'blue');
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test functions
async function testDatabaseConnection() {
  logTest('Database Connection');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logSuccess('Connected to MongoDB');
    logInfo(`Database: ${mongoose.connection.name}`);
    return true;
  } catch (error) {
    logError('Failed to connect to MongoDB', error.message);
    return false;
  }
}

async function testDatabaseModels() {
  logTest('Database Models Validation');
  try {
    const models = [
      { name: 'User', model: User },
      { name: 'Course', model: Course },
      { name: 'Question', model: Question },
      { name: 'Assessment', model: Assessment },
      { name: 'Result', model: Result },
      { name: 'Analytics', model: Analytics }
    ];

    for (const { name, model } of models) {
      const count = await model.countDocuments();
      logSuccess(`${name} model: ${count} documents`);
    }
    return true;
  } catch (error) {
    logError('Model validation failed', error.message);
    return false;
  }
}

async function testPasswordHashing() {
  logTest('Password Hashing & Verification');
  try {
    const student = await User.findOne({ role: 'student', email: 'alice.student@college.edu' }).select('+password');
    if (!student) {
      logError('No student found for password testing');
      return false;
    }

    // Check if password exists and is hashed
    if (!student.password || student.password.length < 50) {
      logError('Password is not properly hashed');
      logInfo(`Password length: ${student.password?.length || 0}`);
      return false;
    }

    const isMatch = await student.matchPassword('student123');
    if (isMatch) {
      logSuccess('Password verification working correctly');
      logInfo(`User: ${student.name} (${student.email})`);
      return true;
    } else {
      logError('Password verification failed');
      return false;
    }
  } catch (error) {
    logError('Password hashing test failed', error.message);
    return false;
  }
}

async function testServerHealth() {
  logTest('Server Health Check');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.data.success) {
      logSuccess('Server is running');
      logInfo(`Environment: ${response.data.environment}`);
      logInfo(`Timestamp: ${response.data.timestamp}`);
      return true;
    } else {
      logError('Server health check failed');
      return false;
    }
  } catch (error) {
    logError('Cannot connect to server', error.message);
    logInfo('Make sure the server is running: npm run dev');
    return false;
  }
}

async function testUserRegistration() {
  logTest('User Registration API');
  try {
    const newUser = {
      name: 'Test Student',
      email: `test.student.${Date.now()}@college.edu`,
      password: 'test123',
      role: 'student',
      department: 'Computer Science',
      batch: '2024',
      rollNumber: `TEST${Date.now()}`,
      semester: 5
    };

    const response = await axios.post(`${API_URL}/auth/register`, newUser);
    if (response.data.success) {
      // The response returns 'data' with user info, extract id properly
      const userData = response.data.data || response.data.user;
      testData.users.testStudent = userData;
      testData.tokens.testStudent = response.data.token;
      logSuccess('User registration successful');
      
      const userId = userData?._id || userData?.id;
      if (userId) {
        logInfo(`User ID: ${userId}`);
      }
      if (response.data.token) {
        logInfo(`Token received: ${response.data.token.substring(0, 20)}...`);
      }
      return true;
    } else {
      logError('Registration failed');
      return false;
    }
  } catch (error) {
    logError('Registration API failed', error.response?.data?.message || error.message);
    logInfo(`Details: ${JSON.stringify(error.response?.data)}`);
    return false;
  }
}

async function testUserLogin() {
  logTest('User Login API');
  try {
    const credentials = {
      email: 'alice.student@college.edu',
      password: 'student123'
    };

    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    if (response.data.success) {
      testData.users.alice = response.data.user;
      testData.tokens.alice = response.data.token;
      logSuccess('Login successful');
      logInfo(`User: ${response.data.user.name}`);
      logInfo(`Role: ${response.data.user.role}`);
      logInfo(`Token: ${response.data.token.substring(0, 20)}...`);
      return true;
    } else {
      logError('Login failed');
      return false;
    }
  } catch (error) {
    logError('Login API failed', error.response?.data?.message || error.message);
    return false;
  }
}

async function testFacultyLogin() {
  logTest('Faculty Login API');
  try {
    const credentials = {
      email: 'john.smith@college.edu',
      password: 'faculty123'
    };

    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    if (response.data.success) {
      testData.users.faculty = response.data.user;
      testData.tokens.faculty = response.data.token;
      logSuccess('Faculty login successful');
      logInfo(`Faculty: ${response.data.user.name}`);
      return true;
    } else {
      logError('Faculty login failed');
      return false;
    }
  } catch (error) {
    logError('Faculty login API failed', error.response?.data?.message || error.message);
    return false;
  }
}

async function testAdminLogin() {
  logTest('Admin Login API');
  try {
    const credentials = {
      email: 'admin@college.edu',
      password: 'admin123'
    };

    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    if (response.data.success) {
      testData.users.admin = response.data.user;
      testData.tokens.admin = response.data.token;
      logSuccess('Admin login successful');
      logInfo(`Admin: ${response.data.user.name}`);
      return true;
    } else {
      logError('Admin login failed');
      return false;
    }
  } catch (error) {
    logError('Admin login API failed', error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetCurrentUser() {
  logTest('Get Current User API');
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${testData.tokens.alice}` }
    });
    
    if (response.data.success) {
      logSuccess('Retrieved current user');
      logInfo(`User: ${response.data.data.name}`);
      logInfo(`Email: ${response.data.data.email}`);
      return true;
    } else {
      logError('Get current user failed');
      return false;
    }
  } catch (error) {
    logError('Get current user API failed', error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetCourses() {
  logTest('Get Courses API');
  try {
    const response = await axios.get(`${API_URL}/courses`, {
      headers: { Authorization: `Bearer ${testData.tokens.alice}` }
    });
    
    if (response.data.success) {
      logSuccess(`Retrieved ${response.data.count} courses`);
      if (response.data.data.length > 0) {
        testData.courses.main = response.data.data[0];
        logInfo(`Course: ${response.data.data[0].title}`);
        logInfo(`Code: ${response.data.data[0].code}`);
      }
      return true;
    } else {
      logError('Get courses failed');
      return false;
    }
  } catch (error) {
    logError('Get courses API failed', error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetQuestions() {
  logTest('Get Questions API (Faculty)');
  try {
    const response = await axios.get(`${API_URL}/questions`, {
      headers: { Authorization: `Bearer ${testData.tokens.faculty}` }
    });
    
    if (response.data.success) {
      logSuccess(`Retrieved ${response.data.count} questions`);
      if (response.data.data.length > 0) {
        testData.questions.sample = response.data.data;
        logInfo(`First question: ${response.data.data[0].questionText.substring(0, 50)}...`);
        logInfo(`Type: ${response.data.data[0].questionType}`);
        logInfo(`Difficulty: ${response.data.data[0].difficulty}`);
      }
      return true;
    } else {
      logError('Get questions failed');
      return false;
    }
  } catch (error) {
    logError('Get questions API failed', error.response?.data?.message || error.message);
    return false;
  }
}

async function testCreateQuestion() {
  logTest('Create Question API (Faculty)');
  try {
    const newQuestion = {
      questionText: 'What is the time complexity of binary search?',
      questionType: 'multiple-choice',
      difficulty: 'medium',
      topic: 'Searching Algorithms',
      course: testData.courses.main._id,
      options: [
        { text: 'O(n)', isCorrect: false },
        { text: 'O(log n)', isCorrect: true },
        { text: 'O(n^2)', isCorrect: false },
        { text: 'O(1)', isCorrect: false }
      ],
      correctAnswer: 'O(log n)',
      explanation: 'Binary search divides the search space in half each iteration, resulting in O(log n) time complexity.',
      marks: 2,
      tags: ['algorithms', 'complexity', 'searching']
    };

    const response = await axios.post(`${API_URL}/questions`, newQuestion, {
      headers: { Authorization: `Bearer ${testData.tokens.faculty}` }
    });
    
    if (response.data.success) {
      testData.questions.created = response.data.data;
      logSuccess('Question created successfully');
      logInfo(`Question ID: ${response.data.data._id}`);
      return true;
    } else {
      logError('Create question failed');
      return false;
    }
  } catch (error) {
    logError('Create question API failed', error.response?.data?.message || error.message);
    return false;
  }
}

async function testGenerateAdaptiveAssessment() {
  logTest('Generate Adaptive Assessment API');
  try {
    const assessmentConfig = {
      courseId: testData.courses.main._id,
      totalQuestions: 5,
      duration: 30,
      type: 'practice',
      focusTopics: []
    };

    const response = await axios.post(`${API_URL}/assessments/generate`, assessmentConfig, {
      headers: { Authorization: `Bearer ${testData.tokens.alice}` }
    });
    
    if (response.data.success) {
      testData.assessments.adaptive = response.data.data.assessment;
      logSuccess('Adaptive assessment generated successfully');
      logInfo(`Assessment ID: ${response.data.data.assessment._id}`);
      logInfo(`Total Questions: ${response.data.data.analysis.totalQuestions}`);
      logInfo(`Weak Topics: ${response.data.data.analysis.weakTopics.join(', ') || 'None'}`);
      logInfo(`Difficulty Distribution: Easy=${response.data.data.analysis.difficultyDistribution.easy}, Medium=${response.data.data.analysis.difficultyDistribution.medium}, Hard=${response.data.data.analysis.difficultyDistribution.hard}`);
      return true;
    } else {
      logError('Generate adaptive assessment failed');
      return false;
    }
  } catch (error) {
    logError('Generate adaptive assessment API failed', error.response?.data?.message || error.message);
    return false;
  }
}

async function testStartAssessment() {
  logTest('Start Assessment API');
  try {
    if (!testData.assessments.adaptive) {
      logError('No assessment available to start');
      return false;
    }

    const response = await axios.post(
      `${API_URL}/assessments/${testData.assessments.adaptive._id}/start`,
      {},
      { headers: { Authorization: `Bearer ${testData.tokens.alice}` } }
    );
    
    if (response.data.success) {
      testData.results.inProgress = response.data.data;
      logSuccess('Assessment started successfully');
      logInfo(`Result ID: ${response.data.data.resultId}`);
      logInfo(`Duration: ${response.data.data.duration} minutes`);
      logInfo(`Questions: ${response.data.data.assessment.questions.length}`);
      return true;
    } else {
      logError('Start assessment failed');
      return false;
    }
  } catch (error) {
    logError('Start assessment API failed', error.response?.data?.message || error.message);
    return false;
  }
}

async function testSubmitAssessment() {
  logTest('Submit Assessment API');
  try {
    if (!testData.results.inProgress) {
      logError('No assessment in progress to submit');
      return false;
    }

    // Generate sample answers - ensure all required fields
    const answers = testData.results.inProgress.assessment.questions.map((q, index) => {
      const question = q.question;
      let answer = 'Sample answer'; // Default answer

      if (question.questionType === 'multiple-choice' && question.options && question.options.length > 0) {
        // Randomly answer correctly 70% of the time
        const correctOption = question.options.find(opt => opt.isCorrect);
        const randomOption = question.options[Math.floor(Math.random() * question.options.length)];
        answer = Math.random() < 0.7 && correctOption ? correctOption._id : randomOption._id;
      } else if (question.questionType === 'true-false') {
        answer = Math.random() < 0.7 ? (question.correctAnswer || 'true') : 'false';
      } else if (question.questionType === 'short-answer') {
        answer = 'This is a sample short answer';
      }

      return {
        questionId: question._id,
        answer: answer,
        timeSpent: Math.floor(Math.random() * 120) + 30,
        isFlagged: false
      };
    });

    const response = await axios.post(
      `${API_URL}/assessments/${testData.assessments.adaptive._id}/submit`,
      {
        resultId: testData.results.inProgress.resultId,
        answers
      },
      { headers: { Authorization: `Bearer ${testData.tokens.alice}` } }
    );
    
    if (response.data.success) {
      testData.results.completed = response.data.data;
      logSuccess('Assessment submitted successfully');
      logInfo(`Score: ${response.data.data.score.obtained}/${response.data.data.score.total} (${response.data.data.score.percentage}%)`);
      logInfo(`Status: ${response.data.data.isPassed ? 'PASSED' : 'FAILED'}`);
      logInfo(`Correct: ${response.data.data.correctAnswers}, Incorrect: ${response.data.data.incorrectAnswers}`);
      logInfo(`Time Taken: ${Math.floor(response.data.data.timeTaken / 60)}m ${response.data.data.timeTaken % 60}s`);
      return true;
    } else {
      logError('Submit assessment failed');
      return false;
    }
  } catch (error) {
    logError('Submit assessment API failed', error.response?.data?.message || error.message);
    if (error.response?.data) {
      logInfo(`Details: ${JSON.stringify(error.response.data).substring(0, 200)}`);
    }
    return false;
  }
}

async function testGetMyResults() {
  logTest('Get My Results API');
  try {
    const response = await axios.get(`${API_URL}/results/my-results`, {
      headers: { Authorization: `Bearer ${testData.tokens.alice}` }
    });
    
    if (response.data.success) {
      logSuccess(`Retrieved ${response.data.count} results`);
      logInfo(`Total Attempts: ${response.data.stats.totalAttempts}`);
      logInfo(`Passed: ${response.data.stats.passed}, Failed: ${response.data.stats.failed}`);
      logInfo(`Average Score: ${response.data.stats.averageScore}%`);
      return true;
    } else {
      logError('Get my results failed');
      return false;
    }
  } catch (error) {
    logError('Get my results API failed', error.response?.data?.message || error.message);
    return false;
  }
}

async function testPerformanceReport() {
  logTest('Generate Performance Report API');
  try {
    if (!testData.results.completed) {
      logError('No completed result available for report');
      return false;
    }

    const response = await axios.get(
      `${API_URL}/results/${testData.results.completed._id}/report`,
      { headers: { Authorization: `Bearer ${testData.tokens.alice}` } }
    );
    
    if (response.data.success) {
      const report = response.data.data;
      logSuccess('Performance report generated');
      logInfo(`Student: ${report.basicInfo.studentName}`);
      logInfo(`Grade: ${report.scoreInfo.grade}`);
      logInfo(`Accuracy: ${report.answerStats.accuracy}%`);
      logInfo(`Strengths: ${report.strengths.join(', ') || 'None identified'}`);
      logInfo(`Weaknesses: ${report.weaknesses.join(', ') || 'None identified'}`);
      logInfo(`Recommendations: ${report.recommendations.length} provided`);
      
      if (report.comparisonWithPeers.available) {
        logInfo(`Percentile: ${report.comparisonWithPeers.percentile}%`);
        logInfo(`Standing: ${report.comparisonWithPeers.standing}`);
      }
      return true;
    } else {
      logError('Generate performance report failed');
      return false;
    }
  } catch (error) {
    logError('Performance report API failed', error.response?.data?.message || error.message);
    return false;
  }
}

async function testStudentDashboard() {
  logTest('Student Dashboard Analytics API');
  try {
    const response = await axios.get(`${API_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${testData.tokens.alice}` }
    });
    
    if (response.data.success) {
      const analytics = response.data.data;
      logSuccess('Student dashboard analytics retrieved');
      logInfo(`Total Attempts: ${analytics.overview.totalAttempts}`);
      logInfo(`Average Score: ${analytics.overview.averageScore}%`);
      logInfo(`Pass Rate: ${analytics.overview.passRate}%`);
      logInfo(`Available Assessments: ${analytics.overview.availableAssessments}`);
      logInfo(`Top Strengths: ${analytics.topStrengths.length} topics`);
      logInfo(`Weak Areas: ${analytics.weakAreas.length} topics`);
      return true;
    } else {
      logError('Student dashboard failed');
      return false;
    }
  } catch (error) {
    logError('Student dashboard API failed', error.response?.data?.message || error.message);
    return false;
  }
}

async function testFacultyDashboard() {
  logTest('Faculty Dashboard Analytics API');
  try {
    const response = await axios.get(`${API_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${testData.tokens.faculty}` }
    });
    
    if (response.data.success) {
      const analytics = response.data.data;
      logSuccess('Faculty dashboard analytics retrieved');
      if (analytics.overview) {
        logInfo(`Total Courses: ${analytics.overview.totalCourses || 0}`);
        logInfo(`Total Assessments: ${analytics.overview.totalAssessments || 0}`);
        logInfo(`Total Students: ${analytics.overview.totalStudents || 0}`);
        logInfo(`Average Score: ${analytics.overview.averageScore || 0}%`);
      }
      return true;
    } else {
      logError('Faculty dashboard failed');
      return false;
    }
  } catch (error) {
    logError('Faculty dashboard API failed', error.response?.data?.message || error.message);
    return false;
  }
}

async function testCourseAnalytics() {
  logTest('Course Analytics API');
  try {
    const response = await axios.get(
      `${API_URL}/analytics/course/${testData.courses.main._id}`,
      { headers: { Authorization: `Bearer ${testData.tokens.faculty}` } }
    );
    
    if (response.data.success) {
      const analytics = response.data.data;
      logSuccess('Course analytics retrieved');
      logInfo(`Course: ${analytics.courseInfo.title}`);
      logInfo(`Total Students: ${analytics.overallStats.totalStudents}`);
      logInfo(`Total Assessments: ${analytics.overallStats.totalAssessments}`);
      logInfo(`Average Score: ${analytics.overallStats.averageScore}%`);
      logInfo(`Participation Rate: ${analytics.overallStats.participationRate}%`);
      return true;
    } else {
      logError('Course analytics failed');
      return false;
    }
  } catch (error) {
    logError('Course analytics API failed', error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetUsers() {
  logTest('Get Users API (Admin)');
  try {
    const response = await axios.get(`${API_URL}/users?role=student&limit=5`, {
      headers: { Authorization: `Bearer ${testData.tokens.admin}` }
    });
    
    if (response.data.success) {
      logSuccess(`Retrieved ${response.data.count} users`);
      logInfo(`Total Users: ${response.data.total}`);
      logInfo(`Pages: ${response.data.pages}`);
      return true;
    } else {
      logError('Get users failed');
      return false;
    }
  } catch (error) {
    logError('Get users API failed', error.response?.data?.message || error.message);
    return false;
  }
}

async function testUnauthorizedAccess() {
  logTest('Unauthorized Access Protection');
  try {
    // Try to access admin endpoint with student token
    try {
      await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${testData.tokens.alice}` }
      });
      logError('Unauthorized access was allowed (security issue!)');
      return false;
    } catch (error) {
      if (error.response?.status === 403) {
        logSuccess('Unauthorized access blocked correctly');
        logInfo('Status: 403 Forbidden');
        return true;
      } else {
        logError('Unexpected error response', error.response?.status);
        return false;
      }
    }
  } catch (error) {
    logError('Authorization test failed', error.message);
    return false;
  }
}

async function testInvalidToken() {
  logTest('Invalid Token Protection');
  try {
    try {
      await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: 'Bearer invalid_token_12345' }
      });
      logError('Invalid token was accepted (security issue!)');
      return false;
    } catch (error) {
      if (error.response?.status === 401) {
        logSuccess('Invalid token rejected correctly');
        logInfo('Status: 401 Unauthorized');
        return true;
      } else {
        logError('Unexpected error response', error.response?.status);
        return false;
      }
    }
  } catch (error) {
    logError('Token validation test failed', error.message);
    return false;
  }
}

async function testModelMethods() {
  logTest('Model Methods & Virtual Fields');
  try {
    // Get course from database if not in testData yet
    let course;
    if (testData.courses.main && testData.courses.main._id) {
      course = await Course.findById(testData.courses.main._id);
    } else {
      course = await Course.findOne();
      if (course) {
        testData.courses.main = course;
      }
    }
    
    if (!course) {
      logError('No course found for testing');
      return false;
    }
    
    // Test Course methods
    const allTopics = course.getAllTopics();
    const totalWeightage = course.getTotalWeightage();
    
    logSuccess('Course model methods working');
    logInfo(`Total Topics: ${allTopics.length}`);
    logInfo(`Total Weightage: ${totalWeightage}%`);
    
    // Test User context
    const user = await User.findOne({ email: 'alice.student@college.edu' });
    if (user) {
      logSuccess('User model context retrieved');
      logInfo(`Questions Attempted: ${user.context.questionsAttempted}`);
      logInfo(`Preferred Difficulty: ${user.context.difficultyPreference}`);
    }
    
    return true;
  } catch (error) {
    logError('Model methods test failed', error.message);
    return false;
  }
}

async function testDatabaseIndexes() {
  logTest('Database Indexes Verification');
  try {
    const collections = [
      { name: 'User', model: User },
      { name: 'Course', model: Course },
      { name: 'Question', model: Question },
      { name: 'Assessment', model: Assessment },
      { name: 'Result', model: Result }
    ];

    for (const { name, model } of collections) {
      const indexes = await model.collection.getIndexes();
      const indexCount = Object.keys(indexes).length;
      logSuccess(`${name}: ${indexCount} indexes`);
    }
    return true;
  } catch (error) {
    logError('Index verification failed', error.message);
    return false;
  }
}

async function testCourseEnrollment() {
  logTest('Course Enrollment API');
  try {
    if (!testData.users.testStudent) {
      logInfo('Skipping: Test student not created');
      return true;
    }

    const studentId = testData.users.testStudent._id || testData.users.testStudent.id;
    const response = await axios.post(
      `${API_URL}/courses/${testData.courses.main._id}/enroll`,
      { studentId },
      { headers: { Authorization: `Bearer ${testData.tokens.testStudent}` } }
    );
    
    if (response.data.success) {
      logSuccess('Student enrolled successfully');
      const enrolledCount = response.data.data?.enrolledStudents?.length || 
                           response.data.data?.studentsEnrolled?.length || 
                           'unknown';
      logInfo(`Enrolled students: ${enrolledCount}`);
      return true;
    } else {
      logError('Enrollment failed');
      return false;
    }
  } catch (error) {
    // If already enrolled, that's ok
    if (error.response?.data?.message?.includes('already enrolled')) {
      logSuccess('Student already enrolled (expected)');
      return true;
    }
    logError('Enrollment API failed', error.response?.data?.message || error.message);
    return false;
  }
}

async function testBulkQuestionImport() {
  logTest('Bulk Question Import API (Faculty)');
  try {
    const questions = [
      {
        questionText: 'What is a stack?',
        questionType: 'short-answer',
        difficulty: 'easy',
        topic: 'Stacks',
        correctAnswer: 'A stack is a linear data structure that follows LIFO principle',
        explanation: 'Stack allows insertion and deletion at one end only',
        marks: 2
      },
      {
        questionText: 'Queue follows which principle?',
        questionType: 'multiple-choice',
        difficulty: 'easy',
        topic: 'Data Structures',
        options: [
          { text: 'LIFO', isCorrect: false },
          { text: 'FIFO', isCorrect: true },
          { text: 'LILO', isCorrect: false },
          { text: 'Random', isCorrect: false }
        ],
        correctAnswer: 'FIFO',
        explanation: 'Queue follows First In First Out principle',
        marks: 1
      }
    ];

    const response = await axios.post(
      `${API_URL}/questions/bulk`,
      { questions, courseId: testData.courses.main._id },
      { headers: { Authorization: `Bearer ${testData.tokens.faculty}` } }
    );
    
    if (response.data.success) {
      logSuccess(`Bulk import successful`);
      logInfo(`Imported: ${response.data.data.imported}`);
      logInfo(`Failed: ${response.data.data.failed}`);
      return true;
    } else {
      logError('Bulk import failed');
      return false;
    }
  } catch (error) {
    logError('Bulk import API failed', error.response?.data?.message || error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.clear();
  log('\n╔═══════════════════════════════════════════════════════════════╗', 'cyan');
  log('║    AI Assessment Platform - Comprehensive Test Suite         ║', 'cyan');
  log('║    Layer 1: Database Models & Infrastructure                 ║', 'cyan');
  log('║    Layer 2: REST APIs & Business Logic                       ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════════╝', 'cyan');
  log('\nStarting tests...\n', 'yellow');

  const startTime = Date.now();

  // Layer 1 Tests - Database & Infrastructure
  log('\n' + '='.repeat(60), 'magenta');
  log('LAYER 1: DATABASE & INFRASTRUCTURE TESTS', 'magenta');
  log('='.repeat(60) + '\n', 'magenta');

  await testDatabaseConnection();
  await delay(500);
  
  await testDatabaseModels();
  await delay(500);
  
  await testPasswordHashing();
  await delay(500);
  
  await testModelMethods();
  await delay(500);
  
  await testDatabaseIndexes();
  await delay(500);

  // Layer 2 Tests - REST APIs
  log('\n' + '='.repeat(60), 'magenta');
  log('LAYER 2: REST API TESTS', 'magenta');
  log('='.repeat(60) + '\n', 'magenta');

  await testServerHealth();
  await delay(500);

  // Authentication Tests
  log('\n--- Authentication & Authorization Tests ---', 'yellow');
  await testUserRegistration();
  await delay(500);
  
  await testUserLogin();
  await delay(500);
  
  await testFacultyLogin();
  await delay(500);
  
  await testAdminLogin();
  await delay(500);
  
  await testGetCurrentUser();
  await delay(500);
  
  await testUnauthorizedAccess();
  await delay(500);
  
  await testInvalidToken();
  await delay(500);

  // Course Tests
  log('\n--- Course Management Tests ---', 'yellow');
  await testGetCourses();
  await delay(500);
  
  await testCourseEnrollment();
  await delay(500);

  // Question Tests
  log('\n--- Question Bank Tests ---', 'yellow');
  await testGetQuestions();
  await delay(500);
  
  await testCreateQuestion();
  await delay(500);
  
  await testBulkQuestionImport();
  await delay(500);

  // Assessment Tests
  log('\n--- Assessment & Testing Flow ---', 'yellow');
  await testGenerateAdaptiveAssessment();
  await delay(500);
  
  await testStartAssessment();
  await delay(500);
  
  await testSubmitAssessment();
  await delay(500);

  // Results Tests
  log('\n--- Results & Performance Tests ---', 'yellow');
  await testGetMyResults();
  await delay(500);
  
  await testPerformanceReport();
  await delay(500);

  // Analytics Tests
  log('\n--- Analytics & Insights Tests ---', 'yellow');
  await testStudentDashboard();
  await delay(500);
  
  await testFacultyDashboard();
  await delay(500);
  
  await testCourseAnalytics();
  await delay(500);

  // Admin Tests
  log('\n--- Admin Management Tests ---', 'yellow');
  await testGetUsers();
  await delay(500);

  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log('\n' + '='.repeat(60), 'cyan');
  log('TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`\n📊 Total Tests: ${totalTests}`, 'blue');
  log(`✅ Passed: ${passedTests}`, 'green');
  log(`❌ Failed: ${failedTests}`, 'red');
  log(`⏱️  Duration: ${duration}s`, 'blue');
  log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`, 'blue');

  if (failedTests === 0) {
    log('🎉 ALL TESTS PASSED! 🎉', 'green');
    log('✅ Layer 1: Database & Infrastructure - WORKING', 'green');
    log('✅ Layer 2: REST APIs & Business Logic - WORKING', 'green');
  } else {
    log('⚠️  SOME TESTS FAILED', 'yellow');
    log(`Please review the ${failedTests} failed test(s) above`, 'yellow');
  }

  log('\n' + '='.repeat(60) + '\n', 'cyan');

  // Cleanup
  await mongoose.connection.close();
  log('Database connection closed', 'blue');
  
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log('\n💥 Test suite crashed!', 'red');
  log(`Error: ${error.message}`, 'red');
  process.exit(1);
});
