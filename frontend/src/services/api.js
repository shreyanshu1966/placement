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
  create: (data) => api.post('/assignments/create', data), // New faculty-created assignments
  previewQuestions: (data) => api.post('/assignments/preview-questions', data), // Preview questions
  generateAdaptive: (data) => api.post('/assignments/generate-adaptive', data), // AI-generated
  autoTest: (studentId, courseId) => api.post(`/assignments/auto-test/${studentId}`, { courseId }),
  start: (id) => api.put(`/assignments/${id}/start`),
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
  submit: (data) => api.post('/results', data),
  getByStudent: (studentId) => api.get(`/results/student/${studentId}`),
  getById: (id) => api.get(`/results/${id}`),
  getAnalytics: (studentId) => api.get(`/results/analytics/${studentId}`),
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

export default api;