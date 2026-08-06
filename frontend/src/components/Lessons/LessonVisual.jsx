// src/components/Lessons/LessonVisual.jsx
// Pure SVG illustrations, no external fetching, no Lottie — cannot fail
// due to network/CORS issues since everything is drawn inline.
import styles from './LessonVisual.module.css';

const ILLUSTRATIONS = {
  letter_recognition: (
    <svg viewBox="0 0 200 200" className={styles.svg}>
      <circle cx="100" cy="100" r="90" fill="#eaf1fb" />
      <text x="100" y="128" textAnchor="middle" fontSize="90" fontWeight="800" fill="#4a6fa5" fontFamily="Poppins, sans-serif">Aa</text>
    </svg>
  ),
  letter_sounds: (
    <svg viewBox="0 0 200 200" className={styles.svg}>
      <circle cx="100" cy="100" r="90" fill="#fdeef0" />
      <path d="M60,100 Q80,60 100,100 T140,100" stroke="#e07a8b" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="100" r="6" fill="#e07a8b" />
      <circle cx="140" cy="100" r="6" fill="#e07a8b" />
    </svg>
  ),
  word_recognition: (
    <svg viewBox="0 0 200 200" className={styles.svg}>
      <rect x="30" y="70" width="140" height="60" rx="14" fill="#eef6ec" />
      <rect x="45" y="90" width="60" height="8" rx="4" fill="#6fae5c" />
      <rect x="45" y="105" width="90" height="8" rx="4" fill="#a7cf9b" />
    </svg>
  ),
  reading_fluency: (
    <svg viewBox="0 0 200 200" className={styles.svg}>
      <rect x="40" y="40" width="120" height="120" rx="16" fill="#f4f0fb" />
      <rect x="55" y="60" width="90" height="6" rx="3" fill="#8a6fc9" />
      <rect x="55" y="78" width="70" height="6" rx="3" fill="#b3a1de" />
      <rect x="55" y="96" width="90" height="6" rx="3" fill="#8a6fc9" />
      <rect x="55" y="114" width="50" height="6" rx="3" fill="#b3a1de" />
    </svg>
  ),
  sentence_formation: (
    <svg viewBox="0 0 200 200" className={styles.svg}>
      <circle cx="100" cy="100" r="90" fill="#eef6ec" />
      <rect x="50" y="90" width="30" height="20" rx="4" fill="#6fae5c" />
      <rect x="85" y="90" width="50" height="20" rx="4" fill="#a7cf9b" />
      <rect x="140" y="90" width="20" height="20" rx="4" fill="#6fae5c" />
    </svg>
  ),
  writing: (
    <svg viewBox="0 0 200 200" className={styles.svg}>
      <circle cx="100" cy="100" r="90" fill="#fdf3e6" />
      <path d="M70,130 L120,80 L135,95 L85,145 L65,150 Z" fill="#d9a441" />
      <path d="M120,80 L135,65 L150,80 L135,95 Z" fill="#e8c27a" />
    </svg>
  ),
  grammar: (
    <svg viewBox="0 0 200 200" className={styles.svg}>
      <circle cx="100" cy="100" r="90" fill="#eaf1fb" />
      <text x="100" y="120" textAnchor="middle" fontSize="60" fontWeight="800" fill="#4a6fa5" fontFamily="Poppins, sans-serif">¶</text>
    </svg>
  ),
  vocabulary: (
    <svg viewBox="0 0 200 200" className={styles.svg}>
      <rect x="40" y="50" width="120" height="100" rx="14" fill="#f4f0fb" />
      <rect x="55" y="70" width="90" height="8" rx="4" fill="#8a6fc9" />
      <rect x="55" y="90" width="60" height="8" rx="4" fill="#b3a1de" />
      <rect x="55" y="110" width="75" height="8" rx="4" fill="#8a6fc9" />
    </svg>
  ),
  comprehension: (
    <svg viewBox="0 0 200 200" className={styles.svg}>
      <circle cx="100" cy="100" r="90" fill="#fdeef0" />
      <circle cx="100" cy="90" r="30" fill="none" stroke="#e07a8b" strokeWidth="6" />
      <line x1="122" y1="112" x2="145" y2="135" stroke="#e07a8b" strokeWidth="6" strokeLinecap="round" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 200 200" className={styles.svg}>
      <circle cx="100" cy="100" r="90" fill="#eaf1fb" />
      <circle cx="100" cy="100" r="30" fill="#4a6fa5" />
    </svg>
  ),
};

function LessonVisual({ skill }) {
  const illustration = ILLUSTRATIONS[skill] || ILLUSTRATIONS.default;
  return <div className={styles.visualWrap}>{illustration}</div>;
}

export default LessonVisual;