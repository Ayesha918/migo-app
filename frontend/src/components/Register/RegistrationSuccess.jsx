// src/components/Register/RegistrationSuccess.jsx
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';

function RegistrationSuccess({ learner }) {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/dashboard', { state: { learner } });
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
        <h2 className={styles.question}>You're all set, {learner.name}!</h2>

        <div className={styles.learnerIdBox}>
          {learner.learner_id}
        </div>

        <button className={styles.nextButton} type="button" onClick={handleContinue}>
          Continue to Dashboard
        </button>
      </motion.div>
    </div>
  );
}

export default RegistrationSuccess;