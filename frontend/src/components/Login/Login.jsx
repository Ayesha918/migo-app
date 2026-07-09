// src/components/Login/Login.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { searchLearnerById, searchLearnerByName } from '../../services/api';
import styles from './Login.module.css';
import { useLearner } from '../../services/LearnerContext';

const AVATAR_EMOJI = {
  boy: '👦', girl: '👧', grandmother: '👵', grandfather: '👴',
  teacher: '🧑‍🏫', book: '📖', lion: '🦁', tiger: '🐯',
  apple: '🍎', flower: '🌸', star: '⭐', migo: '🦊',
};

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('id'); // 'id' or 'name'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

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

  const { setLearner } = useLearner();

  const handleSelectLearner = (learner) => {
    setLearner(learner);
    navigate('/dashboard', { state: { learner } });
  };

  return (
    <div className={styles.page}>
      <button className={styles.backButton} onClick={() => navigate('/')} type="button">‹</button>

      <div className={styles.emojiIcon}>👋</div>
      <h1 className={styles.title}>Welcome Back!</h1>

      <div className={styles.modeToggle}>
        <button
          type="button"
          className={`${styles.modeButton} ${mode === 'id' ? styles.modeActive : ''}`}
          onClick={() => { setMode('id'); setQuery(''); setResults([]); setError(''); }}
        >
          Learner ID
        </button>
        <button
          type="button"
          className={`${styles.modeButton} ${mode === 'name' ? styles.modeActive : ''}`}
          onClick={() => { setMode('name'); setQuery(''); setResults([]); setError(''); }}
        >
          Search by Name
        </button>
      </div>

      <div className={styles.searchRow}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={mode === 'id' ? 'e.g. MG000001' : 'Enter your name'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className={styles.searchButton} type="button" onClick={handleSearch}>
          🔍
        </button>
      </div>

      {isSearching && <p className={styles.statusText}>Searching...</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.resultsGrid}>
        {results.map((learner) => (
          <motion.button
            key={learner.id}
            type="button"
            className={styles.resultCard}
            onClick={() => handleSelectLearner(learner)}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className={styles.resultAvatar}>
              {AVATAR_EMOJI[learner.avatar] || '⭐'}
            </span>
            <span className={styles.resultName}>{learner.name}</span>
            <span className={styles.resultId}>{learner.learner_id}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default Login;