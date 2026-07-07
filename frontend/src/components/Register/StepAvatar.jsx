// src/components/Register/StepAvatar.jsx
import { motion } from 'framer-motion';
import styles from './Register.module.css';

const AVATARS = [
  { id: 'boy', emoji: '👦' },
  { id: 'girl', emoji: '👧' },
  { id: 'grandmother', emoji: '👵' },
  { id: 'grandfather', emoji: '👴' },
  { id: 'teacher', emoji: '🧑‍🏫' },
  { id: 'book', emoji: '📖' },
  { id: 'lion', emoji: '🦁' },
  { id: 'tiger', emoji: '🐯' },
  { id: 'apple', emoji: '🍎' },
  { id: 'flower', emoji: '🌸' },
  { id: 'star', emoji: '⭐' },
  { id: 'migo', emoji: '🦊' },
];

function StepAvatar({ value, onChange }) {
  return (
    <>
      <div className={styles.emojiIcon}>🎨</div>
      <h2 className={styles.question}>Choose your Avatar</h2>
      <div className={styles.avatarGrid}>
        {AVATARS.map((avatar) => (
          <motion.button
            key={avatar.id}
            type="button"
            className={`${styles.avatarItem} ${
              value === avatar.id ? styles.avatarSelected : ''
            }`}
            onClick={() => onChange(avatar.id)}
            whileTap={{ scale: 0.92 }}
            animate={
              value === avatar.id
                ? { scale: [1, 1.08, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.35 }}
          >
            {avatar.emoji}
          </motion.button>
        ))}
      </div>
      <div className={styles.voiceRow}>
        <button className={styles.speakerButton} type="button">🔊</button>
      </div>
    </>
  );
}

export default StepAvatar;