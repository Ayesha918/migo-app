// src/components/Assessment/PlacementAssessment.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchQuestions, submitAssessment, fetchDashboardSummary } from '../../services/api';
import speak from '../../services/speak';
import VirtualKeyboard from './VirtualKeyboard';
import owl from '../../assets/images/owl.png';
import styles from './PlacementAssessment.module.css';
import useTranslate from '../../services/useTranslate';

const LANG_SPEECH_CODES = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN' };

export default function PlacementAssessment() {
  const location = useLocation();
  const navigate = useNavigate();
  const learner = location.state?.learner;
  const t = useTranslate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // 0-6 are questions, 7 is celebration
  const [answers, setAnswers] = useState({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assignedLevel, setAssignedLevel] = useState('beginner');

  const preferredLang = learner?.learning_language || 'en';
  const knownLang = learner?.known_language || 'en';

  const speechLang = LANG_SPEECH_CODES[preferredLang] || 'en-US';
  const knownSpeechLang = LANG_SPEECH_CODES[knownLang] || 'en-US';

  const formatQuestionText = (text) => {
    if (!text) return "";
    if (text.startsWith("Which picture matches:")) {
      const word = text.replace("Which picture matches:", "").trim();
      return `${t('whichPictureMatches')} ${word}`;
    }
    return text;
  };

  useEffect(() => {
    if (!learner) return;

    setLoading(true);
    Promise.all([
      fetchQuestions('reading', preferredLang, learner.learner_id).catch(() => ({ data: [] })),
      fetchQuestions('writing', preferredLang, learner.learner_id).catch(() => ({ data: [] })),
      fetchQuestions('comprehension', preferredLang, learner.learner_id).catch(() => ({ data: [] })),
    ])
      .then(([rRes, wRes, cRes]) => {
        const readQ = rRes.data || [];
        const writeQ = wRes.data || [];
        const compQ = cRes.data || [];

        // Combine to 7 questions: 3 reading, 1 writing, 3 comprehension
        const combined = [
          ...readQ.slice(0, 3),
          ...writeQ.slice(0, 1),
          ...compQ.slice(0, 3)
        ];
        setQuestions(combined);
      })
      .catch((err) => console.error('Error fetching questions:', err))
      .finally(() => setLoading(false));
  }, [learner, preferredLang]);

  // Audio narrator guidance on loading/moving index
  useEffect(() => {
    if (loading || questions.length === 0 || currentIndex >= questions.length) return;
    const currentQ = questions[currentIndex];

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    let instructionText = "";
    let targetText = "";

    if (currentQ.assessment_type === 'reading') {
      instructionText = `${t('readingCheck')}, ${currentIndex + 1}. ${t('whichPictureMatches') || 'Which picture matches:'}`;
      
      const rawText = currentQ.question_text || "";
      if (rawText.includes(':')) {
        targetText = rawText.split(':')[1].trim();
      } else {
        targetText = rawText;
      }
    } else if (currentQ.assessment_type === 'writing') {
      instructionText = `${t('writingCheck')}. ${t('writeShortResponse') || 'Write the word:'}`;
      
      const rawText = currentQ.question_text || "";
      if (rawText.includes(':')) {
        targetText = rawText.split(':')[1].trim();
      } else {
        targetText = rawText;
      }
    } else {
      instructionText = `${t('comprehensionCheck')}.`;
      if (currentQ.passage_text) {
        targetText = `${currentQ.passage_text}. ${currentQ.question_text}`;
      } else {
        targetText = currentQ.question_text;
      }
    }

    // 1. Speak the instruction in the user's known language accent
    if (instructionText) {
      speak(instructionText, knownSpeechLang, 0.95, true);
    }
    
    // 2. Speak the target content in the preferred/learning language accent
    if (targetText) {
      speak(targetText, speechLang, 0.95, false);
    }
  }, [currentIndex, loading, questions, speechLang, knownSpeechLang]);

  if (!learner) {
    return (
      <div className={styles.center}>
        <p>Please register first.</p>
        <button className={styles.primaryBtn} onClick={() => navigate('/register')}>
          Register
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.center}>
        <img src={owl} alt="MiGo Mascot" className={styles.loadingOwl} />
        <h2>{t('preparingAssessment')}</h2>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleNextStep = async () => {
    const currentAnswer = answers[currentQuestion.id] || '';
    if (!currentAnswer.trim() && currentQuestion.assessment_type === 'writing') {
      speak(t('writeShortResponse'), knownSpeechLang);
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setSubmitting(true);
      try {
        // Group answers by assessment type
        const readingAnswers = questions
          .filter((q) => q.assessment_type === 'reading')
          .map((q) => ({ question_id: q.id, answer: answers[q.id] || '' }));

        const writingAnswers = questions
          .filter((q) => q.assessment_type === 'writing')
          .map((q) => ({ question_id: q.id, answer: answers[q.id] || '' }));

        const comprehensionAnswers = questions
          .filter((q) => q.assessment_type === 'comprehension')
          .map((q) => ({ question_id: q.id, answer: answers[q.id] || '' }));

        // Submit to backend
        if (readingAnswers.length > 0) {
          await submitAssessment({
            learner_id: learner.learner_id,
            assessment_type: 'reading',
            language: preferredLang,
            answers: readingAnswers,
          });
        }
        if (writingAnswers.length > 0) {
          await submitAssessment({
            learner_id: learner.learner_id,
            assessment_type: 'writing',
            language: preferredLang,
            answers: writingAnswers,
          });
        }
        if (comprehensionAnswers.length > 0) {
          await submitAssessment({
            learner_id: learner.learner_id,
            assessment_type: 'comprehension',
            language: preferredLang,
            answers: comprehensionAnswers,
          });
        }

        // Fetch updated profile level
        const summary = await fetchDashboardSummary(learner.learner_id);
        const updatedLevel = summary.data?.level || 'beginner';
        setAssignedLevel(updatedLevel);

        speak(`Awesome! Based on your check, you have been placed in the ${updatedLevel} level!`, knownSpeechLang);
        setCurrentIndex(questions.length); // Trigger celebration step
      } catch (err) {
        console.error('Submitting placement checks failed:', err);
        setCurrentIndex(questions.length);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleFinish = () => {
    navigate('/home');
  };

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const getCheckHeader = (type) => {
    if (type === 'reading') return t('readingCheck');
    if (type === 'writing') return t('writingCheck');
    return t('comprehensionCheck');
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <AnimatePresence mode="wait">
          {currentIndex < questions.length ? (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.stepHeader}>
                {getCheckHeader(currentQuestion.assessment_type)} ({currentIndex + 1}/{questions.length})
              </div>

              {currentQuestion.passage_text && (
                <p className={styles.passageText}>{currentQuestion.passage_text}</p>
              )}

              <p className={styles.questionText}>{formatQuestionText(currentQuestion.question_text)}</p>

              {currentQuestion.question_type === 'mcq' ? (
                <div className={styles.optionsGrid}>
                  {['A', 'B', 'C', 'D'].map((letter) => {
                    const optionText = currentQuestion[`option_${letter.toLowerCase()}`];
                    if (!optionText) return null;
                    const isEmoji = !/[\u0900-\u097F\u0C80-\u0CFF\u0B80-\u0BFFa-zA-Z0-9]/.test(optionText) && optionText.length <= 4;
                    return (
                      <button
                        key={letter}
                        className={`${isEmoji ? styles.emojiOptionBtn : styles.optionBtn} ${answers[currentQuestion.id] === letter ? (isEmoji ? styles.activeEmojiOption : styles.activeOption) : ''}`}
                        onClick={() => setAnswer(currentQuestion.id, letter)}
                        type="button"
                      >
                        {optionText}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ marginBottom: '20px' }}>
                  <textarea
                    className={styles.textInput}
                    placeholder={t('typeResponsePlaceholder')}
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
                    rows={3}
                  />
                  <VirtualKeyboard
                    language={preferredLang}
                    onCharPress={(char) => setAnswer(currentQuestion.id, (answers[currentQuestion.id] || '') + char)}
                    onBackspace={() => setAnswer(currentQuestion.id, (answers[currentQuestion.id] || '').slice(0, -1))}
                    onSpace={() => setAnswer(currentQuestion.id, (answers[currentQuestion.id] || '') + ' ')}
                  />
                </div>
              )}
            </motion.div>
          ) : (
            /* CELEBRATION */
            <motion.div
              key="result"
              className={styles.celebration}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className={styles.emoji}>🌱</div>
              <h2>{t('assessmentComplete')}</h2>
              <p>{t('placedInLevel')}</p>
              <div className={styles.levelBadge}>{assignedLevel.toUpperCase()} LEVEL</div>
              <button className={styles.primaryBtn} onClick={handleFinish} type="button">
                {t('enterAdventureWorld')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {currentIndex < questions.length && (
          <button
            className={styles.nextBtn}
            onClick={handleNextStep}
            disabled={submitting || !answers[currentQuestion.id]}
            type="button"
          >
            {submitting ? t('calculatingLevel') : t('continueBtn')}
          </button>
        )}
      </div>
    </div>
  );
}
