// src/components/Assessment/WritingAssessment.jsx
import { useState, useEffect } from 'react';
import { fetchQuestions, submitAssessment } from '../../services/api';
import speak from '../../services/speak';
import useVoiceInput from '../../services/useVoiceInput';
import AssessmentResult from './AssessmentResult';
import styles from './Assessment.module.css';

const LANG_SPEECH_CODES = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN' };

function WritingAssessment({ learner }) {
  const [questions, setQuestions] = useState([]);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const speechLang = LANG_SPEECH_CODES[learner.preferred_language] || 'en-US';

  const { startListening, listening, browserSupportsSpeechRecognition } = useVoiceInput(
    (transcript) => setAnswerText((prev) => (prev ? prev + ' ' + transcript : transcript)),
    speechLang
  );

  useEffect(() => {
    fetchQuestions('writing', learner.preferred_language)
      .then((res) => setQuestions(res.data))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [learner.preferred_language]);

  const currentQuestion = questions[0]; // single writing prompt for now

  const handleSpeak = () => {
    if (currentQuestion) speak(currentQuestion.question_text, speechLang);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await submitAssessment({
        learner_id: learner.learner_id,
        assessment_type: 'writing',
        language: learner.preferred_language,
        answers: [{ question_id: currentQuestion.id, answer: answerText }],
      });
      setResult(response.data);
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (result) return <AssessmentResult result={result} assessmentType="writing" />;
  if (!currentQuestion) return <p>No questions available.</p>;

  return (
    <>
      <div className={styles.header}>
        <span className={styles.progressText}>1 / 1</span>
        <button className={styles.speakerButtonSmall} onClick={handleSpeak} type="button">🔊</button>
      </div>

      <div className={styles.card}>
        <p className={styles.questionText}>{currentQuestion.question_text}</p>
        <textarea
          className={styles.textareaInput}
          placeholder="Type or use the microphone..."
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
        />
        {browserSupportsSpeechRecognition && (
          <button
            type="button"
            onClick={startListening}
            style={{ marginTop: 14 }}
            className={`${styles.speakerButtonSmall} ${listening ? 'pulseListening' : ''}`}
          >
            🎤
          </button>
        )}
      </div>

      <button
        className={styles.nextButton}
        onClick={handleSubmit}
        disabled={answerText.trim().length === 0 || submitting}
        type="button"
      >
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </>
  );
}

export default WritingAssessment;