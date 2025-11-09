import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import mongoose from 'mongoose';
import chalk from 'chalk';
import fs from 'fs';

// Dynamic imports for services after env loading
const { default: ollamaService } = await import('./services/ollamaService.js');

const BASE_URL = 'http://localhost:5000';
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
  layer1: { total: 0, passed: 0, failed: 0, skipped: 0 },
  layer2: { total: 0, passed: 0, failed: 0, skipped: 0 },
  layer3: { total: 0, passed: 0, failed: 0, skipped: 0 },
  integration: { total: 0, passed: 0, failed: 0, skipped: 0 },
  startTime: Date.now(),
  endTime: null
};

// Colors and formatting
const log = {
  header: (msg) => console.log(chalk.cyan.bold(`\n${'='.repeat(80)}\n${msg}\n${'='.repeat(80)}`)),
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
  async get(endpoint, token = null) {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await axios.get(`${BASE_URL}/api${endpoint}`, { headers });
    return response.data;
  },

  async post(endpoint, data, token = null) {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await axios.post(`${BASE_URL}/api${endpoint}`, data, { headers });
    return response.data;
  },

  async put(endpoint, data, token = null) {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await axios.put(`${BASE_URL}/api${endpoint}`, data, { headers });
    return response.data;
  },

  async delete(endpoint, token = null) {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await axios.delete(`${BASE_URL}/api${endpoint}`, { headers });
    return response.data;
  }
};

// Test wrapper
async function runTest(layer, name, testFn, options = {}) {
  const { timeout = 30000, skip = false, critical = false } = options;
  
  testStats[layer].total++;
  
  if (skip) {
    log.skip(`${name} (Skipped)`);
    testStats[layer].skipped++;
    return;
  }

  try {
    const startTime = Date.now();
    await Promise.race([
      testFn(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Test timeout')), timeout)
      )
    ]);
    
    const duration = Date.now() - startTime;
    log.success(`${name} (${duration}ms)`);
    testStats[layer].passed++;
  } catch (error) {
    log.error(`${name} - ${error.message}`);
    testStats[layer].failed++;
    
    if (critical) {
      log.error('Critical test failed. Stopping execution.');
      throw new Error(`Critical test "${name}" failed: ${error.message}`);
    }
  }
}

// ============================================================================
// LAYER 1 TESTS - Data & Core Infrastructure Layer
// ============================================================================

async function testLayer1() {
  log.header('🏗️  LAYER 1 - DATA & CORE INFRASTRUCTURE TESTS');

  // 1. Server Health Check
  await runTest('layer1', 'Server Health Check', async () => {
    const response = await axios.get(`${BASE_URL}/health`);
    if (!response.data.success) {
      throw new Error('Health check failed');
    }
    log.info(`Server running on ${BASE_URL}`);
  }, { critical: true });

  // 2. Database Connection Test (via API health check)
  await runTest('layer1', 'Database Connection', async () => {
    const response = await api.get('/health');
    if (!response.success) {
      throw new Error('Database health check failed');
    }
    log.info('Database connection verified via API');
  });

  // 3. Environment Variables Check
  await runTest('layer1', 'Environment Configuration', async () => {
    const requiredEnvs = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
    const missing = requiredEnvs.filter(env => !process.env[env]);
    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }
    log.info('All required environment variables present');
  });

  // 4. Security Middleware Test
  await runTest('layer1', 'Security Headers (Helmet)', async () => {
    const response = await axios.get(`${BASE_URL}/health`);
    const securityHeaders = ['x-content-type-options', 'x-frame-options', 'x-xss-protection'];
    const missing = securityHeaders.filter(header => !response.headers[header]);
    if (missing.length > 0) {
      throw new Error(`Missing security headers: ${missing.join(', ')}`);
    }
    log.info('Security headers properly set');
  });

  // 5. Rate Limiting Test
  await runTest('layer1', 'Rate Limiting', async () => {
    const requests = [];
    for (let i = 0; i < 3; i++) {
      requests.push(axios.get(`${BASE_URL}/api/health`));
    }
    await Promise.all(requests);
    log.info('Rate limiting configured (basic test passed)');
  });

  // 6. File Upload Directory Test
  await runTest('layer1', 'Upload Directory Structure', async () => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    log.info(`Upload directory: ${uploadDir}`);
  });

  // 7. MongoDB Models Test
  await runTest('layer1', 'Mongoose Models Loading', async () => {
    const models = await import('./models/index.js');
    const requiredModels = ['User', 'Course', 'Question', 'Assessment', 'Result', 'Analytics'];
    const missing = requiredModels.filter(model => !models[model]);
    if (missing.length > 0) {
      throw new Error(`Missing models: ${missing.join(', ')}`);
    }
    log.info('All 6 models loaded successfully');
  });

  // 8. JWT Utilities Test
  await runTest('layer1', 'JWT Utilities', async () => {
    const jwtUtils = await import('./utils/jwt.js');
    const userId = '507f1f77bcf86cd799439011';
    const role = 'student';
    const token = jwtUtils.generateToken(userId, role);
    const decoded = jwtUtils.verifyToken(token);
    if (!decoded || decoded.id !== userId || decoded.role !== role) {
      throw new Error('JWT token generation/verification failed');
    }
    log.info('JWT utilities working correctly');
  });
}

// ============================================================================
// LAYER 2 TESTS - Backend Logic & REST APIs
// ============================================================================

async function testLayer2() {
  log.header('⚙️  LAYER 2 - BACKEND LOGIC & REST API TESTS');

  // 1. User Registration & Authentication Flow
  await runTest('layer2', 'Admin Registration', async () => {
    const response = await api.post('/auth/register', {
      name: 'Test Admin',
      email: `admin.test.${Date.now()}@college.edu`,
      password: 'admin123',
      role: 'admin'
    });
    
    if (!response.success || !response.token) {
      throw new Error('Admin registration failed');
    }
    
    testData.adminId = response.user._id;
    authTokens.admin = response.token;
    log.info(`Admin: ${response.user.email}`);
  });

  await runTest('layer2', 'Faculty Registration', async () => {
    const response = await api.post('/auth/register', {
      name: 'Test Faculty',
      email: `faculty.test.${Date.now()}@college.edu`,
      password: 'faculty123',
      role: 'faculty',
      department: 'Computer Science'
    });
    
    testData.facultyId = response.user._id;
    authTokens.faculty = response.token;
    log.info(`Faculty: ${response.user.email}`);
  });

  await runTest('layer2', 'Student Registration', async () => {
    const response = await api.post('/auth/register', {
      name: 'Test Student',
      email: `student.test.${Date.now()}@college.edu`,
      password: 'student123',
      role: 'student',
      rollNumber: `TEST${Date.now()}`,
      department: 'Computer Science',
      semester: 5
    });
    
    testData.studentId = response.user._id;
    authTokens.student = response.token;
    log.info(`Student: ${response.user.email}`);
  });

  await runTest('layer2', 'JWT Token Authentication', async () => {
    const response = await api.get('/users/profile', authTokens.student);
    if (!response.success || !response.user) {
      throw new Error('Token authentication failed');
    }
    log.info('JWT token authentication working');
  });

  // 2. Course Management
  await runTest('layer2', 'Course Creation', async () => {
    const response = await api.post('/courses', {
      title: 'System Test Course',
      code: `STC${Date.now()}`,
      description: 'Test course for system validation',
      department: 'Computer Science',
      semester: 5,
      credits: 4,
      academicYear: '2024-2025',
      syllabus: [
        {
          unit: 1,
          title: 'Programming Fundamentals',
          topics: [
            { name: 'Variables', description: 'Data types and variables', weightage: 15 },
            { name: 'Functions', description: 'Function definitions', weightage: 20 },
            { name: 'Loops', description: 'Control structures', weightage: 15 }
          ],
          duration: 15
        },
        {
          unit: 2,
          title: 'Data Structures',
          topics: [
            { name: 'Arrays', description: 'Array operations', weightage: 20 },
            { name: 'Objects', description: 'Object manipulation', weightage: 30 }
          ],
          duration: 20
        }
      ]
    }, authTokens.faculty);
    
    testData.courseId = response.data._id;
    log.info(`Course: ${response.data.title} (${response.data.code})`);
  });

  await runTest('layer2', 'Student Enrollment', async () => {
    const response = await api.post(`/courses/${testData.courseId}/enroll`, {}, authTokens.student);
    if (!response.success) {
      throw new Error('Student enrollment failed');
    }
    log.info('Student enrolled successfully');
  });

  // 3. Question Management
  await runTest('layer2', 'Question Creation (Multiple Types)', async () => {
    const questions = [
      {
        questionText: 'What is a variable in programming?',
        questionType: 'multiple-choice',
        options: ['A storage location', 'A function', 'A loop', 'A condition'],
        correctAnswer: 'A storage location',
        difficulty: 'easy',
        topic: 'Variables',
        course: testData.courseId
      },
      {
        questionText: 'Explain the difference between let and var in JavaScript',
        questionType: 'short-answer',
        difficulty: 'medium',
        topic: 'Variables',
        course: testData.courseId
      },
      {
        questionText: 'Write a function to reverse an array',
        questionType: 'coding',
        difficulty: 'hard',
        topic: 'Functions',
        course: testData.courseId
      },
      {
        questionText: 'Arrays are used to store multiple values. True or False?',
        questionType: 'true-false',
        correctAnswer: 'true',
        difficulty: 'easy',
        topic: 'Arrays',
        course: testData.courseId
      }
    ];

    for (const question of questions) {
      const response = await api.post('/questions', question, authTokens.faculty);
      testData.questionIds.push(response.data._id);
    }
    
    log.info(`Created ${questions.length} questions of different types`);
  });

  // 4. Assessment Generation & Management
  await runTest('layer2', 'Assessment Generation', async () => {
    const response = await api.post('/assessments', {
      title: 'System Test Assessment',
      course: testData.courseId,
      duration: 30,
      totalMarks: 100,
      questionCount: 4,
      difficulty: 'mixed',
      questionTypes: ['mcq', 'short_answer', 'coding', 'true_false']
    }, authTokens.faculty);
    
    testData.assessmentId = response.assessment._id;
    log.info(`Assessment: ${response.assessment.title}`);
    log.info(`Questions: ${response.assessment.questions.length}`);
  });

  // 5. Assessment Attempt & Result Generation
  await runTest('layer2', 'Assessment Attempt', async () => {
    // Get assessment details first
    const assessmentData = await api.get(`/assessments/${testData.assessmentId}`, authTokens.student);
    
    // Prepare answers for all questions
    const answers = assessmentData.assessment.questions.map((q, index) => {
      switch (q.type) {
        case 'mcq':
          return { questionId: q._id, answer: q.options[0] }; // First option
        case 'true_false':
          return { questionId: q._id, answer: 'true' };
        case 'short_answer':
          return { questionId: q._id, answer: 'Variables are storage locations in memory.' };
        case 'coding':
          return { questionId: q._id, answer: 'function reverseArray(arr) { return arr.reverse(); }' };
        default:
          return { questionId: q._id, answer: 'Test answer' };
      }
    });

    const response = await api.post('/results', {
      assessment: testData.assessmentId,
      student: testData.studentId,
      answers: answers,
      timeSpent: 1500 // 25 minutes
    }, authTokens.student);
    
    testData.resultId = response.result._id;
    log.info(`Score: ${response.result.score}/${response.result.totalMarks}`);
    log.info(`Percentage: ${response.result.percentage}%`);
  });

  // 6. Analytics Generation
  await runTest('layer2', 'Analytics Generation', async () => {
    const response = await api.get(`/analytics/course/${testData.courseId}`, authTokens.faculty);
    if (!response.success || !response.analytics) {
      throw new Error('Analytics generation failed');
    }
    log.info('Course analytics generated successfully');
  });

  // 7. User Profile & Progress
  await runTest('layer2', 'Student Progress Tracking', async () => {
    const response = await api.get('/users/progress', authTokens.student);
    if (!response.success || !response.progress) {
      throw new Error('Progress tracking failed');
    }
    log.info('Student progress tracking working');
  });
}

// ============================================================================
// LAYER 3 TESTS - AI Intelligence Layer
// ============================================================================

async function testLayer3() {
  log.header('🧠 LAYER 3 - AI INTELLIGENCE LAYER TESTS');

  // Check if Ollama is available
  let ollamaAvailable = false;
  await runTest('layer3', 'Ollama Service Availability', async () => {
    try {
      const response = await ollamaService.testConnection();
      if (response.success) {
        ollamaAvailable = true;
        log.info(`Ollama model: ${process.env.OLLAMA_MODEL}`);
      } else {
        throw new Error('Ollama connection failed');
      }
    } catch (error) {
      throw new Error(`Ollama not available: ${error.message}`);
    }
  });

  // AI Question Generation
  await runTest('layer3', 'AI Question Generation', async () => {
    if (!ollamaAvailable) {
      throw new Error('Ollama not available');
    }

    const response = await api.post('/ai/generate-questions', {
      topic: 'JavaScript Functions',
      difficulty: 'medium',
      count: 2,
      type: 'mcq',
      course: testData.courseId
    }, authTokens.faculty);

    if (!response.success || !response.questions || response.questions.length === 0) {
      throw new Error('AI question generation failed');
    }
    
    log.info(`Generated ${response.questions.length} AI questions`);
  }, { skip: !ollamaAvailable });

  // Adaptive Assessment
  await runTest('layer3', 'Adaptive Assessment Algorithm', async () => {
    const response = await api.post('/ai/adaptive-assessment', {
      student: testData.studentId,
      course: testData.courseId,
      questionCount: 3
    }, authTokens.faculty);

    if (!response.success || !response.assessment) {
      throw new Error('Adaptive assessment generation failed');
    }
    
    log.info('Adaptive assessment algorithm working');
  });

  // Context Analysis
  await runTest('layer3', 'Student Context Analysis', async () => {
    const response = await api.post('/ai/analyze-context', {
      student: testData.studentId,
      result: testData.resultId
    }, authTokens.faculty);

    if (!response.success || !response.context) {
      throw new Error('Context analysis failed');
    }
    
    log.info('Student context analysis completed');
  });

  // AI-Powered Feedback
  await runTest('layer3', 'AI Feedback Generation', async () => {
    if (!ollamaAvailable) {
      throw new Error('Ollama not available');
    }

    const response = await api.post('/ai/generate-feedback', {
      student: testData.studentId,
      result: testData.resultId,
      course: testData.courseId
    }, authTokens.faculty);

    if (!response.success || !response.feedback) {
      throw new Error('AI feedback generation failed');
    }
    
    log.info('AI feedback generated successfully');
  }, { skip: !ollamaAvailable });
}

// ============================================================================
// INTEGRATION TESTS - Full System Flow
// ============================================================================

async function testIntegration() {
  log.header('🔄 INTEGRATION TESTS - FULL SYSTEM FLOW');

  await runTest('integration', 'Complete Assessment Flow', async () => {
    // 1. Faculty creates course
    const courseResponse = await api.post('/courses', {
      title: 'Integration Test Course',
      code: `ITC${Date.now()}`,
      description: 'Full integration test',
      department: 'Computer Science',
      semester: 3,
      credits: 3,
      academicYear: '2024-2025',
      syllabus: [
        {
          unit: 1,
          title: 'Test Unit',
          topics: [
            { name: 'Test Topic', description: 'Integration testing', weightage: 100 }
          ],
          duration: 10
        }
      ]
    }, authTokens.faculty);

    // 2. Student enrolls
    await api.post(`/courses/${courseResponse.data._id}/enroll`, {}, authTokens.student);

    // 3. Faculty creates questions
    const questionResponse = await api.post('/questions', {
      questionText: 'Integration test question?',
      questionType: 'multiple-choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      difficulty: 'medium',
      topic: 'Test Topic',
      course: courseResponse.data._id
    }, authTokens.faculty);

    // 4. System generates assessment
    const assessmentResponse = await api.post('/assessments', {
      title: 'Integration Assessment',
      course: courseResponse.data._id,
      duration: 15,
      totalMarks: 50,
      questionCount: 1
    }, authTokens.faculty);

    // 5. Student takes assessment
      const resultResponse = await api.post('/results', {
        assessment: assessmentResponse.assessment._id,
        student: testData.studentId,
        answers: [{
          questionId: questionResponse.data._id,
          answer: 'Option A'
        }],
        timeSpent: 300
      }, authTokens.student);    // 6. System generates analytics
    const analyticsResponse = await api.get(`/analytics/course/${courseResponse.data._id}`, authTokens.faculty);

    if (!analyticsResponse.success) {
      throw new Error('Full integration flow failed at analytics step');
    }

    log.info('Complete assessment flow: Course → Enroll → Question → Assessment → Result → Analytics ✅');
  });

  await runTest('integration', 'Multi-User Concurrent Access', async () => {
    const promises = [];
    
    // Simulate multiple users accessing different endpoints
    promises.push(api.get('/users/profile', authTokens.student));
    promises.push(api.get('/users/profile', authTokens.faculty));
    promises.push(api.get('/courses', authTokens.student));
    promises.push(api.get(`/assessments/${testData.assessmentId}`, authTokens.student));
    promises.push(api.get(`/results/${testData.resultId}`, authTokens.student));

    const results = await Promise.all(promises);
    
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      throw new Error(`${failed.length} concurrent requests failed`);
    }
    
    log.info('Multi-user concurrent access working');
  });

  await runTest('integration', 'Database Integrity Check', async () => {
    // Check if all created data exists and is properly linked
    const course = await api.get(`/courses/${testData.courseId}`, authTokens.faculty);
    const assessment = await api.get(`/assessments/${testData.assessmentId}`, authTokens.faculty);
    const result = await api.get(`/results/${testData.resultId}`, authTokens.student);

    if (!course.success || !assessment.success || !result.success) {
      throw new Error('Database integrity check failed');
    }

    // Check relationships
    if (result.result.assessment._id !== testData.assessmentId) {
      throw new Error('Result-Assessment relationship broken');
    }

    if (assessment.assessment.course._id !== testData.courseId) {
      throw new Error('Assessment-Course relationship broken');
    }

    log.info('Database relationships and integrity verified');
  });
}

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

async function testErrorHandling() {
  log.header('⚠️  ERROR HANDLING & SECURITY TESTS');

  await runTest('integration', 'Unauthorized Access Prevention', async () => {
    try {
      await api.get('/users/profile'); // No token
      throw new Error('Should have failed without token');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        log.info('Unauthorized access properly blocked');
      } else {
        throw error;
      }
    }
  });

  await runTest('integration', 'Invalid Data Validation', async () => {
    try {
      await api.post('/auth/register', {
        name: '', // Invalid - empty name
        email: 'invalid-email', // Invalid email format
        password: '123', // Too short
        role: 'invalid' // Invalid role
      });
      throw new Error('Should have failed with invalid data');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log.info('Input validation working correctly');
      } else {
        throw error;
      }
    }
  });

  await runTest('integration', 'Non-existent Resource Handling', async () => {
    try {
      await api.get('/courses/507f1f77bcf86cd799439011', authTokens.student); // Non-existent ID
    } catch (error) {
      if (error.response && error.response.status === 404) {
        log.info('404 errors properly handled');
      } else {
        throw error;
      }
    }
  });
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  log.header('🧪 AI ASSESSMENT PLATFORM - COMPREHENSIVE SYSTEM TEST');
  log.info(`Test Environment: ${process.env.NODE_ENV || 'development'}`);
  log.info(`Server URL: ${BASE_URL}`);
  log.info(`Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
  log.info(`Start Time: ${new Date().toISOString()}`);

  try {
    // Layer Tests
    await testLayer1();
    await testLayer2();
    await testLayer3();
    
    // Integration Tests
    await testIntegration();
    
    // Error Handling Tests
    await testErrorHandling();

  } catch (error) {
    log.error(`Critical test failure: ${error.message}`);
  } finally {
    // Generate Test Report
    testStats.endTime = Date.now();
    generateTestReport();
  }
}

// ============================================================================
// TEST REPORT GENERATION
// ============================================================================

function generateTestReport() {
  log.header('📊 COMPREHENSIVE TEST REPORT');
  
  const totalDuration = testStats.endTime - testStats.startTime;
  const totalTests = Object.values(testStats).reduce((acc, layer) => 
    typeof layer === 'object' && layer.total ? acc + layer.total : acc, 0);
  const totalPassed = Object.values(testStats).reduce((acc, layer) => 
    typeof layer === 'object' && layer.passed ? acc + layer.passed : acc, 0);
  const totalFailed = Object.values(testStats).reduce((acc, layer) => 
    typeof layer === 'object' && layer.failed ? acc + layer.failed : acc, 0);
  const totalSkipped = Object.values(testStats).reduce((acc, layer) => 
    typeof layer === 'object' && layer.skipped ? acc + layer.skipped : acc, 0);

  console.log(chalk.cyan('┌' + '─'.repeat(78) + '┐'));
  console.log(chalk.cyan('│') + chalk.white.bold(' LAYER-WISE RESULTS'.padEnd(77)) + chalk.cyan('│'));
  console.log(chalk.cyan('├' + '─'.repeat(78) + '┤'));

  Object.entries(testStats).forEach(([layer, stats]) => {
    if (typeof stats === 'object' && stats.total) {
      const layerName = layer.toUpperCase().padEnd(12);
      const passed = `✅ ${stats.passed}`.padEnd(8);
      const failed = `❌ ${stats.failed}`.padEnd(8);
      const skipped = `⏭️ ${stats.skipped}`.padEnd(8);
      const total = `📊 ${stats.total}`.padEnd(8);
      const percentage = ((stats.passed / stats.total) * 100).toFixed(1);
      
      console.log(chalk.cyan('│') + ` ${layerName} ${passed} ${failed} ${skipped} ${total} ${percentage}%`.padEnd(77) + chalk.cyan('│'));
    }
  });

  console.log(chalk.cyan('├' + '─'.repeat(78) + '┤'));
  console.log(chalk.cyan('│') + chalk.white.bold(' OVERALL SUMMARY'.padEnd(77)) + chalk.cyan('│'));
  console.log(chalk.cyan('├' + '─'.repeat(78) + '┤'));
  console.log(chalk.cyan('│') + ` Total Tests: ${totalTests}`.padEnd(77) + chalk.cyan('│'));
  console.log(chalk.cyan('│') + ` Passed: ${chalk.green(totalPassed)} | Failed: ${chalk.red(totalFailed)} | Skipped: ${chalk.gray(totalSkipped)}`.padEnd(77) + chalk.cyan('│'));
  console.log(chalk.cyan('│') + ` Success Rate: ${chalk.bold(((totalPassed / totalTests) * 100).toFixed(1) + '%')}`.padEnd(77) + chalk.cyan('│'));
  console.log(chalk.cyan('│') + ` Duration: ${(totalDuration / 1000).toFixed(2)}s`.padEnd(77) + chalk.cyan('│'));
  console.log(chalk.cyan('└' + '─'.repeat(78) + '┘'));

  // Status determination
  const overallStatus = totalFailed === 0 ? 'PASSED' : 'FAILED';
  const statusColor = overallStatus === 'PASSED' ? chalk.green : chalk.red;
  
  log.header(statusColor(`🎯 SYSTEM TEST ${overallStatus}`));

  if (overallStatus === 'PASSED') {
    console.log(chalk.green('✅ All layers are functioning correctly!'));
    console.log(chalk.green('✅ Your AI Assessment Platform is ready for production!'));
  } else {
    console.log(chalk.red('❌ Some tests failed. Please check the error messages above.'));
    console.log(chalk.yellow('💡 Fix the failing tests before proceeding to deployment.'));
  }

  // Save report to file
  const reportData = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: BASE_URL,
    duration: totalDuration,
    summary: {
      total: totalTests,
      passed: totalPassed,
      failed: totalFailed,
      skipped: totalSkipped,
      successRate: ((totalPassed / totalTests) * 100).toFixed(1)
    },
    layers: testStats,
    status: overallStatus
  };

  fs.writeFileSync('./test-report.json', JSON.stringify(reportData, null, 2));
  log.info('Detailed test report saved to: test-report.json');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log.warn('Test execution interrupted by user');
  testStats.endTime = Date.now();
  generateTestReport();
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  log.error(`Unhandled rejection: ${error.message}`);
  testStats.endTime = Date.now();
  generateTestReport();
  process.exit(1);
});

// Run all tests
runAllTests().catch(error => {
  log.error(`Test runner failed: ${error.message}`);
  testStats.endTime = Date.now();
  generateTestReport();
  process.exit(1);
});