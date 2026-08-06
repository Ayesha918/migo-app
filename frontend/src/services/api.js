// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://migo-app-1.onrender.com/api',
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

export const submitAssessment = (payload) =>
  api.post('/assessments/submit', payload);

export const fetchQuestions = (type, language, learnerId) =>
  api.get('/assessments/questions', { params: { type, language, learner_id: learnerId } });

export const fetchLearningPath = (learnerId) =>
  api.get('/lessons/path', { params: { learner_id: learnerId } });

export const generateLearningPath = (learnerId) =>
  api.post('/lessons/path/generate', { learner_id: learnerId });

export const completeLessonDay = (learnerId, dayNumber) =>
  api.put('/lessons/path/complete', { learner_id: learnerId, day_number: dayNumber });

export const fetchPrediction = (learnerId) => {
  return api.get('/predictions', { params: { learner_id: learnerId } });
};

export const fetchRewardsSummary = (learnerId) =>
  api.get('/rewards/summary', { params: { learner_id: learnerId } });

export const fetchDashboardSummary = (learnerId) =>
  api.get('/dashboard/summary', { params: { learner_id: learnerId } });

// Real-Time Study tracking & Forecast Analytics
export const startSession = (learnerId) =>
  api.post('/session/start', { learner_id: learnerId });

export const endSession = (learnerId) =>
  api.post('/session/end', { learner_id: learnerId });

export const fetchUserAnalytics = (learnerId) =>
  api.get('/user-analytics', { params: { learner_id: learnerId } });

export const submitQuizScore = (learnerId, type, score) =>
  api.post('/quiz/submit', { learner_id: learnerId, assessment_type: type, score: score });

export const uploadSpeechAudio = (formData) =>
  api.post('/dashboard/speech/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const fetchSpeechHistory = (learnerId) =>
  api.get(`/dashboard/speech/history/${learnerId}/`);

export const fetchLessonsByLevel = (learnerId, level) =>
  api.get('/lessons/by-level', { params: { learner_id: learnerId, level: level } });