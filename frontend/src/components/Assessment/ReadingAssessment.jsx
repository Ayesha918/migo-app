// src/components/Assessment/ReadingAssessment.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuestions, submitAssessment } from '../../services/api';
import speak from '../../services/speak';
import AssessmentResult from './AssessmentResult';
import styles from './Assessment.module.css';

const LANG_SPEECH_CODES = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN' };

function ReadingAssessment({ learner }) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [alreadyDone, setAlreadyDone] = useState(false);

  const preferredLang = learner?.learning_language || learner?.preferred_language || 'en';

  useEffect(() => {
    fetchQuestions('reading', preferredLang, learner.learner_id)
      .then((res) => setQuestions(res.data))
      .catch((err) => {
        if (err.response?.data?.error === 'already_completed') {
          setAlreadyDone(true);
        }
        setQuestions([]);
      })
      .finally(() => setLoading(false));
  }, [learner, preferredLang]);

  const currentQuestion = questions[currentIndex];
  
  const handleSpeak = () => {
    if (currentQuestion) {
      const rawText = currentQuestion.question_text || "";
      let targetText = rawText;
      if (rawText.includes(':')) {
        targetText = rawText.split(':')[1].trim();
      }
      speak(targetText, LANG_SPEECH_CODES[preferredLang] || 'en-US');
    }
  };

  const handleSelect = (letter) => {
    setSelectedOption(letter);
  };

  const handleNext = async () => {
    const updatedAnswers = [
      ...answers,
      { question_id: currentQuestion.id, answer: selectedOption },
    ];
    setAnswers(updatedAnswers);
    setSelectedOption(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setSubmitting(true);
      try {
        const response = await submitAssessment({
          learner_id: learner.learner_id,
          assessment_type: 'reading',
          language: preferredLang,
          answers: updatedAnswers,
        });
        setResult(response.data);
      } catch (error) {
        console.error('Submit failed:', error);
      } finally {
        setSubmitting(false);
      }
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
  if (result) return <AssessmentResult result={result} assessmentType="reading" />;
  if (!currentQuestion) return <p className={styles.progressText}>No questions available.</p>;

  const options = [
    { letter: 'A', text: currentQuestion.option_a },
    { letter: 'B', text: currentQuestion.option_b },
    { letter: 'C', text: currentQuestion.option_c },
    { letter: 'D', text: currentQuestion.option_d },
  ];

  return (
    <>
      <div className={styles.header}>
        <span className={styles.progressText}>
          {currentIndex + 1} / {questions.length}
        </span>
        <button className={styles.speakerButtonSmall} onClick={handleSpeak} type="button">🔊</button>
      </div>

      <div className={styles.card}>
        <p className={styles.questionText}>{currentQuestion.question_text}</p>
        <div className={styles.optionsGrid}>
          {options.map((opt) => (
            <button
              key={opt.letter}
              type="button"
              className={`${styles.optionButton} ${
                selectedOption === opt.letter ? styles.optionButtonSelected : ''
              }`}
              onClick={() => handleSelect(opt.letter)}
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>

      <button
        className={styles.nextButton}
        onClick={handleNext}
        disabled={!selectedOption || submitting}
        type="button"
      >
        {submitting ? 'Submitting...' : currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
      </button>
    </>
  );
}

export default ReadingAssessment;