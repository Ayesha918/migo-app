// src/services/LearnerContext.jsx
import { createContext, useContext, useState } from 'react';

const LearnerContext = createContext(null);

const STORAGE_KEY = 'migo_learner';

export function LearnerProvider({ children }) {
  const [learner, setLearnerState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const setLearner = (learnerData) => {
    setLearnerState(learnerData);
    if (learnerData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(learnerData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const logout = () => setLearner(null);

  return (
    <LearnerContext.Provider value={{ learner, setLearner, logout }}>
      {children}
    </LearnerContext.Provider>
  );
}

export function useLearner() {
  const context = useContext(LearnerContext);
  if (!context) {
    throw new Error('useLearner must be used within a LearnerProvider');
  }
  return context;
}