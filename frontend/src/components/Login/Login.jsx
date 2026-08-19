// src/components/Login/Login.jsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  searchLearnerById, searchLearnerByName,
  loginAccount, checkDevice, googleLogin,
  resendVerification, forgotPassword, resetUsersDatabase
} from '../../services/api';
import { useLearner } from '../../services/LearnerContext';
import owl from '../../assets/images/owl.png';
import {
  Search, ArrowLeft, User, Hash, Mic, MicOff,
  ShieldAlert, Mail, Check, HelpCircle, Eye, EyeOff
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

  // Authentication states
  const [subStage, setSubStage] = useState('search'); // 'search', 'new_device_warning', 'password_input', 'welcome_back', 'select_learner'
  const [selectedLearnerItem, setSelectedLearnerItem] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(''); // Stores email address now
  const emailAddress = phoneNumber;
  const setEmailAddress = setPhoneNumber;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState('account'); // 'account' (email/password), 'search' (profile search)
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSentMessage, setResetSentMessage] = useState('');

  const handleGoogleCredentialResponse = async (response) => {
    try {
      setError('');
      setIsSubmittingOtp(true);
      const res = await googleLogin(response.credential, localStorage.getItem('migo_device_id') || 'dev-device');
      if (res.data.verified) {
        const learnersList = res.data.learners || [];
        if (learnersList.length > 0) {
          if (learnersList.length === 1) {
            setLearner(learnersList[0]);
            navigate('/home');
          } else {
            setLinkedLearners(learnersList);
            setSubStage('select_learner');
          }
        } else {
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
  }, [subStage, loginMode]);

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

  const handleLoginAccount = async () => {
    if (!emailAddress.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setError('');
    setIsSubmittingOtp(true);
    const deviceId = getDeviceId();
    try {
      const response = await loginAccount(emailAddress.trim(), password, deviceId);
      if (response.data.verified) {
        const learnersList = response.data.learners || [];
        setLinkedLearners(learnersList);
        setSubStage('select_learner');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email address or password.');
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  const handleVerifyPassword = async () => {
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setError('');
    setIsSubmittingOtp(true);
    const deviceId = getDeviceId();
    try {
      const response = await loginAccount(selectedLearnerItem.phone_number, password, deviceId);
      if (response.data.verified) {
        setLearner(selectedLearnerItem);
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid password.');
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm("Are you sure you want to completely clear all learners, user records, and reset the sequential ID counter to MG000001?")) {
      return;
    }
    try {
      setIsSearching(true);
      setError('');
      await resetUsersDatabase();
      setResults([]);
      setQuery('');
      setLearner(null);
      alert("Users database has been successfully reset! Learner IDs will now start from MG000001.");
    } catch (err) {
      console.error(err);
      setError("Failed to reset database. Please verify the backend is running.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleBackToSearch = () => {
    setSubStage('search');
    setPhoneNumber('');
    setPassword('');
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
              className={`${styles.modeButton} ${loginMode === 'account' ? styles.modeActive : ''}`}
              onClick={() => { setLoginMode('account'); setError(''); }}
            >
              <User size={18} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              className={`${styles.modeButton} ${loginMode === 'search' ? styles.modeActive : ''}`}
              onClick={() => { setLoginMode('search'); setQuery(''); setResults([]); setError(''); }}
            >
              <Search size={18} />
              <span>Search Profile</span>
            </button>
          </div>

          {loginMode === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '340px', margin: '20px auto 0' }}>
              <input
                type="email"
                style={{ width: '100%', padding: '14px 18px', fontSize: '15px', fontWeight: 800, border: '2px solid var(--color-peach)', borderRadius: 'var(--radius-sm)', outline: 'none', color: 'var(--text-dark)' }}
                placeholder="Enter your email address"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  style={{ width: '100%', padding: '14px 48px 14px 18px', fontSize: '15px', fontWeight: 800, border: '2px solid var(--color-peach)', borderRadius: 'var(--radius-sm)', outline: 'none', color: 'var(--text-dark)' }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLoginAccount()}
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

              {error && <p className={styles.errorText}>{error}</p>}

              <button className={styles.verifyBtn} onClick={handleLoginAccount} disabled={isSubmittingOtp}>
                {isSubmittingOtp ? 'Logging in...' : 'Sign In'}
              </button>

              <div style={{ margin: '8px 0', borderBottom: '2.5px dashed var(--color-peach-light)', width: '100%' }}></div>

              {/* Google Sign-in Button wrapper */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800 }}>Or continue with:</span>
                <div id="google-signin-button-login" style={{ display: 'flex', justifyContent: 'center' }}></div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px', fontWeight: 800, color: 'var(--text-muted)' }}>
                Don't have an account? <span style={{ color: 'var(--color-orange)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/register')}>Register Now</span>
              </div>
            </div>
          )}

          {loginMode === 'search' && (
            <>
              <div className={styles.modeToggle} style={{ width: '100%', maxWidth: '340px', margin: '14px auto 0' }}>
                <button
                  type="button"
                  className={`${styles.modeButton} ${mode === 'id' ? styles.modeActive : ''}`}
                  onClick={() => { setMode('id'); setQuery(''); setResults([]); setError(''); }}
                  style={{ fontSize: '13.5px', padding: '8px 12px' }}
                >
                  <Hash size={16} />
                  <span>Learner ID</span>
                </button>
                <button
                  type="button"
                  className={`${styles.modeButton} ${mode === 'name' ? styles.modeActive : ''}`}
                  onClick={() => { setMode('name'); setQuery(''); setResults([]); setError(''); }}
                  style={{ fontSize: '13.5px', padding: '8px 12px' }}
                >
                  <User size={16} />
                  <span>Search Name</span>
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
          {/* Reset Database Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '30px', width: '100%' }}>
            <button
              onClick={handleResetDatabase}
              style={{
                padding: '10px 16px',
                borderRadius: '20px',
                border: '2px solid #FF4757',
                backgroundColor: 'transparent',
                color: '#FF4757',
                fontSize: '12px',
                fontWeight: 900,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FF4757';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#FF4757';
              }}
              type="button"
            >
              ⚠️ Reset Users Database
            </button>
          </div>
        </>
      )}

      {/* Screen 2: New Email/Device Detected */}
      {subStage === 'new_device_warning' && (
        <div className={styles.verifyCard}>
          <Mail size={56} color="var(--color-orange)" />
          <h2 className={styles.verifyTitle}>Is this your first time on this device?</h2>
          <p className={styles.verifyText}>
            Let's verify your password to trust this device and sync your learning data.
          </p>
          <button className={styles.verifyBtn} onClick={() => {
            setEmailAddress(selectedLearnerItem.phone_number);
            setPassword('');
            setSubStage('password_input');
          }}>
            Yes, let's verify
          </button>
          <button className={styles.verifyBtnSecondary} onClick={handleBackToSearch}>
            Back to search
          </button>
        </div>
      )}

      {/* Screen 3: Verify Password for Searched Profile */}
      {subStage === 'password_input' && (
        <div className={styles.verifyCard}>
          <Mail size={56} color="var(--color-orange)" />
          <h2 className={styles.verifyTitle}>Confirm Password</h2>
          <p className={styles.verifyText}>
            Enter the password for <strong>{emailAddress}</strong> to trust this device.
          </p>
          
          <div style={{ width: '100%', marginTop: '10px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                style={{
                  width: '100%',
                  padding: '14px 48px 14px 18px',
                  fontSize: '16px',
                  fontWeight: 800,
                  border: '2px solid var(--color-peach)',
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none',
                  color: 'var(--text-dark)',
                  textAlign: 'center'
                }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
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

          {error && <p className={styles.errorText}>{error}</p>}

          <button className={styles.verifyBtn} onClick={handleVerifyPassword} disabled={isSubmittingOtp}>
            {isSubmittingOtp ? 'Verifying...' : 'Verify Password'}
          </button>
          <button className={styles.verifyBtnSecondary} onClick={handleBackToSearch}>
            Cancel
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