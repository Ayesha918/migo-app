// src/components/Register/StepName.jsx
import speak from '../../services/speak';
import VoiceInputField from '../Common/VoiceInputField';
import styles from './Register.module.css';

function StepName({ value, onChange }) {
  const handleSpeak = () => {
    speak('What is your name?');
  };

  return (
    <>
      <div className={styles.emojiIcon}>👋</div>
      <h2 className={styles.question}>What is your name?</h2>
      <div className={styles.inputRow}>
        <VoiceInputField
          value={value}
          onChange={onChange}
          placeholder="Type or tap microphone to speak your name"
        />
      </div>
      <div className={styles.voiceRow}>
        <button className={styles.speakerButton} type="button" onClick={handleSpeak}>🔊</button>
      </div>
    </>
  );
}

export default StepName;