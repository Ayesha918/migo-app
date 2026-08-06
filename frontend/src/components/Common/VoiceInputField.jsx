// src/components/Common/VoiceInputField.jsx
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import useVoiceInput from '../../services/useVoiceInput';
import styles from './VoiceInputField.module.css';

export default function VoiceInputField({
  value = '',
  onChange,
  placeholder = 'Type or speak here...',
  type = 'text',
  language = 'en-US',
  className = '',
  multiline = false,
  rows = 4,
}) {
  const handleVoiceResult = (transcript) => {
    if (transcript) {
      onChange(transcript);
    }
  };

  const { startListening, listening } = useVoiceInput(handleVoiceResult, language);

  return (
    <div className={`${styles.inputContainer} ${className}`}>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={styles.textareaField}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={styles.inputField}
        />
      )}

      <motion.button
        type="button"
        className={`${styles.micButton} ${listening ? styles.micListening : ''}`}
        onClick={startListening}
        title="Tap to speak & auto-fill text"
        whileTap={{ scale: 0.9 }}
        animate={listening ? { scale: [1, 1.15, 1] } : {}}
        transition={{ repeat: listening ? Infinity : 0, duration: 0.8 }}
      >
        {listening ? <Mic size={18} color="#FFFFFF" /> : <MicOff size={18} color="#FF7A00" />}
      </motion.button>
    </div>
  );
}
