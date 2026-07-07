// src/services/useVoiceInput.js
import { useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function useVoiceInput(onResult, language = 'en-US') {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  // Always keep the LATEST transcript in a ref, independent of render timing
  const transcriptRef = useRef('');
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Track the previous listening value so we detect the true->false transition
  const wasListeningRef = useRef(false);
  useEffect(() => {
    if (wasListeningRef.current && !listening) {
      // Listening just stopped — read whatever is CURRENTLY in the ref
      if (transcriptRef.current) {
        onResult(transcriptRef.current);
        resetTranscript();
        transcriptRef.current = '';
      }
    }
    wasListeningRef.current = listening;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening]);

  const startListening = () => {
    resetTranscript();
    transcriptRef.current = '';
    SpeechRecognition.startListening({ language, continuous: false });
  };

  return {
    startListening,
    listening,
    browserSupportsSpeechRecognition,
  };
}

export default useVoiceInput;