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