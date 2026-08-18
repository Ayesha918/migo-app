import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './components/Landing/Landing';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Assessment from './components/Assessment/Assessment';
import Home from './components/Home/Home';
import LessonPlayer from './components/Lessons/LessonPlayer';
import PronunciationPractice from './components/Lessons/PronunciationPractice';
import Learn from './components/Learn/Learn';
import Roadmap from './components/Roadmap/Roadmap';
import PredictionPage from './components/Dashboard/PredictionPage';
import VoiceAssistantChatbot from './components/Home/VoiceAssistantChatbot';
import AccessibilityToggles from './components/Common/AccessibilityToggles';
import PlacementAssessment from './components/Assessment/PlacementAssessment';
import Library from './components/Extra/Library';
import Support from './components/Extra/Support';
import Community from './components/Extra/Community';
import Notifications from './components/Extra/Notifications';
import Certifications from './components/Extra/Certifications';
import { useLearner } from './services/LearnerContext';
import { startSession, endSession } from './services/api';
import './App.css';

function App() {
  const { learner } = useLearner();

  useEffect(() => {
    if (!learner) return;

    // Start study session in backend
    startSession(learner.learner_id)
      .then((res) => {
        const sessId = res.data?.session_id;
        if (sessId) {
          localStorage.setItem('migo_session_id', sessId.toString());
        }
      })
      .catch((err) => console.error('Error starting session:', err));

    // End session helper
    const handleEndSession = () => {
      endSession(learner.learner_id).catch((err) => console.error('Error ending session:', err));
    };

    window.addEventListener('beforeunload', handleEndSession);
    
    return () => {
      window.removeEventListener('beforeunload', handleEndSession);
      handleEndSession();
    };
  }, [learner]);

  return (
    <>
      <AccessibilityToggles />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assessment/placement" element={<PlacementAssessment />} />
        <Route path="/assessment/:type" element={<Assessment />} />
        <Route path="/home" element={<Home />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/prediction" element={<PredictionPage />} />
        <Route path="/pronunciation" element={<PronunciationPractice />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/lesson-player" element={<LessonPlayer />} />
        <Route path="/library" element={<Library />} />
        <Route path="/community" element={<Community />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/certifications" element={<Certifications />} />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <VoiceAssistantChatbot />
    </>
  );
}

export default App;