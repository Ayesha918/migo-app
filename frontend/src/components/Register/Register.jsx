// src/components/Register/Register.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import StepName from './StepName';
import StepAge from './StepAge';
import StepLanguage from './StepLanguage';
import StepAvatar from './StepAvatar';
import {
  registerLearner, fetchPhoneLearners, googleLogin, signupAccount, resendVerification
} from '../../services/api';
import { useLearner } from '../../services/LearnerContext';
import { Mail, HelpCircle, ArrowLeft, Plus, Eye, EyeOff } from 'lucide-react';
import styles from './Register.module.css';
import RegistrationSuccess from './RegistrationSuccess';

const TOTAL_STEPS = 4;
const AVATAR_EMOJI = {
  boy: '👦', girl: '👧', grandmother: '👵', grandfather: '👴',
  teacher: '🧑‍🏫', book: '📖', lion: '🦁', tiger: '🐯',
  apple: '🍎', flower: '🌸', star: '⭐', migo: '🦊',
};

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setLearner } = useLearner();

  // Multi-learner phone onboarding stages
  const [stage, setStage] = useState(location.state?.email ? 'wizard' : 'email_input'); // 'email_input', 'select_learner', 'wizard'
  const [phoneNumber, setPhoneNumber] = useState(location.state?.email || ''); // Stores email address now
  const emailAddress = phoneNumber;
  const setEmailAddress = setPhoneNumber;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [linkedLearners, setLinkedLearners] = useState([]);
  
  // Wizard steps
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [registeredLearner, setRegisteredLearner] = useState(null);

  const timerRef = useRef(null);

  const handleGoogleCredentialResponse = async (response) => {
    try {
      setSubmitError('');
      setIsSubmitting(true);
      const res = await googleLogin(response.credential, localStorage.getItem('migo_device_id') || 'dev-device');
      if (res.data.verified) {
        const learnersList = res.data.learners || [];
        setEmailAddress(res.data.email);
        if (learnersList.length > 0) {
          if (learnersList.length === 1) {
            setLearner(learnersList[0]);
            navigate('/home');
          } else {
            setLinkedLearners(learnersList);
            setStage('select_learner');
          }
        } else {
          // Auto-verified with Google: immediately skip OTP check and show profile creation wizard
          setStage('wizard');
        }
      }
    } catch (err) {
      console.error('Google verification failed:', err);
      setSubmitError('Google Sign-In failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1028308472931-dummyid.apps.googleusercontent.com";
    
    const initGsi = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse
        });
        
        const btnElement = document.getElementById("google-signin-button-register");
        if (btnElement) {
          window.google.accounts.id.renderButton(
            btnElement,
            { theme: "outline", size: "large", width: 280 }
          );
        }
      }
    };

    const timer = setTimeout(initGsi, 500);
    return () => clearTimeout(timer);
  }, [stage]);

  const [formData, setFormData] = useState({
    name: '', age: '', knownLanguage: 'en', learningLanguage: '', avatar: '',
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getDeviceId = () => {
    let devId = localStorage.getItem('migo_device_id');
    if (!devId) {
      devId = 'migo_device_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('migo_device_id', devId);
    }
    return devId;
  };

  const handleSignup = async () => {
    if (!emailAddress.trim() || !password) {
      setSubmitError('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setSubmitError('Password must be at least 6 characters long.');
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await signupAccount(emailAddress.trim(), password);
      setStage('wizard');
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectExistingLearner = (learnerItem) => {
    setLearner(learnerItem);
    navigate('/home');
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.name.trim().length > 0;
      case 1: return formData.age !== '' && Number(formData.age) > 0;
      case 2: return formData.learningLanguage !== '';
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
    if (stage === 'email_input') {
      navigate('/');
    } else if (stage === 'select_learner') {
      setStage('email_input');
    } else if (stage === 'wizard') {
      if (currentStep === 0) {
        if (linkedLearners.length > 0) {
          setStage('select_learner');
        } else {
          setStage('email_input');
        }
      } else {
        setCurrentStep((prev) => prev - 1);
      }
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    const deviceId = getDeviceId();

    try {
      const response = await registerLearner({
        name: formData.name.trim(),
        age: Number(formData.age),
        known_language: formData.knownLanguage,
        learning_language: formData.learningLanguage,
        avatar: formData.avatar,
        phone_number: phoneNumber.trim(),
        device_id: deviceId
      });

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

  const steps = [
    <StepName value={formData.name} onChange={(v) => updateField('name', v)} />,
    <StepAge value={formData.age} onChange={(v) => updateField('age', v)} />,
    <StepLanguage 
      knownValue={formData.knownLanguage}
      learningValue={formData.learningLanguage}
      onKnownChange={(v) => updateField('knownLanguage', v)}
      onLearningChange={(v) => updateField('learningLanguage', v)} 
    />,
    <StepAvatar value={formData.avatar} onChange={(v) => updateField('avatar', v)} />,
  ];

  if (registeredLearner) {
    return <RegistrationSuccess learner={registeredLearner} />;
  }

  return (
    <div className={styles.page}>
      <button className={styles.backButton} onClick={handleBack} type="button">‹</button>

      {/* Stage 1: Email & Password Input */}
      {stage === 'email_input' && (
        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px', marginTop: '40px' }}>
          <Mail size={64} color="var(--color-orange)" />
          <h1 className={styles.pageTitle} style={{ marginBottom: '4px' }}>Verify Your Email</h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 700 }}>
            Enter your email and choose a password to secure your learning profiles.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '10px' }}>
            <input
              type="email"
              style={{ width: '100%', padding: '14px 16px', fontSize: '16px', fontWeight: 800, border: '2px solid var(--color-peach)', borderRadius: 'var(--radius-sm)', outline: 'none', color: 'var(--text-dark)', textAlign: 'center' }}
              placeholder="Enter your email address"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
            />
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                style={{ width: '100%', padding: '14px 48px 14px 16px', fontSize: '16px', fontWeight: 800, border: '2px solid var(--color-peach)', borderRadius: 'var(--radius-sm)', outline: 'none', color: 'var(--text-dark)', textAlign: 'center' }}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {submitError && <p className={styles.errorText}>{submitError}</p>}

          <button
            className={styles.nextButton}
            onClick={handleSignup}
            type="button"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '10px', position: 'static', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            {isSubmitting ? 'Registering...' : 'Continue'}
          </button>

          <div style={{ margin: '14px 0', borderBottom: '2.5px dashed var(--color-peach-light)', width: '100%' }}></div>

          {/* Google Sign-in Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800 }}>Or continue with:</span>
            <div id="google-signin-button-register" style={{ display: 'flex', justifyContent: 'center' }}></div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px', fontWeight: 800, color: 'var(--text-muted)' }}>
            Already have an account? <span style={{ color: 'var(--color-orange)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/login')}>Sign In</span>
          </div>
        </div>
      )}

      {stage === 'select_learner' && (
        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
          <h1 className={styles.pageTitle} style={{ marginBottom: '4px', textAlign: 'center' }}>Who is playing today?</h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center', marginTop: '-10px' }}>
            We found profile(s) already linked to <strong>{emailAddress}</strong>. Select one to play or create a new profile!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '10px' }}>
            {linkedLearners.map((learnerItem) => (
              <button
                key={learnerItem.learner_id}
                type="button"
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '3px solid var(--color-peach)', backgroundColor: '#FFFFFF', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                onClick={() => handleSelectExistingLearner(learnerItem)}
              >
                <span style={{ fontSize: '36px' }}>
                  {AVATAR_EMOJI[learnerItem.avatar] || '⭐'}
                </span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)' }}>{learnerItem.name}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-orange)' }}>{learnerItem.learner_id}</span>
                </div>
                <span style={{ backgroundColor: 'var(--color-mint)', color: '#FFFFFF', fontWeight: 800, fontSize: '13px', padding: '5px 12px', borderRadius: '20px' }}>Play ▶</span>
              </button>
            ))}

            <button
              type="button"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '3px dashed var(--color-orange)', backgroundColor: 'var(--color-peach-light)', color: 'var(--color-orange-dark)', fontWeight: 900, cursor: 'pointer', width: '100%', fontSize: '16px', marginTop: '12px' }}
              onClick={() => setStage('wizard')}
            >
              <Plus size={20} />
              <span>Create new profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Stage 4: Profile Registration Wizard */}
      {stage === 'wizard' && (
        <>
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
              ? 'Finish'
              : 'Next ➔'}
          </button>
        </>
      )}
    </div>
  );
}

export default Register;