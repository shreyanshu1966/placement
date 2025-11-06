import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import mongoose from 'mongoose';
import chalk from 'chalk';

// Dynamic imports for services after env loading
const { default: ollamaService } = await import('./services/ollamaService.js');

const BASE_URL = 'http://localhost:5000/api';
let authTokens = {
  admin: null,
  faculty: null,
  student: null
};

let testData = {
  adminId: null,
  facultyId: null,
  studentId: null,
  courseId: null,
  questionIds: [],
  assessmentId: null,
  resultId: null
};

// Test statistics
const testStats = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  duration: 0
};

// Colors and formatting
const log = {
  header: (msg) => console.log(chalk.cyan.bold(`\n${'='.repeat(70)}\n${msg}\n${'='.repeat(70)}`)),
  section: (msg) => console.log(chalk.yellow.bold(`\n${'─'.repeat(70)}\n${msg}\n${'─'.repeat(70)}`)),
  success: (msg) => console.log(chalk.green(`✅ ${msg}`)),
  error: (msg) => console.log(chalk.red(`❌ ${msg}`)),
  info: (msg) => console.log(chalk.blue(`ℹ️  ${msg}`)),
  warn: (msg) => console.log(chalk.yellow(`⚠️  ${msg}`)),
  skip: (msg) => console.log(chalk.gray(`⏭️  ${msg}`)),
  data: (label, data) => console.log(chalk.gray(`   ${label}:`), chalk.white(JSON.stringify(data, null, 2)))
};

// Helper to make API calls
const api = {
  async post(endpoint, data, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axios.post(`${BASE_URL}${endpoint}`, data, { headers });
  },
  async get(endpoint, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axios.get(`${BASE_URL}${endpoint}`, { headers });
  },
  async put(endpoint, data, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axios.put(`${BASE_URL}${endpoint}`, data, { headers });
  },
  async delete(endpoint, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axios.delete(`${BASE_URL}${endpoint}`, { headers });
  }
};

// Test wrapper
async function runTest(name, testFn, options = {}) {
  testStats.total++;
  const startTime = Date.now();
  
  if (options.skip) {
    testStats.skipped++;
    log.skip(`SKIP - ${name} (${options.skipReason || 'skipped'})`);
    return true;
  }
  
  try {
    log.info(`Testing: ${name}...`);
    await testFn();
    const duration = Date.now() - startTime;
    testStats.passed++;
    log.success(`PASS - ${name} (${duration}ms)`);
    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    testStats.failed++;
    log.error(`FAIL - ${name} (${duration}ms)`);
    log.error(`Error: ${error.message}`);
    if (error.response?.data?.message) {
      log.error(`API Error: ${error.response.data.message}`);
    }
    return false;
  }
}

// ============================================================================
// LAYER 1 TESTS - Database & Core Infrastructure
// ============================================================================

async function testLayer1() {
  log.header('🗄️  LAYER 1 - DATABASE & CORE INFRASTRUCTURE TESTS');

  await runTest('Database Connection', async () => {
    const state = mongoose.connection.readyState;
    if (state !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
  });

  await runTest('Admin Registration', async () => {
    const timestamp = Date.now();
    const response = await api.post('/auth/register', {
      name: 'System Admin',
      email: `admin_${timestamp}@test.com`,
      password: 'Admin@123',
      role: 'admin'
    });
    testData.adminId = response.data.user._id;
    authTokens.admin = response.data.token;
    log.info(`Admin: ${response.data.user.email}`);
  });

  await runTest('Faculty Registration', async () => {
    const timestamp = Date.now();
    const response = await api.post('/auth/register', {
      name: 'Test Faculty',
      email: `faculty_${timestamp}@test.com`,
      password: 'Faculty@123',
      role: 'faculty'
    });
    testData.facultyId = response.data.user._id;
    authTokens.faculty = response.data.token;
    log.info(`Faculty: ${response.data.user.email}`);
  });

  await runTest('Student Registration', async () => {
    const timestamp = Date.now();
    const response = await api.post('/auth/register', {
      name: 'Test Student',
      email: `student_${timestamp}@test.com`,
      password: 'Student@123',
      role: 'student'
    });
    testData.studentId = response.data.user._id;
    authTokens.student = response.data.token;
    log.info(`Student: ${response.data.user.email}`);
  });

  await runTest('JWT Token Authentication', async () => {
    if (!authTokens.student || !authTokens.faculty || !authTokens.admin) {
      throw new Error('Not all tokens generated');
    }
    await api.get('/users/profile', authTokens.student);
  });
}

// ============================================================================
// LAYER 2 TESTS - Backend Logic & APIs
// ============================================================================

async function testLayer2() {
  log.header('⚙️  LAYER 2 - BACKEND LOGIC & API TESTS');

  await runTest('Create Course', async () => {
    const response = await api.post('/courses', {
      title: 'JavaScript Fundamentals',
      code: `JS${Date.now()}`,
      description: 'Learn JavaScript from basics to advanced',
      department: 'Computer Science',
      semester: 3,
      credits: 4,
      academicYear: '2024-2025',
      syllabus: [
        {
          unit: 1,
          title: 'JavaScript Basics',
          topics: [
            { name: 'Variables', description: 'var, let, const', weightage: 10 },
            { name: 'Functions', description: 'Function declarations', weightage: 15 }
          ],
          duration: 10
        }
      ]
    }, authTokens.faculty);
    testData.courseId = response.data.course._id;
    log.info(`Course: ${response.data.course.title}`);
  });

  await runTest('Student Enrollment', async () => {
    await api.post(`/courses/${testData.courseId}/enroll`, {}, authTokens.student);
    log.info(`Student enrolled successfully`);
  });

  await runTest('Create Questions', async () => {
    const questions = [
      {
        text: 'What is a variable?',
        type: 'mcq',
        course: testData.courseId,
        topic: 'Variables',
        difficulty: 'easy',
        options: ['Storage location', 'Function', 'Loop', 'Object'],
        correctAnswer: 0,
        marks: 1
      },
      {
        text: 'What is a closure?',
        type: 'mcq',
        course: testData.courseId,
        topic: 'Functions',
        difficulty: 'medium',
        options: ['Nested function', 'Loop', 'Array', 'Variable'],
        correctAnswer: 0,
        marks: 2
      },
      {
        text: 'Arrays are zero-indexed.',
        type: 'true-false',
        course: testData.courseId,
        topic: 'Arrays',
        difficulty: 'easy',
        correctAnswer: true,
        marks: 1
      }
    ];

    for (const q of questions) {
      const response = await api.post('/questions', q, authTokens.faculty);
      testData.questionIds.push(response.data.question._id);
    }
    log.info(`Created ${questions.length} questions`);
  });

  await runTest('Create Assessment', async () => {
    const now = new Date();
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const response = await api.post('/assessments', {
      title: 'JavaScript Basics Test',
      course: testData.courseId,
      questions: testData.questionIds,
      config: {
        duration: 30,
        totalMarks: 4,
        passingMarks: 2,
        negativeMarking: false,
        showResults: true
      },
      schedule: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    }, authTokens.faculty);
    testData.assessmentId = response.data.assessment._id;
    log.info(`Assessment: ${response.data.assessment.title}`);
  });

  await runTest('Start Assessment', async () => {
    const response = await api.post(`/assessments/${testData.assessmentId}/start`, {}, authTokens.student);
    log.info(`Started with ${response.data.assessment.questions.length} questions`);
  });

  await runTest('Submit Assessment', async () => {
    const answers = [
      { question: testData.questionIds[0], answer: 0 },
      { question: testData.questionIds[1], answer: 0 },
      { question: testData.questionIds[2], answer: true }
    ];

    const response = await api.post(`/assessments/${testData.assessmentId}/submit`, {
      answers
    }, authTokens.student);
    testData.resultId = response.data.result._id;
    
    log.info(`Score: ${response.data.result.score}/${response.data.result.totalMarks} (${response.data.result.percentage}%)`);
  });

  await runTest('Get Student Results', async () => {
    const response = await api.get('/results/my-results', authTokens.student);
    log.info(`Retrieved ${response.data.results.length} result(s)`);
  });

  await runTest('Dashboard Analytics', async () => {
    await api.get(`/analytics/dashboard`, authTokens.faculty);
    log.info(`Dashboard analytics retrieved`);
  });
}

// ============================================================================
// LAYER 3 TESTS - AI Intelligence Layer
// ============================================================================

async function testLayer3() {
  log.header('🤖 LAYER 3 - AI INTELLIGENCE LAYER TESTS');

  let ollamaAvailable = false;
  await runTest('Ollama Service Check', async () => {
    ollamaAvailable = await ollamaService.isAvailable();
    if (!ollamaAvailable) {
      throw new Error('Ollama not available');
    }
    const models = await ollamaService.listModels();
    log.info(`Ollama running: ${models.length} models`);
  });

  await runTest('AI Status API', async () => {
    const response = await api.get('/ai/status', authTokens.faculty);
    log.info(`Model: ${response.data.currentModel}`);
  }, { skip: !ollamaAvailable, skipReason: 'Ollama unavailable' });

  await runTest('AI Question Generation', async () => {
    const response = await api.post('/ai/generate-questions', {
      topic: 'Promises',
      course: testData.courseId,
      difficulty: 'medium',
      count: 2,
      questionType: 'mcq',
      saveToDatabase: true
    }, authTokens.faculty);

    testData.questionIds.push(...response.data.questions.map(q => q._id));
    log.info(`Generated ${response.data.questions.length} questions`);
  }, { skip: !ollamaAvailable, skipReason: 'Ollama unavailable' });

  await runTest('AI Chat Assistant', async () => {
    const response = await api.post('/ai/chat', {
      message: 'Explain promises in one sentence',
      context: []
    }, authTokens.student);

    log.info(`AI: "${response.data.response.substring(0, 60)}..."`);
  }, { skip: !ollamaAvailable, skipReason: 'Ollama unavailable' });

  await runTest('Student Insights', async () => {
    const response = await api.get(`/ai/insights/${testData.studentId}`, authTokens.student);
    log.info(`Mastery: ${response.data.insights.masteryLevel || 0}%`);
  });
}

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

async function testIntegration() {
  log.header('🔄 INTEGRATION TESTS - END-TO-END WORKFLOWS');

  await runTest('Complete Student Workflow', async () => {
    await api.get('/courses', authTokens.student);
    await api.get('/results/my-results', authTokens.student);
    await api.get(`/ai/insights/${testData.studentId}`, authTokens.student);
    
    log.info('✓ Browse → Take → Results → Insights');
  });

  await runTest('Complete Faculty Workflow', async () => {
    await api.get('/analytics/dashboard', authTokens.faculty);
    await api.get(`/analytics/course/${testData.courseId}`, authTokens.faculty);
    await api.get('/questions', authTokens.faculty);

    log.info('✓ Create → Manage → Assess → Analyze');
  });
}

// ============================================================================
// MAIN RUNNER
// ============================================================================

async function runAllTests() {
  console.clear();
  log.header('🧪 COMPREHENSIVE SYSTEM INTEGRATION TESTS');
  log.info(`Target: ${BASE_URL}`);
  log.info(`Time: ${new Date().toLocaleString()}\n`);

  const overallStartTime = Date.now();

  try {
    log.section('🔍 PRE-FLIGHT CHECKS');
    try {
      await axios.get('http://localhost:5000/api/health');
      log.success('✓ Backend server running');
    } catch (error) {
      log.error('✗ Backend server not running!');
      log.warn('Start with: npm run dev');
      process.exit(1);
    }

    try {
      const ollamaAvailable = await ollamaService.isAvailable();
      if (ollamaAvailable) {
        log.success('✓ Ollama service running');
      } else {
        log.warn('⚠ Ollama unavailable - AI tests will be skipped');
      }
    } catch (error) {
      log.warn('⚠ Ollama check failed - AI tests will be skipped');
    }

    await testLayer1();
    await testLayer2();
    await testLayer3();
    await testIntegration();

  } catch (error) {
    log.error(`Fatal: ${error.message}`);
    console.error(error);
  }

  testStats.duration = Date.now() - overallStartTime;

  log.header('📊 FINAL TEST SUMMARY');
  console.log(chalk.cyan(`\n  Total Tests:      ${testStats.total}`));
  console.log(chalk.green(`  ✅ Passed:        ${testStats.passed}`));
  console.log(chalk.red(`  ❌ Failed:        ${testStats.failed}`));
  console.log(chalk.gray(`  ⏭️  Skipped:       ${testStats.skipped}`));
  console.log(chalk.yellow(`  ⏱️  Duration:      ${(testStats.duration / 1000).toFixed(2)}s`));
  const successRate = testStats.total > 0 ? ((testStats.passed / (testStats.total - testStats.skipped)) * 100).toFixed(1) : 0;
  console.log(chalk.magenta(`  📈 Success Rate:  ${successRate}%\n`));

  if (testStats.failed === 0) {
    log.header('🎉 ALL TESTS PASSED! SYSTEM FULLY FUNCTIONAL! 🎉');
  } else if (testStats.failed <= 3) {
    log.header('✅ SYSTEM MOSTLY FUNCTIONAL');
  } else {
    log.header('⚠️  SOME TESTS FAILED');
  }

  log.section('🧹 CLEANUP');
  await mongoose.connection.close();
  log.success('Cleanup complete');

  process.exit(testStats.failed === 0 ? 0 : 1);
}

runAllTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
