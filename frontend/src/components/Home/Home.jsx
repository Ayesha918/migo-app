// src/components/Home/Home.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Volume2, Sparkles, Target, Compass, Award, Flame, Star, Coins, Zap } from 'lucide-react';
import { useLearner } from '../../services/LearnerContext';
import speak from '../../services/speak';
import {
  fetchLearningPath,
  generateLearningPath,
  fetchRewardsSummary,
  fetchDashboardSummary,
} from '../../services/api';

import Sidebar from './Sidebar';
import Header from './Header';
import HeroMap from './HeroMap';
import VoiceAssistant from './VoiceAssistant';
import owl from '../../assets/images/owl.png';

import styles from './Home.module.css';
import useTranslate from '../../services/useTranslate';

const SPEECH_LANG_MAP = {
  en: 'en-US',
  hi: 'hi-IN',
  kn: 'kn-IN',
  ta: 'ta-IN',
};

function Home() {
  const navigate = useNavigate();
  const { learner, logout } = useLearner();
  const t = useTranslate();

  const [path, setPath] = useState([]);
  const [rewards, setRewards] = useState(null);
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const speechLang = SPEECH_LANG_MAP[learner?.learning_language] || 'en-US';

  const loadAll = async () => {
    if (!learner) return;

    setLoading(true);

    try {
      const [p, r, d] = await Promise.all([
        fetchLearningPath(learner.learner_id),
        fetchRewardsSummary(learner.learner_id),
        fetchDashboardSummary(learner.learner_id),
      ]);

      setPath(p.data);
      setRewards(r.data);
      setDashboard(d.data);
    } catch (err) {
      console.error('Home load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [learner]);

  const handleGeneratePath = async () => {
    if (!learner) return;
    setGenerating(true);

    try {
      const res = await generateLearningPath(learner.learner_id);
      const newPath = Array.isArray(res.data) ? res.data : [];

      if (newPath.length > 0) {
        setPath(newPath);
        const [r, d] = await Promise.all([
          fetchRewardsSummary(learner.learner_id),
          fetchDashboardSummary(learner.learner_id),
        ]);
        setRewards(r.data);
        setDashboard(d.data);
      } else {
        await loadAll();
      }
    } catch (err) {
      console.error('Generate path error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMascotSpeak = () => {
    const greeting = `Hi ${learner?.name || 'friend'}! Tap Continue Learning to start your next lesson!`;
    speak(greeting, speechLang);
  };

  if (!learner) {
    return (
      <div className={styles.centerContainer}>
        <div className={styles.loginPromptCard}>
          <h2>👋 Welcome to MiGo!</h2>
          <p>Please log in to start your learning adventure.</p>
          <button className={styles.primaryActionBtn} onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.centerContainer}>
        <motion.div
          className={styles.loadingBox}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <img src={owl} alt="MiGo Owl" className={styles.loadingOwl} />
          <h2>Preparing your Adventure World...</h2>
        </motion.div>
      </div>
    );
  }

  // FORCE PLACEMENT CHECKS GATE
  const completedAssessmentsCount = Object.values(dashboard?.assessment_status || {}).filter(Boolean).length;
  const initialAssessmentsCompleted = completedAssessmentsCount === 3;

  if (!initialAssessmentsCompleted) {
    return (
      <div className={styles.pageLayout}>
        <Sidebar onLogout={handleLogout} />
        <main className={styles.mainContent}>
          <div className={styles.centerContainer} style={{ minHeight: '80vh' }}>
            <div className={styles.emptyPathCard} style={{ maxWidth: '600px', width: '100%' }}>
              <img src={owl} alt="Owl Mascot" className={styles.owlImgLarge} />
              <h2>👋 {t('welcomeToMigo')}</h2>
              <p style={{ fontSize: '17px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                {t('placementIntro')}
              </p>

              <div className={styles.gateAssessmentsList}>
                {/* Reading */}
                <div className={styles.gateAssessmentItem}>
                  <div className={styles.gateIcon}>📖</div>
                  <div className={styles.gateDetails}>
                    <h3>{t('readingAssessment')}</h3>
                    <span>Familiarity with alphabet, words, and pronunciation</span>
                  </div>
                  {dashboard?.assessment_status?.reading ? (
                    <span className={styles.gateDoneBadge}>{t('completedBadge')}</span>
                  ) : (
                    <button className={styles.gatePlayBtn} onClick={() => navigate('/assessment/reading')}>
                      {t('startCheck')}
                    </button>
                  )}
                </div>

                {/* Writing */}
                <div className={styles.gateAssessmentItem}>
                  <div className={styles.gateIcon}>✍️</div>
                  <div className={styles.gateDetails}>
                    <h3>{t('writingAssessment')}</h3>
                    <span>Familiarity with letter tracing and spellings</span>
                  </div>
                  {dashboard?.assessment_status?.writing ? (
                    <span className={styles.gateDoneBadge}>{t('completedBadge')}</span>
                  ) : (
                    <button className={styles.gatePlayBtn} onClick={() => navigate('/assessment/writing')}>
                      {t('startCheck')}
                    </button>
                  )}
                </div>

                {/* Comprehension */}
                <div className={styles.gateAssessmentItem}>
                  <div className={styles.gateIcon}>🧠</div>
                  <div className={styles.gateDetails}>
                    <h3>{t('comprehensionAssessment')}</h3>
                    <span>Understanding short stories and picture clues</span>
                  </div>
                  {dashboard?.assessment_status?.comprehension ? (
                    <span className={styles.gateDoneBadge}>{t('completedBadge')}</span>
                  ) : (
                    <button className={styles.gatePlayBtn} onClick={() => navigate('/assessment/comprehension')}>
                      {t('startCheck')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (path.length === 0) {
    return (
      <div className={styles.centerContainer}>
        <div className={styles.emptyPathCard}>
          <img src={owl} alt="Owl Mascot" className={styles.owlImgLarge} />
          <h2>Ready for your personalized adventure?</h2>
          <p>Let's create your lesson-by-lesson learning road now!</p>
          <button
            className={styles.primaryActionBtn}
            disabled={generating}
            onClick={handleGeneratePath}
          >
            {generating ? 'Creating Path...' : '🌟 Start My Learning Journey'}
          </button>
        </div>
      </div>
    );
  }

  const completedCount = path.filter((item) => item.status === 'completed').length;
  const allCompleted = path.length > 0 && path.every((item) => item.status === 'completed');
  const currentEntry = path.find((item) => item.status === 'available') || path[path.length - 1];
  const nextLesson = currentEntry?.lesson_detail;

  return (
    <div className={styles.pageLayout}>
      <Sidebar onLogout={handleLogout} />

      <main className={styles.mainContent}>
        <Header learner={learner} rewards={rewards} dashboard={dashboard} />

        {/* HERO SECTION: Focused on "What should the learner do next?" */}
        <section className={styles.heroSection}>
          <div className={styles.heroLeft}>
            <div className={styles.greetingBadge}>
              <Sparkles size={18} color="#FF9F43" />
              <span>Today's Main Quest</span>
            </div>

            <h1 className={styles.heroGreeting}>
              Hi, {learner?.name}! Ready for your next lesson? 🌟
            </h1>

            {allCompleted ? (
              <div className={styles.currentLessonBadge}>
                <span className={styles.dayTag}>Stage Complete</span>
                <span className={styles.lessonTitle}>You solved all current quests! 🏆</span>
              </div>
            ) : nextLesson && (
              <div className={styles.currentLessonBadge}>
                <span className={styles.dayTag}>Lesson {currentEntry?.day_number}</span>
                <span className={styles.lessonTitle}>{nextLesson.title}</span>
              </div>
            )}

            <div className={styles.objectiveCard}>
              <Target size={22} color="#1DD1A1" />
              <div>
                <h4>Lesson Goal</h4>
                <p>{allCompleted ? 'Unlock the next 10 custom lessons!' : 'Complete this lesson & earn 3 Stars + 10 XP!'}</p>
              </div>
            </div>

            {/* Prominent Continue Learning / Unlock Button */}
            {allCompleted ? (
              <motion.button
                className={styles.continueBtn}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleGeneratePath}
                disabled={generating}
              >
                <Sparkles size={28} fill="#FFFFFF" color="#FFFFFF" />
                <span>{generating ? 'GENERATING...' : 'UNLOCK NEXT LEVEL 🚀'}</span>
              </motion.button>
            ) : (
              <motion.button
                className={styles.continueBtn}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() =>
                  navigate('/lesson-player', {
                    state: { entry: currentEntry, path: path },
                  })
                }
              >
                <Play size={28} fill="#FFFFFF" color="#FFFFFF" />
                <span>CONTINUE LEARNING</span>
              </motion.button>
            )}
          </div>

          <div className={styles.heroRight}>
            <div className={styles.mascotSpeechBubble} onClick={handleMascotSpeak}>
              <span>"Tap me or click Continue to start!"</span>
              <Volume2 size={18} color="#FF7A00" />
            </div>

            <motion.img
              src={owl}
              alt="MiGo Mascot Owl"
              className={styles.mascotHeroImg}
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              onClick={handleMascotSpeak}
            />
          </div>
        </section>

        {/* MAIN FEATURE: The Winding Adventure Learning Path */}
        <section className={styles.pathSection}>
          <HeroMap
            learningPath={path}
            currentLesson={currentEntry}
            completedCount={completedCount}
            onLessonClick={(entryNode) =>
              navigate('/lesson-player', {
                state: { entry: entryNode, path: path },
              })
            }
          />
        </section>
      </main>

      <VoiceAssistant onClick={handleMascotSpeak} />
    </div>
  );
}

export default Home;