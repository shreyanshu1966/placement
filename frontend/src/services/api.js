import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Course API
export const courseAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

// Assignment API
export const assignmentAPI = {
  getAll: (studentId) => api.get('/assignments', { params: { studentId } }),
  getById: (id) => api.get(`/assignments/${id}`),
  getByIdForStudent: (id, studentId) => api.get(`/assignments/${id}/student/${studentId}`),
  create: (data) => api.post('/assignments/create', data), // New faculty-created assignments
  previewQuestions: (data) => api.post('/assignments/preview-questions', data), // Preview questions
  generateAdaptive: (data) => api.post('/assignments/generate-adaptive', data), // AI-generated
  autoTest: (studentId, courseId) => api.post(`/assignments/auto-test/${studentId}`, { courseId }),
  start: (id, studentId) => api.put(`/assignments/${id}/start`, { studentId }),
  saveAnswer: (id, data) => api.post(`/assignments/${id}/save-answer`, data),
  submit: (id, data) => api.post(`/assignments/${id}/submit`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
};

// Question Bank API
export const questionBankAPI = {
  generateBank: (data) => api.post('/question-bank/generate-bank', data),
  selectQuestions: (data) => api.post('/question-bank/select-questions', data),
  getStats: (courseId) => api.get(`/question-bank/stats/${courseId}`),
  getByCourse: (courseId, params) => api.get(`/question-bank/course/${courseId}`, { params }),
  updatePerformance: (data) => api.post('/question-bank/update-performance', data),
};

// Questions API (legacy, for fallback)
export const questionAPI = {
  generate: (data) => api.post('/questions/generate', data),
};

// Results API
export const resultAPI = {
  // Basic result operations
  submit: (data) => api.post('/results', data),
  getByStudent: (studentId) => api.get(`/results/student/${studentId}`),
  getById: (id) => api.get(`/results/${id}`),
  
  // Enhanced analytics endpoints
  getAnalytics: (studentId) => api.get(`/results/analytics/${studentId}`),
  getDashboard: (studentId, timeframe = 'all') => api.get(`/results/dashboard/${studentId}`, { params: { timeframe } }),
  getComparison: (studentId, assignmentId) => api.get(`/results/compare/${studentId}/${assignmentId}`),
  getQuestionAnalysis: (resultId) => api.get(`/results/question-analysis/${resultId}`),
  getLearningPath: (studentId) => api.get(`/results/learning-path/${studentId}`),
  
  // Batch analytics for faculty
  getBatchAnalytics: (courseId) => api.get(`/results/batch/${courseId}`),
};

// Context API
export const contextAPI = {
  get: (studentId) => api.get(`/context/${studentId}`),
  update: (data) => api.post('/context', data),
  updatePerformance: (studentId, data) => api.post(`/context/${studentId}/performance`, data),
  getRecommendation: (studentId, courseId) => api.get(`/context/${studentId}/recommendation/${courseId}`),
};

// Students API
export const studentAPI = {
  getAll: (courseId) => api.get('/students', { params: { courseId } }),
  getById: (studentId) => api.get(`/students/${studentId}`),
  create: (data) => api.post('/students', data),
  enroll: (studentId, courseId) => api.post(`/students/${studentId}/enroll`, { courseId }),
};

// Authentication API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  profile: () => api.get('/auth/profile'),
  quickLogin: (role) => api.post('/auth/quick-login', { role }),
  getUsersByRole: (role) => api.get('/auth/users', { params: { role } }),
};

// Proctoring API
export const proctoringAPI = {
  // Session management
  initializeSession: (assignmentId, studentId, config) => 
    api.post('/proctoring/sessions/initialize', { assignmentId, studentId, proctorConfig: config }),
  startSession: (sessionId, systemCheck) => 
    api.put(`/proctoring/sessions/${sessionId}/start`, { systemCheck }),
  endSession: (sessionId, reason) => 
    api.put(`/proctoring/sessions/${sessionId}/end`, { reason }),
  getSessionDetails: (sessionId) => 
    api.get(`/proctoring/sessions/${sessionId}`),
  
  // Activity recording
  recordSuspiciousActivity: (sessionId, type, severity, details) =>
    api.post(`/proctoring/sessions/${sessionId}/suspicious-activity`, { type, severity, details }),
  recordBiometricData: (sessionId, data) =>
    api.post(`/proctoring/sessions/${sessionId}/biometric-data`, data),
  recordScreenActivity: (sessionId, action, details, duration) =>
    api.post(`/proctoring/sessions/${sessionId}/screen-activity`, { action, details, duration }),
  
  // File uploads
  uploadRecording: (sessionId, formData) =>
    api.post(`/proctoring/sessions/${sessionId}/upload-recording`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  // Faculty/Admin endpoints
  getAssignmentSessions: (assignmentId, filters) => {
    const params = new URLSearchParams(filters);
    return api.get(`/proctoring/assignments/${assignmentId}/sessions?${params}`);
  },
  getLiveMonitoring: (assignmentId) => {
    const params = assignmentId ? `?assignmentId=${assignmentId}` : '';
    return api.get(`/proctoring/sessions/live/monitoring${params}`);
  },
  submitReview: (sessionId, review) =>
    api.post(`/proctoring/sessions/${sessionId}/review`, review),
  getAnalyticsSummary: (assignmentId, timeframe) => {
    const params = new URLSearchParams({ timeframe });
    if (assignmentId) params.append('assignmentId', assignmentId);
    return api.get(`/proctoring/analytics/summary?${params}`);
  }
};

// Set up axios interceptor to include JWT token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;