// src/services/LearnerContext.jsx
import { createContext, useContext, useState } from 'react';
import SubscriptionGateModal from '../components/Common/SubscriptionGateModal';

const LearnerContext = createContext(null);

const STORAGE_KEY = 'migo_learner';

const TIER_RANKS = {
  'free': 0,
  'pro': 1,
  'premium': 2,
};

export function LearnerProvider({ children }) {
  const [learner, setLearnerState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [gateModal, setGateModal] = useState(null);

  const setLearner = (learnerData) => {
    setLearnerState(learnerData);
    if (learnerData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(learnerData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const logout = () => {
    setLearner(null);
    setGateModal(null);
  };

  const hasFeatureAccess = (requiredTier) => {
    return true; // Always unlocked for AI Powered Literacy Assistant demo
  };

  const triggerUpgradeModal = (requiredTier, featureName, onConfirm) => {
    setGateModal({ requiredTier, featureName, onConfirm });
  };

  return (
    <LearnerContext.Provider value={{ 
      learner, 
      setLearner, 
      logout, 
      hasFeatureAccess, 
      triggerUpgradeModal 
    }}>
      {children}
      {gateModal && (
        <SubscriptionGateModal
          requiredTier={gateModal.requiredTier}
          featureName={gateModal.featureName}
          onClose={() => setGateModal(null)}
          learner={learner}
          setLearner={setLearner}
          onConfirm={() => {
            const callback = gateModal.onConfirm;
            setGateModal(null);
            if (callback) callback();
          }}
        />
      )}
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