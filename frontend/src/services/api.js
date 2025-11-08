import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
};

// User API
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  bulkCreate: (data) => api.post('/users/bulk-create', data),
};

// Course API
export const courseAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
};

// Question API
export const questionAPI = {
  getAll: (params) => api.get('/questions', { params }),
  getById: (id) => api.get(`/questions/${id}`),
  create: (data) => api.post('/questions', data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`),
};

// Assessment API
export const assessmentAPI = {
  getAll: (params) => api.get('/assessments', { params }),
  getById: (id) => api.get(`/assessments/${id}`),
  create: (data) => api.post('/assessments', data),
  update: (id, data) => api.put(`/assessments/${id}`, data),
  delete: (id) => api.delete(`/assessments/${id}`),
  generate: (data) => api.post('/assessments/generate', data),
  start: (id) => api.post(`/assessments/${id}/start`),
  submit: (id, data) => api.post(`/assessments/${id}/submit`, data),
};

// Result API
export const resultAPI = {
  getAll: (params) => api.get('/results', { params }),
  getById: (id) => api.get(`/results/${id}`),
  getMyResults: () => api.get('/results/my-results'),
  getReport: (id) => api.get(`/results/${id}/report`),
  getByStudent: (studentId) => api.get(`/results/student/${studentId}`),
  getByAssessment: (assessmentId) => api.get(`/results/assessment/${assessmentId}`),
  delete: (id) => api.delete(`/results/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getStudentAnalytics: (id) => api.get(`/analytics/student/${id}`),
  getCourseAnalytics: (id) => api.get(`/analytics/course/${id}`),
  getAssessmentAnalytics: (id) => api.get(`/analytics/assessment/${id}`),
  getTrends: (params) => api.get('/analytics/trends', { params }),
  getTopicAnalysis: (params) => api.get('/analytics/topic-analysis', { params }),
  getComparative: (params) => api.get('/analytics/comparative', { params }),
};

// AI API
export const aiAPI = {
  getStatus: () => api.get('/ai/status'),
  generateQuestions: (data) => api.post('/ai/generate-questions', data),
  generateForWeakTopics: (data) => api.post('/ai/generate-for-weak-topics', data),
  enhanceQuestion: (id) => api.post(`/ai/enhance-question/${id}`),
  getInsights: (studentId) => api.get(`/ai/insights/${studentId}`),
  chat: (data) => api.post('/ai/chat', data),
  pullModel: (data) => api.post('/ai/pull-model', data),
};

export default api;
