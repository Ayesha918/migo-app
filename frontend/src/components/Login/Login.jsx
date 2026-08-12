// src/components/Login/Login.jsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  searchLearnerById, searchLearnerByName,
  sendOtp, verifyOtp, checkDevice, googleLogin
} from '../../services/api';
import { useLearner } from '../../services/LearnerContext';
import owl from '../../assets/images/owl.png';
import {
  Search, ArrowLeft, User, Hash, Mic, MicOff,
  ShieldAlert, Mail, Check, HelpCircle
} from 'lucide-react';
import styles from './Login.module.css';

const AVATAR_EMOJI = {
  boy: '👦', girl: '👧', grandmother: '👵', grandfather: '👴',
  teacher: '🧑‍🏫', book: '📖', lion: '🦁', tiger: '🐯',
  apple: '🍎', flower: '🌸', star: '⭐', migo: '🦊',
};

function Login() {
  const navigate = useNavigate();
  const { setLearner } = useLearner();

  const [mode, setMode] = useState('id'); // 'id' or 'name'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);

  // OTP Device Verification flow states
  const [subStage, setSubStage] = useState('search'); // 'search', 'new_device_warning', 'email_input', 'otp_input', 'welcome_back', 'select_learner'
  const [selectedLearnerItem, setSelectedLearnerItem] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(''); // Stores email address now
  const emailAddress = phoneNumber;
  const setEmailAddress = setPhoneNumber;
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const [timerCount, setTimerCount] = useState(25);
  const [isMockOtp, setIsMockOtp] = useState(false);
  const [linkedLearners, setLinkedLearners] = useState([]);
  const timerRef = useRef(null);

  const handleGoogleCredentialResponse = async (response) => {
    try {
      setError('');
      setIsSubmittingOtp(true);
      const res = await googleLogin(response.credential, localStorage.getItem('migo_device_id') || 'dev-device');
      if (res.data.verified) {
        const learnersList = res.data.learners || [];
        if (learnersList.length > 0) {
          setLinkedLearners(learnersList);
          setSubStage('select_learner');
        } else {
          // Send user to registration stage with verified email
          navigate('/register', { state: { email: res.data.email } });
        }
      }
    } catch (err) {
      console.error('Google verification failed:', err);
      setError('Google Sign-In failed. Please try again.');
    } finally {
      setIsSubmittingOtp(false);
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
        
        const btnElement = document.getElementById("google-signin-button-login");
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
  }, [subStage]);

  // Input refs for OTP fields auto-focus
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Auto-fill simulated ID from landing page onboarding wizard
  useEffect(() => {
    const autofill = localStorage.getItem('migo_simulated_id');
    if (autofill) {
      setMode('id');
      setQuery(autofill);
      localStorage.removeItem('migo_simulated_id');
    }
  }, []);

  // Set up local device ID
  const getDeviceId = () => {
    let devId = localStorage.getItem('migo_device_id');
    if (!devId) {
      devId = 'migo_device_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('migo_device_id', devId);
    }
    return devId;
  };

  // Timer countdown for Resend code
  useEffect(() => {
    if (subStage === 'otp_input' && timerCount > 0) {
      timerRef.current = setTimeout(() => {
        setTimerCount(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [subStage, timerCount]);

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e);
      setError('Voice not detected. Try again.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      const cleanText = speechToText.replace(/\.$/g, ''); 
      setQuery(cleanText);
      
      // Auto-trigger search
      setIsSearching(true);
      setError('');
      setResults([]);
      
      const searchFunc = mode === 'id' ? searchLearnerById : searchLearnerByName;
      searchFunc(cleanText)
        .then(res => setResults(res.data))
        .catch(err => setError(err.response?.data?.error || 'No matching learner found.'))
        .finally(() => setIsSearching(false));
    };

    recognition.start();
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setError('');
    setResults([]);
    try {
      const response = mode === 'id'
        ? await searchLearnerById(query.trim())
        : await searchLearnerByName(query.trim());
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'No matching learner found.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLearner = async (learnerItem) => {
    setError('');
    setSelectedLearnerItem(learnerItem);
    const deviceId = getDeviceId();

    try {
      const response = await checkDevice(learnerItem.learner_id, deviceId);
      if (response.data.verified) {
        // Skip OTP verification, device is trusted or legacy single-user
        setSubStage('welcome_back');
      } else {
        // Unverified phone account -> Show Warning card
        setSubStage('new_device_warning');
      }
    } catch (err) {
      // In case of error (e.g. learner not found), fallback to warning to keep secure
      setSubStage('new_device_warning');
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your mobile number.');
      return;
    }
    setError('');
    try {
      const res = await sendOtp(phoneNumber.trim());
      setIsMockOtp(!!res.data?.is_mock);
      setTimerCount(25);
      setSubStage('otp_input');
    } catch (err) {
      setError('Could not send code. Try again.');
    }
  };

  const handleOtpBoxChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return; // Allow numbers only
    const newOtp = [...otpArray];
    newOtp[idx] = val.substring(val.length - 1);
    setOtpArray(newOtp);

    // Auto-focus next field
    if (val && idx < 5) {
      otpRefs[idx + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otpArray[idx] && idx > 0) {
      otpRefs[idx - 1].current.focus();
    }
  };

  const handleVerifyCode = async () => {
    const fullOtp = otpArray.join('');
    if (fullOtp.length < 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }
    setError('');
    setIsSubmittingOtp(true);
    const deviceId = getDeviceId();

    try {
      const response = await verifyOtp(phoneNumber.trim(), fullOtp, deviceId);
      if (response.data.verified) {
        // Link this learner account in Django to this verified phone account
        // and register this device session. (This linking occurs implicitly on views verify_otp)
        // Set the active session and open.
        setLearner(selectedLearnerItem);
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification code is incorrect.');
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  const handleBackToSearch = () => {
    setSubStage('search');
    setPhoneNumber('');
    setOtpArray(['', '', '', '', '', '']);
    setError('');
  };

  return (
    <div className={styles.page}>
      <button className={styles.backButton} onClick={() => navigate('/')} type="button">
        <ArrowLeft size={22} />
      </button>

      {subStage === 'search' && (
        <>
          <div className={styles.headerBox}>
            <img src={owl} alt="MiGo Owl" className={styles.mascotImg} />
            <h1 className={styles.title}>Who is playing today?</h1>
            <p className={styles.subtitle}>Enter your Learner ID or Name to log into your adventure!</p>
          </div>

          <div className={styles.modeToggle}>
            <button
              type="button"
              className={`${styles.modeButton} ${mode === 'id' ? styles.modeActive : ''}`}
              onClick={() => { setMode('id'); setQuery(''); setResults([]); setError(''); }}
            >
              <Hash size={18} />
              <span>Learner ID</span>
            </button>
            <button
              type="button"
              className={`${styles.modeButton} ${mode === 'name' ? styles.modeActive : ''}`}
              onClick={() => { setMode('name'); setQuery(''); setResults([]); setError(''); }}
            >
              <User size={18} />
              <span>Search by Name</span>
            </button>
          </div>

          <div className={styles.searchRow}>
            <input
              type="text"
              className={`${styles.searchInput} ${isListening ? styles.listeningInput : ''}`}
              placeholder={isListening ? 'Listening...' : mode === 'id' ? 'e.g. MG000001' : 'Enter your name'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            
            <button
              className={`${styles.micButton} ${isListening ? styles.micActive : ''}`}
              type="button"
              onClick={startVoiceSearch}
              title="Speak your name/ID"
            >
              {isListening ? <MicOff size={22} className={styles.pulse} /> : <Mic size={22} />}
            </button>

            <button className={styles.searchButton} type="button" onClick={handleSearch}>
              <Search size={22} />
            </button>
          </div>

          <p className={styles.speakInstruction}>
            🎙️ Don't know how to write? Tap the microphone and speak your name!
          </p>

          {isSearching && <p className={styles.statusText}>Searching for your profile...</p>}
          {error && <p className={styles.errorText}>{error}</p>}

          <div className={styles.resultsGrid}>
            {results.map((learnerItem) => (
              <motion.button
                key={learnerItem.id || learnerItem.learner_id}
                type="button"
                className={styles.resultCard}
                onClick={() => handleSelectLearner(learnerItem)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className={styles.resultAvatar}>
                  {AVATAR_EMOJI[learnerItem.avatar] || '⭐'}
                </span>
                <div className={styles.resultInfo}>
                  <span className={styles.resultName}>{learnerItem.name}</span>
                  <span className={styles.resultId}>{learnerItem.learner_id}</span>
                </div>
                <span className={styles.playBadge}>Play ▶</span>
              </motion.button>
            ))}
          </div>
        </>
      )}

      {/* Screen 2: New Email/Device Detected */}
      {subStage === 'new_device_warning' && (
        <div className={styles.verifyCard}>
          <Mail size={56} color="var(--color-orange)" />
          <h2 className={styles.verifyTitle}>Is this your first time on this email?</h2>
          <p className={styles.verifyText}>
            Let's verify your email address to secure your learning data and make recovery simple.
          </p>
          <button className={styles.verifyBtn} onClick={() => setSubStage('email_input')}>
            Yes, let's verify
          </button>
          <button className={styles.verifyBtnSecondary} onClick={handleBackToSearch}>
            Back to search
          </button>
        </div>
      )}

      {/* Screen 3: Verify Your Email */}
      {subStage === 'email_input' && (
        <div className={styles.verifyCard}>
          <Mail size={56} color="var(--color-orange)" />
          <h2 className={styles.verifyTitle}>Verify Your Email</h2>
          <p className={styles.verifyText}>
            We will send a 6-digit code to verify your email address.
          </p>
          
          <div style={{ width: '100%', marginTop: '10px' }}>
            <input
              type="email"
              style={{
                width: '100%',
                padding: '14px 18px',
                fontSize: '16px',
                fontWeight: 800,
                border: '2px solid var(--color-peach)',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
                color: 'var(--text-dark)',
                textAlign: 'center'
              }}
              placeholder="Enter your email address"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendPhoneOtp()}
            />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <button className={styles.verifyBtn} onClick={handleSendPhoneOtp}>
            Send Code
          </button>

          <div style={{ margin: '14px 0', borderBottom: '2.5px dashed var(--color-peach-light)', width: '100%' }}></div>

          {/* Google Sign-in Button wrapper */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800 }}>Or continue with:</span>
            <div id="google-signin-button-login" style={{ display: 'flex', justifyContent: 'center' }}></div>
          </div>

          <button className={styles.verifyBtnSecondary} onClick={handleBackToSearch} style={{ marginTop: '16px' }}>
            Cancel
          </button>
        </div>
      )}

      {/* Screen 4: Enter the 6-digit code */}
      {subStage === 'otp_input' && (
        <div className={styles.verifyCard}>
          <HelpCircle size={56} color="var(--color-orange)" />
          <h2 className={styles.verifyTitle}>Enter the 6-digit code</h2>
          <p className={styles.verifyText}>
            We sent a verification code to <strong>{emailAddress}</strong>
          </p>

          {isMockOtp && (
            <div style={{ backgroundColor: 'var(--color-peach-light)', color: 'var(--color-orange-dark)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '13.5px', fontWeight: 800, margin: '6px 0', border: '1.5px solid var(--color-peach)', lineHeight: 1.4 }}>
              ⚠️ Email SMTP credentials not configured in backend settings. The OTP has been printed to the server terminal. For local testing, use code: <strong>123456</strong>
            </div>
          )}

          <div className={styles.otpGrid}>
            {otpArray.map((digit, idx) => (
              <input
                key={idx}
                ref={otpRefs[idx]}
                type="text"
                className={styles.otpBox}
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpBoxChange(e.target.value, idx)}
                onKeyDown={(e) => handleOtpKeyDown(e, idx)}
              />
            ))}
          </div>

          <div className={styles.resendRow}>
            {timerCount > 0 ? (
              <span>Didn't get the code? Resend in 0:{timerCount < 10 ? '0' : ''}{timerCount}</span>
            ) : (
              <span>Didn't get the code? <button className={styles.resendBtn} onClick={handleSendPhoneOtp}>Resend Now</button></span>
            )}
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <button className={styles.verifyBtn} onClick={handleVerifyCode} disabled={isSubmittingOtp}>
            {isSubmittingOtp ? 'Verifying...' : 'Verify Code'}
          </button>
          <button className={styles.verifyBtnSecondary} onClick={() => setSubStage('email_input')}>
            Change email address
          </button>
        </div>
      )}

      {/* Google Login: Select Learner Profile */}
      {subStage === 'select_learner' && (
        <div className={styles.verifyCard} style={{ maxWidth: '420px' }}>
          <h2 className={styles.verifyTitle}>Who is playing today?</h2>
          <p className={styles.verifyText}>
            We found profile(s) linked to your email <strong>{emailAddress}</strong>. Select one to play or create a new profile!
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '10px' }}>
            {linkedLearners.map((learnerItem) => (
              <button
                key={learnerItem.learner_id}
                type="button"
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '3px solid var(--color-peach)', backgroundColor: '#FFFFFF', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                onClick={() => {
                  setLearner(learnerItem);
                  navigate('/home');
                }}
              >
                <span style={{ fontSize: '36px' }}>
                  {AVATAR_EMOJI[learnerItem.avatar] || '⭐'}
                </span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '17px', fontWeight: 900, color: 'var(--text-dark)' }}>{learnerItem.name}</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)' }}>{learnerItem.learner_id}</span>
                </div>
                <span style={{ color: 'var(--color-orange)', fontWeight: 900 }}>Play ▶</span>
              </button>
            ))}
            <button
              onClick={() => navigate('/register', { state: { email: emailAddress } })}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: 'var(--radius-md)', border: '2.5px dashed var(--color-orange)', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 850, color: 'var(--color-orange)' }}
              type="button"
            >
              + Create New Profile
            </button>
          </div>
        </div>
      )}

      {/* Subsequent Login Welcome Back Card (Trusted Device, No OTP) */}
      {subStage === 'welcome_back' && (
        <div className={styles.verifyCard}>
          <img src={owl} alt="Mascot Welcome" className={styles.mascotImg} />
          <h2 className={styles.verifyTitle}>Welcome back, {selectedLearnerItem?.name}!</h2>
          <p className={styles.verifyText}>
            Let's continue your learning adventure!
          </p>
          <button
            className={styles.verifyBtn}
            onClick={() => {
              setLearner(selectedLearnerItem);
              navigate('/home');
            }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Explanations Footer Notice */}
      <div className={styles.footerExplanation}>
        <h4>Why we do this?</h4>
        <div className={styles.explItem}>
          <Check size={18} className={styles.explIcon} />
          <div className={styles.explText}>
            <strong>Your learning is safe</strong>: We secure your data to prevent unauthorized access.
          </div>
        </div>
        <div className={styles.explItem}>
          <Check size={18} className={styles.explIcon} />
          <div className={styles.explText}>
            <strong>No passwords to remember</strong>: Easily log back in with one SMS recovery code.
          </div>
        </div>
        <div className={styles.explItem}>
          <Check size={18} className={styles.explIcon} />
          <div className={styles.explText}>
            <strong>Easy and simple for everyone</strong>: Minimal taps required so children and elderly users can play without friction.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;