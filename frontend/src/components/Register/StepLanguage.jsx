// src/components/Register/StepLanguage.jsx
import speak from '../../services/speak';
import styles from './Register.module.css';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ar', label: 'Arabic' },
];

function StepLanguage({ value, onChange }) {
  const handleSpeak = () => {
    speak('Which language would you like to learn?');
  };

  return (
    <>
      <div className={styles.emojiIcon}>🌐</div>
      <h2 className={styles.question}>Preferred Language</h2>
      <div className={styles.inputRow}>
        <select
          className={styles.selectInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>Select a language</option>
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>
      </div>
      <div className={styles.voiceRow}>
        <button className={styles.speakerButton} type="button" onClick={handleSpeak}>
          🔊
        </button>
      </div>
    </>
  );
}

export default StepLanguage;