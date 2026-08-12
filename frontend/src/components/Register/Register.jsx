// src/components/Register/Register.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import StepName from './StepName';
import StepAge from './StepAge';
import StepLanguage from './StepLanguage';
import StepAvatar from './StepAvatar';
import {
  registerLearner, sendOtp, verifyOtp, fetchPhoneLearners
} from '../../services/api';
import { useLearner } from '../../services/LearnerContext';
import { Mail, HelpCircle, ArrowLeft, Plus } from 'lucide-react';
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
  const { setLearner } = useLearner();

  // Multi-learner phone onboarding stages
  const [stage, setStage] = useState('email_input'); // 'email_input', 'otp_input', 'select_learner', 'wizard'
  const [phoneNumber, setPhoneNumber] = useState(''); // Stores email address now
  const emailAddress = phoneNumber;
  const setEmailAddress = setPhoneNumber;
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [timerCount, setTimerCount] = useState(25);
  const [linkedLearners, setLinkedLearners] = useState([]);
  
  // Wizard steps
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [registeredLearner, setRegisteredLearner] = useState(null);
  const [isMockOtp, setIsMockOtp] = useState(false);

  const timerRef = useRef(null);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const [formData, setFormData] = useState({
    name: '', age: '', knownLanguage: 'en', learningLanguage: '', avatar: '',
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Timer countdown for Resend code
  useEffect(() => {
    if (stage === 'otp_input' && timerCount > 0) {
      timerRef.current = setTimeout(() => {
        setTimerCount(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [stage, timerCount]);

  const getDeviceId = () => {
    let devId = localStorage.getItem('migo_device_id');
    if (!devId) {
      devId = 'migo_device_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('migo_device_id', devId);
    }
    return devId;
  };

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      setSubmitError('Please enter your mobile number.');
      return;
    }
    setSubmitError('');
    try {
      const res = await sendOtp(phoneNumber.trim());
      setIsMockOtp(!!res.data?.is_mock);
      setTimerCount(25);
      setStage('otp_input');
    } catch (err) {
      setSubmitError('Could not send code. Try again.');
    }
  };

  const handleOtpBoxChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otpArray];
    newOtp[idx] = val.substring(val.length - 1);
    setOtpArray(newOtp);

    if (val && idx < 5) {
      otpRefs[idx + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otpArray[idx] && idx > 0) {
      otpRefs[idx - 1].current.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otpArray.join('');
    if (fullOtp.length < 6) {
      setSubmitError('Please enter the 6-digit code.');
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);
    const deviceId = getDeviceId();

    try {
      const response = await verifyOtp(phoneNumber.trim(), fullOtp, deviceId);
      if (response.data.verified) {
        // Query existing learners associated with this phone
        const learnersResponse = await fetchPhoneLearners(phoneNumber.trim());
        const learners = learnersResponse.data;
        setLinkedLearners(learners);

        if (learners && learners.length > 0) {
          setStage('select_learner');
        } else {
          // No linked learners -> Go straight to profile wizard
          setStage('wizard');
        }
      }
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Verification code is incorrect.');
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
    if (stage === 'email_input') {
      navigate('/');
    } else if (stage === 'otp_input') {
      setStage('email_input');
      setOtpArray(['', '', '', '', '', '']);
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

      {/* Stage 1: Email Input */}
      {stage === 'email_input' && (
        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px', marginTop: '40px' }}>
          <Mail size={64} color="var(--color-orange)" />
          <h1 className={styles.pageTitle} style={{ marginBottom: '4px' }}>Verify Your Email</h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 700 }}>
            Enter your email address to set up your safe learning profiles.
          </p>

          <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '10px' }}>
            <input
              type="email"
              style={{ flex: 1, padding: '14px 16px', fontSize: '16px', fontWeight: 800, border: '2px solid var(--color-peach)', borderRadius: 'var(--radius-sm)', outline: 'none', color: 'var(--text-dark)', textAlign: 'center' }}
              placeholder="Enter your email address"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
            />
          </div>

          {submitError && <p className={styles.errorText}>{submitError}</p>}

          <button
            className={styles.nextButton}
            onClick={handleSendOtp}
            type="button"
            style={{ width: '100%', marginTop: '10px', position: 'static' }}
          >
            Send Code
          </button>
        </div>
      )}

      {/* Stage 2: OTP Input */}
      {stage === 'otp_input' && (
        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px', marginTop: '40px' }}>
          <HelpCircle size={64} color="var(--color-orange)" />
          <h1 className={styles.pageTitle} style={{ marginBottom: '4px' }}>Enter the 6-digit code</h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 700 }}>
            We sent a verification code to <strong>{emailAddress}</strong>
          </p>

          {isMockOtp && (
            <div style={{ backgroundColor: 'var(--color-peach-light)', color: 'var(--color-orange-dark)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '13.5px', fontWeight: 800, margin: '6px 0', border: '1.5px solid var(--color-peach)', lineHeight: 1.4, width: '100%' }}>
              ⚠️ Email SMTP credentials not configured in backend settings. The OTP has been printed to the server terminal. For local testing, use code: <strong>123456</strong>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%', margin: '10px 0' }}>
            {otpArray.map((digit, idx) => (
              <input
                key={idx}
                ref={otpRefs[idx]}
                type="text"
                style={{ width: '46px', height: '52px', fontSize: '22px', fontWeight: 900, textAlign: 'center', border: '3.5px solid var(--color-peach)', borderRadius: 'var(--radius-sm)', outline: 'none', backgroundColor: '#FFFFFF', color: 'var(--text-dark)' }}
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpBoxChange(e.target.value, idx)}
                onKeyDown={(e) => handleOtpKeyDown(e, idx)}
              />
            ))}
          </div>

          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', marginTop: '-8px' }}>
            {timerCount > 0 ? (
              <span>Didn't get the code? Resend in 0:{timerCount < 10 ? '0' : ''}{timerCount}</span>
            ) : (
              <span>Didn't get the code? <button style={{ color: 'var(--color-orange)', background: 'none', border: 'none', fontWeight: 900, cursor: 'pointer' }} onClick={handleSendOtp}>Resend Now</button></span>
            )}
          </div>

          {submitError && <p className={styles.errorText}>{submitError}</p>}

          <button
            className={styles.nextButton}
            onClick={handleVerifyOtp}
            disabled={isSubmitting}
            type="button"
            style={{ width: '100%', marginTop: '10px', position: 'static' }}
          >
            {isSubmitting ? 'Verifying...' : 'Verify Code'}
          </button>
        </div>
      )}

      {/* Stage 3: Select or Create Profile */}
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