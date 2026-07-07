// src/components/Register/StepAge.jsx
import useVoiceInput from '../../services/useVoiceInput';
import speak from '../../services/speak';
import styles from './Register.module.css';

function StepAge({ value, onChange }) {
  const { startListening, listening, browserSupportsSpeechRecognition } = useVoiceInput(
    (result) => {
      const match = result.match(/\d+/);
      if (match) {
        onChange(match[0]);
      }
    }
  );

  const handleSpeak = () => {
    speak('How old are you?');
  };

  return (
    <>
      <div className={styles.emojiIcon}>🎂</div>
      <h2 className={styles.question}>How old are you?</h2>
      <div className={styles.inputRow}>
        <input
          type="number"
          className={styles.textInput}
          placeholder="Enter your age"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min="1"
          max="120"
        />
      </div>
      <div className={styles.voiceRow}>
        {browserSupportsSpeechRecognition && (
          <button
            className={`${styles.micButton} ${listening ? styles.micButtonListening : ''}`}
            type="button"
            onClick={startListening}
          >
            🎤
          </button>
        )}
        <button className={styles.speakerButton} type="button" onClick={handleSpeak}>
          🔊
        </button>
      </div>
    </>
  );
}

export default StepAge;