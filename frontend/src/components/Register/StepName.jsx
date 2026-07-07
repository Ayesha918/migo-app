// src/components/Register/StepName.jsx
import useVoiceInput from '../../services/useVoiceInput';
import speak from '../../services/speak';
import styles from './Register.module.css';

function StepName({ value, onChange }) {
  const { startListening, listening, browserSupportsSpeechRecognition } =
    useVoiceInput((result) => onChange(result));

  const handleSpeak = () => {
    speak('What is your name?');
  };

  return (
    <>
      <div className={styles.emojiIcon}>👋</div>
      <h2 className={styles.question}>What is your name?</h2>
      <div className={styles.inputRow}>
        <input
          type="text"
          className={styles.textInput}
          placeholder="Tap microphone or type"
          value={value}
          onChange={(e) => onChange(e.target.value)}
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

export default StepName;