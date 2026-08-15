// src/components/Dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Award, Map, ArrowLeft, CheckCircle2, Star, 
  Flame, Sparkles, Zap, DollarSign, Users, ChevronRight, Volume2,
  RefreshCw, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line
} from 'recharts';
import { useLearner } from '../../services/LearnerContext';
import useTranslate from '../../services/useTranslate';
import { fetchDashboardSummary } from '../../services/api';
import speak from '../../services/speak';
import owl from '../../assets/images/owl.png';
import Sidebar from '../Home/Sidebar';
import styles from './Dashboard.module.css';

const AVATAR_EMOJI = {
  boy: '👦', girl: '👧', grandmother: '👵', grandfather: '👴',
  teacher: '🧑‍🏫', book: '📖', lion: '🦁', tiger: '🐯',
  apple: '🍎', flower: '🌸', star: '⭐', migo: '🦊',
};

const STORE_ITEMS = [
  { id: 'quiz', title: 'Weakness Revision Quiz', cost: 20, emoji: '📝', desc: 'Unlock a custom quiz based on your recently missed questions.' },
  { id: 'flashcards', title: 'Interactive Vocabulary Deck', cost: 30, emoji: '🃏', desc: 'Unlock flashcards with visual aids and audio speak triggers.' },
  { id: 'story', title: 'Personalized Story Reader', cost: 40, emoji: '📖', desc: 'Unlock an illustrated story tailored to your current level.' }
];

const QUIZ_QUESTIONS = {
  kn: [
    { q: 'ಅರಸ ಪದದ ಸರಿಯಾದ ಕಾಗುಣಿತ ಯಾವುದು?', opts: ['ಅರಸ', 'ಅರತ', 'ಅರಪ', 'ಅರವ'], ans: 0 },
    { q: 'ಮಕ್ಕಳು ______ ಆಟವಾಡುತ್ತಾರೆ.', opts: ['ಉದ್ಯಾನವನದಲ್ಲಿ', 'ಆಕಾಶದಲ್ಲಿ', 'ಮನೆಯಲ್ಲಿ', 'ನೀರಿನಲ್ಲಿ'], ans: 0 }
  ],
  hi: [
    { q: 'सही वर्तनी वाला शब्द चुनें:', opts: ['मानव', 'मावन', 'मनाव', 'मानवा'], ans: 0 },
    { q: 'बच्चे पार्क में ______ हैं।', opts: ['खेलते', 'सोते', 'पढ़ते', 'रोते'], ans: 0 }
  ],
  ta: [
    { q: 'சரியான சொல்லைத் தேர்ந்தெடுக்கவும்:', opts: ['மனிதன்', 'மனிதா', 'மனிதம்', 'மனிதர்'], ans: 0 },
    { q: 'குழந்தைகள் பூங்காவில் ______.', opts: ['விளையாடுகிறார்கள்', 'தூங்குகிறார்கள்', 'படிக்கிறார்கள்', 'அழுகிறார்கள்'], ans: 0 }
  ],
  en: [
    { q: 'Which word is spelled correctly?', opts: ['human', 'humn', 'humon', 'humanne'], ans: 0 },
    { q: 'The children ______ in the park.', opts: ['play', 'sleep', 'read', 'cry'], ans: 0 }
  ]
};

const FLASHCARDS = {
  kn: [
    { word: 'ಮಾನವ', eng: 'Human', desc: 'ಒಬ್ಬ ಮನುಷ್ಯ / A human being' },
    { word: 'ಸೂರ್ಯ', eng: 'Sun', desc: 'ಆಕಾಶದಲ್ಲಿ ಹೊಳೆಯುವ ನಕ್ಷತ್ರ / The hot star' },
    { word: 'ಮಾರುಕಟ್ಟೆ', eng: 'Market', desc: 'ವಸ್ತುಗಳನ್ನು ಖರೀದಿಸುವ ಸ್ಥಳ / Place to shop' }
  ],
  hi: [
    { word: 'मानव', eng: 'Human', desc: 'एक मनुष्य / A human being' },
    { word: 'सूरज', eng: 'Sun', desc: 'आसमान में चमकने वाला तारा / The hot star' },
    { word: 'बाजार', eng: 'Market', desc: 'सामान खरीदने की जगह / Place to shop' }
  ],
  ta: [
    { word: 'மனிதன்', eng: 'Human', desc: 'ஒரு மனிதர் / A human being' },
    { word: 'சூரியன்', eng: 'Sun', desc: 'வானில் ஒளிரும் நட்சத்திரம் / The hot star' },
    { word: 'சந்தை', eng: 'Market', desc: 'பொருட்கள் வாங்கும் இடம் / Place to shop' }
  ],
  en: [
    { word: 'human', eng: 'Human', desc: 'A person / individual' },
    { word: 'sun', eng: 'Sun', desc: 'The shining star in the sky' },
    { word: 'market', eng: 'Market', desc: 'A place to buy things' }
  ]
};

const STORIES = {
  kn: {
    title: 'ಸಹಾಯ ಮಾಡುವ ಕರಡಿ 🐻',
    text: 'ಒಂದು ಕಾಡಿನಲ್ಲಿ ಒಂದು ಕರಡಿ ಇತ್ತು. ಅದು ತನ್ನ ಎಲ್ಲಾ ಸ್ನೇಹಿತರಿಗೆ ಸಹಾಯ ಮಾಡುತ್ತಿತ್ತು. ಒಂದು ದಿನ ನರಿ ಕಷ್ಟದಲ್ಲಿದ್ದಾಗ ಕರಡಿ ಓಡಿ ಬಂದು ಕಾಪಾಡಿತು.',
    speechText: 'ಒಂದು ಕಾಡಿನಲ್ಲಿ ಒಂದು ಕರಡಿ ಇತ್ತು. ಅದು ತನ್ನ ಎಲ್ಲಾ ಸ್ನೇಹಿತರಿಗೆ ಸಹಾಯ ಮಾಡುತ್ತಿತ್ತು.'
  },
  hi: {
    title: 'सच्चा मित्र भालू 🐻',
    text: 'एक जंगल में एक भालू रहता था। वह हमेशा अपने दोस्तों की मदद करता था। एक दिन जब लोमड़ी मुसीबत में थी, भालू ने उसकी जान बचाई।',
    speechText: 'एक जंगल में एक भालू रहता था। वह हमेशा अपने दोस्तों की मदद करता था।'
  },
  ta: {
    title: 'உதவும் கரடி 🐻',
    text: 'ஒரு காட்டில் ஒரு கரடி இருந்தது. அது தனது நண்பர்களுக்கு எப்போதும் உதவி செய்தது. ஒரு நாள் நரி ஆபத்தில் இருந்தபோது கரடி ஓடி வந்து காப்பாற்றியது.',
    speechText: 'ஒரு காட்டில் ஒரு கரடி இருந்தது. அது தனது நண்பர்களுக்கு எப்போதும் உதவி செய்தது.'
  },
  en: {
    title: 'The Helpful Bear 🐻',
    text: 'In a beautiful forest, there lived a friendly bear. He loved helping all his forest friends. One day, when the fox got stuck, the bear rescued him immediately.',
    speechText: 'In a beautiful forest, there lived a friendly bear. He loved helping all his forest friends.'
  }
};

export default function Dashboard() {
  const { learner } = useLearner();
  const navigate = useNavigate();
  const t = useTranslate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyMessage, setBuyMessage] = useState('');
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [activePractice, setActivePractice] = useState(null);

  // Quiz state
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Flashcards state
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  useEffect(() => {
    if (!learner) return;
    fetchDashboardSummary(learner.learner_id)
      .then((res) => setSummary(res.data))
      .catch((err) => console.error('Failed to load dashboard:', err))
      .finally(() => setLoading(false));
  }, [learner]);

  const handleSpeakRecommendation = () => {
    if (summary?.ai_recommendation) {
      const langMap = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN' };
      const knownLangCode = langMap[learner?.known_language] || 'en-US';
      speak(summary.ai_recommendation, knownLangCode, 0.9);
    }
  };

  const handleBuyItem = (item) => {
    if (!summary) return;
    if (summary.virtual_coins < item.cost) {
      setBuyMessage(`❌ Not enough coins! You need ${item.cost - summary.virtual_coins} more 🪙.`);
      setTimeout(() => setBuyMessage(''), 3000);
      return;
    }
    // Deduct coins mock action
    setSummary({
      ...summary,
      virtual_coins: summary.virtual_coins - item.cost
    });
    setUnlockedIds([...unlockedIds, item.id]);
    setActivePractice(item.id);
    setBuyMessage(`🎉 Success! You unlocked: ${item.title} ${item.emoji}!`);
    setTimeout(() => setBuyMessage(''), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('migo_learner');
    navigate('/');
    window.location.reload();
  };

  const renderPracticeSection = () => {
    const langKey = learner.learning_language || 'en';
    const nativeLangCode = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN' }[langKey] || 'en-US';

    if (activePractice === 'quiz') {
      const questions = QUIZ_QUESTIONS[langKey] || QUIZ_QUESTIONS['en'];
      const question = questions[quizIdx];

      const handleOptionClick = (optIdx) => {
        if (quizAnswered !== null) return;
        if (optIdx === question.ans) {
          setQuizAnswered({ optIdx, isCorrect: true });
          speak('Excellent work!', 'en-US');
        } else {
          setQuizAnswered({ optIdx, isCorrect: false });
          speak('Try again!', 'en-US');
        }
      };

      const handleNextQuestion = () => {
        setQuizAnswered(null);
        if (quizIdx + 1 < questions.length) {
          setQuizIdx(quizIdx + 1);
        } else {
          setQuizCompleted(true);
        }
      };

      const handleClaimReward = () => {
        setSummary({
          ...summary,
          virtual_coins: summary.virtual_coins + 10
        });
        setBuyMessage('🎉 Claimed 10 bonus 🪙 for completing revision!');
        setTimeout(() => setBuyMessage(''), 3000);
        setQuizIdx(0);
        setQuizAnswered(null);
        setQuizCompleted(false);
        setActivePractice(null);
      };

      return (
        <div className={styles.interactivePracticeContainer}>
          <div className={styles.practiceHeader}>
            <h4>📝 Revision Quiz</h4>
            <button className={styles.closePracticeBtn} onClick={() => { setActivePractice(null); setQuizAnswered(null); setQuizCompleted(false); setQuizIdx(0); }}>✕</button>
          </div>

          {quizCompleted ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center', padding: '10px 0' }}>
              <span style={{ fontSize: '40px' }}>🏆</span>
              <h5 style={{ fontWeight: 850, margin: 0 }}>Quiz Completed!</h5>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>Great job revising your weak topics today.</p>
              <button className={styles.claimBtn} onClick={handleClaimReward}>
                Claim 10 🪙 Reward
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-orange)', fontWeight: 800 }}>Question {quizIdx + 1} of {questions.length}</span>
              <p className={styles.quizQuestion}>{question.q}</p>
              <div className={styles.quizOptionsList}>
                {question.opts.map((opt, oIdx) => {
                  let optStyle = styles.quizOptionBtn;
                  if (quizAnswered !== null) {
                    if (oIdx === question.ans) {
                      optStyle = `${styles.quizOptionBtn} ${styles.quizOptionCorrect}`;
                    } else if (quizAnswered.optIdx === oIdx && !quizAnswered.isCorrect) {
                      optStyle = `${styles.quizOptionBtn} ${styles.quizOptionIncorrect}`;
                    }
                  }
                  return (
                    <button
                      key={oIdx}
                      className={optStyle}
                      disabled={quizAnswered !== null}
                      onClick={() => handleOptionClick(oIdx)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {quizAnswered !== null && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className={`${styles.quizFeedback} ${quizAnswered.isCorrect ? styles.feedbackSuccess : styles.feedbackFail}`}>
                    {quizAnswered.isCorrect ? '✅ Correct Answer! Keep it up.' : '❌ Incorrect. Study the options.'}
                  </div>
                  <button className={styles.buyBtn} style={{ marginTop: '4px' }} onClick={handleNextQuestion}>
                    <span>{quizIdx + 1 === questions.length ? 'Finish Quiz ➔' : 'Next Question ➔'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (activePractice === 'flashcards') {
      const cards = FLASHCARDS[langKey] || FLASHCARDS['en'];
      const card = cards[flashcardIdx];

      const handleHearWord = (e) => {
        e.stopPropagation();
        speak(card.word, nativeLangCode);
      };

      return (
        <div className={styles.interactivePracticeContainer}>
          <div className={styles.practiceHeader}>
            <h4>🃏 Vocabulary Deck</h4>
            <button className={styles.closePracticeBtn} onClick={() => { setActivePractice(null); setFlashcardIdx(0); setFlashcardFlipped(false); }}>✕</button>
          </div>

          <div className={styles.flashcardBody} onClick={() => setFlashcardFlipped(!flashcardFlipped)}>
            {flashcardFlipped ? (
              <>
                <span className={styles.flashcardTranslation}>{card.eng}</span>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, marginTop: '8px', textAlign: 'center' }}>
                  {card.desc}
                </p>
                <span className={styles.flashcardFlipNotice}>Tap to flip back</span>
              </>
            ) : (
              <>
                <span className={styles.flashcardWord}>{card.word}</span>
                <span className={styles.flashcardFlipNotice}>Tap to see translation</span>
              </>
            )}
          </div>

          <div className={styles.flashcardActionsRow}>
            <button
              className={styles.prevNextBtn}
              disabled={flashcardIdx === 0}
              onClick={() => { setFlashcardIdx(flashcardIdx - 1); setFlashcardFlipped(false); }}
            >
              ◀ Prev
            </button>

            <button className={styles.speakCardBtn} onClick={handleHearWord}>
              <Volume2 size={16} />
              <span>Listen</span>
            </button>

            <button
              className={styles.prevNextBtn}
              disabled={flashcardIdx + 1 === cards.length}
              onClick={() => { setFlashcardIdx(flashcardIdx + 1); setFlashcardFlipped(false); }}
            >
              Next ▶
            </button>
          </div>
        </div>
      );
    }

    if (activePractice === 'story') {
      const story = STORIES[langKey] || STORIES['en'];

      const handleHearStory = () => {
        speak(story.text, nativeLangCode, 0.9);
      };

      return (
        <div className={styles.interactivePracticeContainer}>
          <div className={styles.practiceHeader}>
            <h4>📖 Short Story Reader</h4>
            <button className={styles.closePracticeBtn} onClick={() => setActivePractice(null)}>✕</button>
          </div>

          <div className={styles.storyTextContainer}>
            <h5 className={styles.storyTitleText}>{story.title}</h5>
            <p className={styles.storyParagraph}>{story.text}</p>
          </div>

          <div className={styles.storyActionsRow}>
            <button className={styles.speakCardBtn} onClick={handleHearStory}>
              <Volume2 size={16} />
              <span>Read Aloud</span>
            </button>
            <button className={styles.buyBtn} style={{ background: 'linear-gradient(135deg, #27AE60, #2ECC71)', boxShadow: '0 4px 0 #219A52' }} onClick={() => setActivePractice(null)}>
              <span>Mark as Read</span>
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  if (!learner) {
    return (
      <div className={styles.centerPage}>
        <p>Please log in first.</p>
        <button className={styles.primaryButton} onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  // Parse skill radar values into Recharts structure
  const skillsData = summary?.skills_radar ? Object.entries(summary.skills_radar).map(([name, score]) => ({
    subject: name,
    value: score,
    fullMark: 100
  })) : [];

  // Parse weekly study chart values into chart structure
  const studyChartData = summary?.weekly_study_chart ? summary.weekly_study_chart.map((minutes, idx) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return { name: days[idx] || '', Study: minutes };
  }) : [];

  // Parse pronunciation trend data
  const pronunciationTrendData = summary?.pronunciation_trend ? summary.pronunciation_trend.map((score, idx) => ({
    name: `A${idx + 1}`,
    Score: score
  })) : [];

  // Format progress improvement lists
  const readingChartData = summary?.reading_improvement?.map((score, i) => ({ name: `T${i+1}`, Score: score })) || [];
  const writingChartData = summary?.writing_improvement?.map((score, i) => ({ name: `T${i+1}`, Score: score })) || [];
  const speakingChartData = summary?.speaking_improvement?.map((score, i) => ({ name: `T${i+1}`, Score: score })) || [];

  return (
    <div className={styles.pageLayout}>
      <Sidebar onLogout={handleLogout} />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <Trophy size={32} color="var(--color-orange)" />
            <div>
              <h1>Trophy Room & Progress Analytics</h1>
              <p>Review speaking scores, streaking streaks, earned badges, and custom AI recommendations.</p>
            </div>
          </div>
          
          <button className={styles.backBtn} onClick={() => navigate('/home')}>
            <ArrowLeft size={18} />
            <span>Adventure Map</span>
          </button>
        </header>

        {loading ? (
          <div className={styles.loadingBox}>
            <RefreshCw className={styles.spin} />
            <p>Gathering dashboard telemetry...</p>
          </div>
        ) : summary ? (
          <>
            {/* HERO PROFILE & AI RECOMMENDATION */}
            <section className={styles.heroSection}>
              <div className={styles.profileBanner}>
                <div className={styles.avatarBox}>{AVATAR_EMOJI[learner.avatar] || '⭐'}</div>
                <div className={styles.profileInfo}>
                  <h2>Super Star {learner.name}! 🌟</h2>
                  <p>ID: {learner.learner_id} | Language Path: {learner.learning_language.toUpperCase()}</p>
                </div>
              </div>

              {/* AI Recommendations Box */}
              <div className={styles.aiTutorRecomBox}>
                <img src={owl} alt="AI Tutor Owl" className={styles.tutorOwlMascot} />
                <div className={styles.tutorBubble}>
                  <div className={styles.bubbleHeader}>
                    <span>🦉 AI Tutor Recommendation</span>
                    <button className={styles.speakBtn} onClick={handleSpeakRecommendation} title="Read Aloud">
                      <Volume2 size={16} />
                    </button>
                  </div>
                  <p className={styles.recommendationText}>
                    "{summary.ai_recommendation || 'Keep practicing your lesson activities daily to build consistent overall literacy!'}"
                  </p>
                </div>
              </div>
            </section>

            {/* QUICK STATS WIDGETS (Streaks, XP, Coins, Lessons) */}
            <section className={styles.quickStatsGrid}>
              {/* Widget 1: Lessons Completed */}
              <div className={styles.statCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>📖</span>
                  <h4>Lessons Completed</h4>
                </div>
                <h3>{summary.lessons_completed} Lessons</h3>
                <span className={styles.statSub}>On {summary.level?.toUpperCase()} stage</span>
              </div>

              {/* Widget 2: Weekly Study Time */}
              <div className={styles.statCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>⏱️</span>
                  <h4>Weekly Study Time</h4>
                </div>
                <h3>{summary.weekly_study_time} mins</h3>
                <span className={styles.statSub}>In last 7 days</span>
              </div>

              {/* Widget 3: Daily streak */}
              <div className={styles.statCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon} style={{ color: '#FF7A00' }}>🔥</span>
                  <h4>Daily Streak</h4>
                </div>
                <h3>{summary.streak_count} Days</h3>
                <span className={styles.statSub}>Keep consistency active!</span>
              </div>

              {/* Widget 4: XP progress */}
              <div className={styles.statCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon} style={{ color: '#FFCA57' }}>🌟</span>
                  <h4>XP Points</h4>
                </div>
                <h3>{summary.xp_points} / {summary.xp_target}</h3>
                <div className={styles.xpProgressContainer}>
                  <div 
                    className={styles.xpProgressBar} 
                    style={{ width: `${Math.min(100, (summary.xp_points / summary.xp_target) * 100)}%` }} 
                  />
                </div>
              </div>
            </section>

            {/* MAIN PROGRESS CHARTS (Simplified for Neo-Literates & Elderly Learners) */}
            <section className={styles.chartsGrid}>
              {/* Widget 5: Skills Comparison Bar Chart */}
              <div className={styles.chartCard}>
                <h3>🎯 Skill-wise Mastery comparison</h3>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={skillsData}>
                      <XAxis dataKey="subject" tick={{ fill: 'var(--text-dark)', fontSize: 13, fontWeight: 700 }} />
                      <YAxis domain={[0, 100]} tickLine={false} axisLine={false} ticks={[0, 25, 50, 75, 100]} tick={{ fill: 'var(--text-dark)' }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="var(--color-orange)" radius={[8, 8, 0, 0]} barSize={35} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Widget 6: Pronunciation Trend Chart */}
              <div className={styles.chartCard}>
                <h3>🎙️ Pronunciation accuracy trend</h3>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={pronunciationTrendData}>
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-dark)', fontWeight: 700 }} />
                      <YAxis domain={[0, 100]} tickLine={false} axisLine={false} ticks={[0, 20, 40, 60, 80, 100]} tick={{ fill: 'var(--text-dark)' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="Score" stroke="var(--color-orange)" strokeWidth={4} dot={{ r: 8, fill: '#FF7A00', strokeWidth: 3, stroke: '#FFF8F0' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Widget 7: Weekly Study distribution Bar Chart */}
              <div className={styles.chartCard} style={{ gridColumn: 'span 2' }}>
                <h3>📈 Study Time Activity (Minutes per Day)</h3>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={studyChartData}>
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-dark)', fontWeight: 700 }} />
                      <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: 'var(--text-dark)' }} />
                      <Tooltip />
                      <Bar dataKey="Study" fill="#FF9F43" radius={[8, 8, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* SKILL IMPROVEMENT COMPARISONS (Line/Bar graphs) */}
            <section className={styles.skillQuestsSection}>
              <h3>📊 Skill-wise Progress Trends</h3>
              <div className={styles.miniChartsRow}>
                {/* Reading score path */}
                <div className={styles.miniChartCard}>
                  <h4>Reading Improvement</h4>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={readingChartData}>
                      <Tooltip />
                      <Line type="monotone" dataKey="Score" stroke="#FF9F43" strokeWidth={3.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <span>Score: <strong>{summary.reading_score}%</strong></span>
                </div>

                {/* Writing score path */}
                <div className={styles.miniChartCard}>
                  <h4>Writing Improvement</h4>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={writingChartData}>
                      <Tooltip />
                      <Line type="monotone" dataKey="Score" stroke="#1DD1A1" strokeWidth={3.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <span>Score: <strong>{summary.writing_score}%</strong></span>
                </div>

                {/* Speaking score path */}
                <div className={styles.miniChartCard}>
                  <h4>Speaking Improvement</h4>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={speakingChartData}>
                      <Tooltip />
                      <Line type="monotone" dataKey="Score" stroke="#9C88FF" strokeWidth={3.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <span>Score: <strong>{summary.skills_radar?.Speaking}%</strong></span>
                </div>
              </div>
            </section>

            {/* GAMIFICATION ROOM (Store, badges, leaderboard) */}
            <section className={styles.gamificationSection}>
              {/* Practice & Revision Center */}
              <div className={styles.storeCard}>
                <div className={styles.storeHeader}>
                  <h3>🪙 Practice & Revision Center</h3>
                  <span className={styles.coinsCount}>Balance: 🪙 {summary.virtual_coins}</span>
                </div>
                
                <AnimatePresence mode="wait">
                  {buyMessage && (
                    <motion.div 
                      className={styles.shopToast}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {buyMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                {activePractice ? (
                  renderPracticeSection()
                ) : (
                  <div className={styles.storeItemsList}>
                    {STORE_ITEMS.map((item) => {
                      const isUnlocked = unlockedIds.includes(item.id);
                      return (
                        <div key={item.id} className={styles.storeItem}>
                          <span className={styles.itemEmoji}>{item.emoji}</span>
                          <div className={styles.itemMeta}>
                            <h5>{item.title}</h5>
                            <p>{item.desc}</p>
                          </div>
                          {isUnlocked ? (
                            <button className={styles.buyBtn} style={{ background: 'linear-gradient(135deg, #27AE60, #2ECC71)', boxShadow: '0 4px 0 #219A52' }} onClick={() => setActivePractice(item.id)}>
                              <span>Start ➔</span>
                            </button>
                          ) : (
                            <button className={styles.buyBtn} onClick={() => handleBuyItem(item)}>
                              <span>Unlock {item.cost} 🪙</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Leaderboard widget */}
              <div className={styles.leaderboardCard}>
                <h3>🏆 Adventure Leaderboard</h3>
                <div className={styles.leaderboardList}>
                  {summary.leaderboard?.map((user) => (
                    <div key={user.rank} className={`${styles.leaderboardUser} ${user.name === learner.name ? styles.leaderboardMe : ''}`}>
                      <span className={styles.rankNum}>{user.rank}</span>
                      <span className={styles.avatarEmoji}>{AVATAR_EMOJI[user.avatar] || '⭐'}</span>
                      <div className={styles.userInfo}>
                        <h5>{user.name}</h5>
                        <span>{user.xp} XP Points</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges display */}
              <div className={styles.badgesPanel}>
                <h3>🎖️ Unlocked Badges & Achievements</h3>
                
                {summary.badges?.length === 0 ? (
                  <p className={styles.noActivity}>No achievements earned yet. Complete speaking practice or daily lessons to unlock badges!</p>
                ) : (
                  <div className={styles.badgesGrid}>
                    {summary.badges?.map((badge, idx) => (
                      <div key={idx} className={styles.badgeItem} title={badge.description}>
                        <div className={styles.badgeCircle}>{badge.icon_emoji}</div>
                        <strong>{badge.title}</strong>
                        <span>{badge.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <div className={styles.loadingBox}>
            <AlertCircle size={32} color="var(--color-pink)" />
            <p>Could not compile dashboard statistics.</p>
          </div>
        )}
      </main>
    </div>
  );
}