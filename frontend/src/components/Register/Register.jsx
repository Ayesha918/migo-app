// src/components/Register/Register.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import StepName from './StepName';
import StepAge from './StepAge';
import StepLanguage from './StepLanguage';
import StepAvatar from './StepAvatar';
import { registerLearner } from '../../services/api';
import styles from './Register.module.css';
import RegistrationSuccess from './RegistrationSuccess';
import { useLearner } from '../../services/LearnerContext';
import useTranslate from '../../services/useTranslate';

const TOTAL_STEPS = 4;

function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [registeredLearner, setRegisteredLearner] = useState(null);
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const { setLearner } = useLearner();
  const t = useTranslate();

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.name.trim().length > 0;
      case 1: return formData.age !== '' && Number(formData.age) > 0;
      case 2: return formData.knownLanguage !== '' && formData.learningLanguage !== '';
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

  const handleFinish = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const response = await registerLearner({
          name: formData.name.trim(),
          age: Number(formData.age),
          known_language: formData.knownLanguage,
          learning_language: formData.learningLanguage,
          avatar: formData.avatar,
    });

      const learner = response.data;

      // Pass the full learner record forward to the Dashboard via navigation state.
      // (No login system/tokens in this milestone — the spec explicitly has no
      // PIN/password, so the learner record itself is what identifies the session.)
      setLearner(response.data);
      setRegisteredLearner(response.data);
    } catch (error) {
      console.error('Registration failed:', error);
      setSubmitError(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const [formData, setFormData] = useState({
  name: '', age: '', knownLanguage: '', learningLanguage: '', avatar: '',
});
  const steps = [
    <StepName value={formData.name} onChange={(v) => updateField('name', v)} />,
    <StepAge value={formData.age} onChange={(v) => updateField('age', v)} />,
    <StepLanguage knownValue={formData.knownLanguage}
  learningValue={formData.learningLanguage}
  onKnownChange={(v) => updateField('knownLanguage', v)}
  onLearningChange={(v) => updateField('learningLanguage', v)} />,
    <StepAvatar value={formData.avatar} onChange={(v) => updateField('avatar', v)} />,
  ];
  if (registeredLearner) {
  return <RegistrationSuccess learner={registeredLearner} />;
}
  return (
    <div className={styles.page}>
      <button className={styles.backButton} onClick={handleBack} type="button">‹</button>

      <h1 className={styles.pageTitle}>{t('joinUs')}</h1>
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

      {submitError && <p className={styles.errorText}>{submitError}</p>}

      <button
        className={styles.nextButton}
        onClick={handleNext}
        disabled={!isStepValid() || isSubmitting}
        type="button"
      >
        {isSubmitting
          ? 'Saving...'
          : currentStep === TOTAL_STEPS - 1
          ? t('finishBtn')
          : t('nextBtn')}
      </button>
    </div>
  );
}

export default Register;