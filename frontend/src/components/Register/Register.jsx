// src/components/Register/Register.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import StepName from './StepName';
import StepAge from './StepAge';
import StepLanguage from './StepLanguage';
import StepAvatar from './StepAvatar';
import styles from './Register.module.css';

const TOTAL_STEPS = 4;

function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    language: '',
    avatar: '',
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.name.trim().length > 0;
      case 1: return formData.age !== '' && Number(formData.age) > 0;
      case 2: return formData.language !== '';
      case 3: return formData.avatar !== '';
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigate('/');
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    // TODO (Module 9 area): replace this with a real API call once the
    // Learner model + /api/users/register endpoint exist on the backend.
    console.log('Registration data ready to submit:', formData);
    alert('Registration complete! (Backend save wired in a later module)');
  };

  const steps = [
    <StepName value={formData.name} onChange={(v) => updateField('name', v)} />,
    <StepAge value={formData.age} onChange={(v) => updateField('age', v)} />,
    <StepLanguage value={formData.language} onChange={(v) => updateField('language', v)} />,
    <StepAvatar value={formData.avatar} onChange={(v) => updateField('avatar', v)} />,
  ];

  return (
    <div className={styles.page}>
      <button className={styles.backButton} onClick={handleBack} type="button">‹</button>

      <h1 className={styles.pageTitle}>Join Us</h1>
      <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.35 }}
          className={styles.stepContent}
        >
          {steps[currentStep]}
        </motion.div>
      </AnimatePresence>

      <button
        className={styles.nextButton}
        onClick={handleNext}
        disabled={!isStepValid()}
        type="button"
      >
        {currentStep === TOTAL_STEPS - 1 ? 'Finish' : 'Next'}
      </button>
    </div>
  );
}

export default Register;