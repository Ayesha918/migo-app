// src/components/Landing/Landing.jsx
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.css';

function Landing() {
  const navigate = useNavigate();

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <motion.div
        className={styles.mascot}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        🦉
      </motion.div>

      <motion.h1
        className={styles.title}
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        MiGo
      </motion.h1>

      <motion.p
        className={styles.tagline}
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.45 }}
      >
        Your Friendly AI Learning Companion
      </motion.p>

      <motion.button
        className={styles.primaryButton}
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate('/register')}
      >
        ✨ Start Learning
      </motion.button>

      <motion.button
        className={styles.secondaryButton}
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate('/login')}
      >
        👋 I Already Joined
      </motion.button>
    </motion.div>
  );
}

export default Landing;