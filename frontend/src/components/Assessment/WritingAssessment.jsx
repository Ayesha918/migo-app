// src/components/Assessment/WritingAssessment.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuestions, submitAssessment } from '../../services/api';
import speak from '../../services/speak';
import AssessmentResult from './AssessmentResult';
import VirtualKeyboard from './VirtualKeyboard';
import styles from './Assessment.module.css';

const LANG_SPEECH_CODES = {
  en: 'en-US',
  hi: 'hi-IN',
  kn: 'kn-IN',
  ta: 'ta-IN',
};

function WritingAssessment({ learner }) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [alreadyDone, setAlreadyDone] = useState(false);

  const preferredLang = learner?.learning_language || learner?.preferred_language || 'en';
  const speechLang = LANG_SPEECH_CODES[preferredLang] || 'en-US';

  const handleCharPress = (char) => {
    setAnswerText((prev) => prev + char);
  };

  const handleBackspace = () => {
    setAnswerText((prev) => prev.slice(0, -1));
  };

  const handleSpace = () => {
    setAnswerText((prev) => prev + ' ');
  };

  useEffect(() => {
    fetchQuestions('writing', preferredLang, learner?.learner_id)
      .then((res) => setQuestions(res.data))
      .catch((err) => {
        if (err.response?.data?.error === 'already_completed') {
          setAlreadyDone(true);
        }
        setQuestions([]);
      })
      .finally(() => setLoading(false));
  }, [learner, preferredLang]);

  const currentQuestion = questions[0];

  const handleSpeak = () => {
    if (currentQuestion) {
      speak(currentQuestion.question_text, speechLang);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await submitAssessment({
        learner_id: learner.learner_id,
        assessment_type: 'writing',
        language: preferredLang,
        answers: [
          {
            question_id: currentQuestion.id,
            answer: answerText,
          },
        ],
      });

      setResult(response.data);
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (alreadyDone) {
    return (
      <div className={styles.card} style={{ textAlign: 'center' }}>
        <p>You've already completed this assessment. 🎉</p>
        <button className={styles.nextButton} onClick={() => navigate('/dashboard')} type="button">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (loading) return <p className={styles.progressText}>Loading assessment...</p>;
  if (result) return <AssessmentResult result={result} assessmentType="writing" />;
  if (!currentQuestion) return <p className={styles.progressText}>No questions available.</p>;

  return (
    <>
      <div className={styles.header}>
        <span className={styles.progressText}>Writing Assessment (1 / 1)</span>
        <button className={styles.speakerButtonSmall} onClick={handleSpeak} type="button">
          🔊
        </button>
      </div>

      <div className={styles.card}>
        <p className={styles.questionText}>{currentQuestion.question_text}</p>

        <textarea
          className={styles.textareaInput}
          placeholder="Write your response here using keyboard below or your device keyboard..."
          value={answerText}
          rows={4}
          onChange={(e) => setAnswerText(e.target.value)}
        />

        {/* Script Virtual Keyboard for Hindi, Kannada, Tamil */}
        <VirtualKeyboard
          language={preferredLang}
          onCharPress={handleCharPress}
          onBackspace={handleBackspace}
          onSpace={handleSpace}
        />
      </div>

      <button
        className={styles.nextButton}
        onClick={handleSubmit}
        disabled={answerText.trim().length === 0 || submitting}
        type="button"
      >
        {submitting ? 'Submitting...' : 'Submit Writing Quest'}
      </button>
    </>
  );
}

export default WritingAssessment;