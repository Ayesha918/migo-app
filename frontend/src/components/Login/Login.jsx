// src/components/Login/Login.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { searchLearnerById, searchLearnerByName } from '../../services/api';
import { useLearner } from '../../services/LearnerContext';
import owl from '../../assets/images/owl.png';
import { Search, ArrowLeft, User, Hash, Mic, MicOff } from 'lucide-react';
import styles from './Login.module.css';
import useTranslate from '../../services/useTranslate';

const AVATAR_EMOJI = {
  boy: '👦', girl: '👧', grandmother: '👵', grandfather: '👴',
  teacher: '🧑‍🏫', book: '📖', lion: '🦁', tiger: '🐯',
  apple: '🍎', flower: '🌸', star: '⭐', migo: '🦊',
};

function Login() {
  const navigate = useNavigate();
  const { setLearner } = useLearner();
  const t = useTranslate();

  const [mode, setMode] = useState('id'); // 'id' or 'name'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Auto-fill simulated ID from landing page onboarding wizard
  useEffect(() => {
    const autofill = localStorage.getItem('migo_simulated_id');
    if (autofill) {
      setMode('id');
      setQuery(autofill);
      localStorage.removeItem('migo_simulated_id');
    }
  }, []);

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Set speech language to match search mode context (e.g. multi-locale support)
    recognition.lang = mode === 'id' ? 'en-US' : 'en-US'; 
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
      const cleanText = speechToText.replace(/\.$/g, ''); // strip punctuation
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

  const handleSelectLearner = (learner) => {
    setLearner(learner);
    navigate('/home');
  };

  return (
    <div className={styles.page}>
      <button className={styles.backButton} onClick={() => navigate('/')} type="button">
        <ArrowLeft size={22} />
      </button>

      <div className={styles.headerBox}>
        <img src={owl} alt="MiGo Owl" className={styles.mascotImg} />
        <h1 className={styles.title}>{t('whoIsPlaying')}</h1>
        <p className={styles.subtitle}>{t('enterLearnerId')}</p>
      </div>

      <div className={styles.modeToggle}>
        <button
          type="button"
          className={`${styles.modeButton} ${mode === 'id' ? styles.modeActive : ''}`}
          onClick={() => { setMode('id'); setQuery(''); setResults([]); setError(''); }}
        >
          <Hash size={18} />
          <span>{t('learnerId')}</span>
        </button>
        <button
          type="button"
          className={`${styles.modeButton} ${mode === 'name' ? styles.modeActive : ''}`}
          onClick={() => { setMode('name'); setQuery(''); setResults([]); setError(''); }}
        >
          <User size={18} />
          <span>{t('searchByName')}</span>
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
        🎙️ {t('micInstruction')}
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
    </div>
  );
}

export default Login;