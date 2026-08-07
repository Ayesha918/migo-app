import speak from '../../services/speak';
import styles from './Register.module.css';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ta', label: 'Tamil' },
];

function StepLanguage({ knownValue, learningValue, onKnownChange, onLearningChange }) {
  const handleSpeak = () => {
    speak('Which language are you comfortable with, and which language do you want to learn?');
  };

  return (
    <>
      <div className={styles.emojiIcon}>🌐</div>
      <h2 className={styles.question}>I am comfortable with...</h2>
      <div className={styles.inputRow}>
        <select className={styles.selectInput} value={knownValue} onChange={(e) => {
          onKnownChange(e.target.value);
          // Set UI language dynamically during registration as they select their comfortable language!
          localStorage.setItem('migo_ui_language', e.target.value);
        }}>
          <option value="" disabled>Select a language</option>
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>
      </div>

      <h2 className={styles.question} style={{ marginTop: 20 }}>I want to learn...</h2>
      <div className={styles.inputRow}>
        <select className={styles.selectInput} value={learningValue} onChange={(e) => onLearningChange(e.target.value)}>
          <option value="" disabled>Select a language</option>
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.voiceRow}>
        <button className={styles.speakerButton} type="button" onClick={handleSpeak}>🔊</button>
      </div>
    </>
  );
}

export default StepLanguage;