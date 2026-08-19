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

export const signupAccount = (email, password) =>
  api.post('/users/signup', { email, password, frontend_url: window.location.origin });

export const verifyEmail = (token) => api.post('/users/verify-email', { token });
export const resendVerification = (email) => api.post('/users/resend-verification', { email, frontend_url: window.location.origin });
export const forgotPassword = (email) => api.post('/users/forgot-password', { email, frontend_url: window.location.origin });
export const resetPassword = (token, password) => api.post('/users/reset-password', { token, password });

export const loginAccount = (email, password, deviceId) =>
  api.post('/users/login', { email, password, device_id: deviceId });

export const checkDevice = (learnerId, deviceId) =>
  api.get('/users/check-device', { params: { learner_id: learnerId, device_id: deviceId } });

export const fetchPhoneLearners = (phoneNumber) =>
  api.get('/users/phone-learners', { params: { phone_number: phoneNumber } });

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

export const fetchPrediction = (learnerId, studySeconds = null) => {
  const params = { learner_id: learnerId };
  if (studySeconds !== null) {
    params.study_duration_seconds = studySeconds;
  }
  return api.get('/predictions', { params });
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

export const fetchBooks = () => api.get('/users/books');
export const submitSupportTicket = (payload) => api.post('/users/support/ticket', payload);
export const fetchCommunityPosts = (learnerId) => api.get('/users/community/posts', { params: { learner_id: learnerId } });
export const createCommunityPost = (payload) => api.post('/users/community/posts', payload);
export const toggleLikePost = (postId, learnerId) => api.post(`/users/community/posts/${postId}/like`, { learner_id: learnerId });
export const fetchNotifications = (learnerId) => api.get('/users/notifications', { params: { learner_id: learnerId } });
export const markNotificationsRead = (learnerId) => api.post('/users/notifications/read-all', { learner_id: learnerId });
export const upgradeSubscriptionPlan = (learnerId, planName) => api.post('/users/subscription/upgrade', { learner_id: learnerId, plan_name: planName });
export const googleLogin = (credential, deviceId) => api.post('/users/google-login', { credential, device_id: deviceId });
export const resetUsersDatabase = () => api.post('/users/reset-db');
export const fetchLessonDetail = (lessonId) => api.get(`/lessons/${lessonId}`);