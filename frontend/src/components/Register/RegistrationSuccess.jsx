// src/components/Register/RegistrationSuccess.jsx
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';

function RegistrationSuccess({ learner }) {
  const navigate = useNavigate();

  const handleContinue = () => {
    // Force the student to take the Placement Assessment right after registering!
    navigate('/assessment/placement', { state: { learner } });
  };

  return (
    <div className={styles.page}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={styles.stepContent}
      >
        <div className={styles.emojiIcon}>🎉</div>
        <h2 className={styles.question}>Welcome, {learner.name}!</h2>
        <p className={styles.subtitle} style={{ fontSize: '18px', margin: '12px 0 24px', fontWeight: 'bold' }}>
          Your Learner ID is:
        </p>

        <div className={styles.learnerIdBox}>
          {learner.learner_id}
        </div>

        <p style={{ margin: '20px 0 28px', color: 'var(--text-muted)', fontWeight: 600 }}>
          Let's take a quick 3-step check to place you in the perfect learning level!
        </p>

        <button className={styles.nextButton} type="button" onClick={handleContinue}>
          Start Placement Assessment 📝
        </button>
      </motion.div>
    </div>
  );
}

export default RegistrationSuccess;