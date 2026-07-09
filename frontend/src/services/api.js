// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerLearner = (data) => api.post('/users/register', data);

export const searchLearnerById = (learnerId) =>
  api.get('/users/search', { params: { learner_id: learnerId } });

export const searchLearnerByName = (name) =>
  api.get('/users/search', { params: { name } });

export default api;
// add to src/services/api.js, alongside existing exports

export const fetchQuestions = (type, language) =>
  api.get('/assessments/questions', { params: { type, language } });

export const submitAssessment = (payload) =>
  api.post('/assessments/submit', payload);

export const fetchDashboardSummary = (learnerId) =>
  api.get('/dashboard/summary', { params: { learner_id: learnerId } });