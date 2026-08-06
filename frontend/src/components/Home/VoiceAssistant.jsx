// src/components/Home/VoiceAssistant.jsx
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import owl from '../../assets/images/owl.png';
import styles from './VoiceAssistant.module.css';

export default function VoiceAssistant({ onClick }) {
  return (
    <motion.button
      className={styles.floatingWidget}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
    >
      <img src={owl} alt="MiGo Assistant" className={styles.mascotIcon} />
      <div className={styles.iconCircle}>
        <Volume2 size={20} color="#FFFFFF" />
      </div>
    </motion.button>
  );
}
