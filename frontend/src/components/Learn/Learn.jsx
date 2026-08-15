// src/components/Learn/Learn.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, ChevronRight, Lock, Play, ArrowLeft,
  CheckCircle2, Clock, Flame, Star, Award, Compass, RefreshCw
} from 'lucide-react';
import { useLearner } from '../../services/LearnerContext';
import { fetchLessonsByLevel, fetchDashboardSummary, fetchLearningPath } from '../../services/api';
import Sidebar from '../Home/Sidebar';
import styles from './Learn.module.css';

const LEVEL_CONFIGS = {
  beginner: {
    title: 'Beginner Level',
    sub: 'Build your basics',
    color: '#E8FAEF',
    accent: '#1DD1A1',
    btnClass: styles.btnGreen,
    checklist: ['Letters & Sounds', 'Simple Words', 'Basic Sentences', 'Everyday Vocabulary']
  },
  intermediate: {
    title: 'Intermediate Level',
    sub: 'Build confidence',
    color: '#FFF8F0',
    accent: '#FF9F43',
    btnClass: styles.btnOrange,
    checklist: ['Grammar Basics', 'Sentence Building', 'Short Conversations', 'Paragraph Writing']
  },
  advanced: {
    title: 'Advanced Level',
    sub: 'Challenge yourself',
    color: '#F4F0FF',
    accent: '#9C88FF',
    btnClass: styles.btnPurple,
    checklist: ['Complex Grammar', 'Advanced Writing', 'Fluent Conversations', 'Critical Thinking']
  }
};

export default function Learn() {
  const { learner, hasFeatureAccess, triggerUpgradeModal } = useLearner();
  const navigate = useNavigate();

  const [activeLevelDetails, setActiveLevelDetails] = useState(null); // 'beginner', 'intermediate', 'advanced'
  const [levelLessons, setLevelLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [stats, setStats] = useState(null);
  const [learningPath, setLearningPath] = useState([]);

  useEffect(() => {
    if (!learner) return;
    
    // Load dashboard stats
    fetchDashboardSummary(learner.learner_id)
      .then(res => setStats(res.data))
      .catch(err => console.error('Failed to load stats:', err));

    // Load active level learning path
    fetchLearningPath(learner.learner_id)
      .then(res => setLearningPath(res.data || []))
      .catch(err => console.error('Failed to load learning path:', err));
  }, [learner]);

  const handleLevelAccess = (levelKey) => {
    const isLocked = getIsLevelLocked(levelKey);
    if (isLocked) return;

    setActiveLevelDetails(levelKey);
    setLoadingLessons(true);
    fetchLessonsByLevel(learner.learner_id, levelKey)
      .then((res) => {
        setLevelLessons(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load lessons:', err);
        setLevelLessons([]);
      })
      .finally(() => {
        setLoadingLessons(false);
      });
  };

  const getIsLevelLocked = (levelKey) => {
    if (!learner || !stats) return false;
    const hierarchy = { beginner: 1, intermediate: 2, advanced: 3 };
    const userLevelVal = hierarchy[stats.level?.toLowerCase() || 'beginner'];
    const reqLevelVal = hierarchy[levelKey];
    return userLevelVal < reqLevelVal;
  };

  const handlePlayLesson = (lessonEntry, lessonPath) => {
    if (!lessonEntry) return;
    const dayNum = lessonEntry.day_number || 1;
    if (!hasFeatureAccess('Pro') && dayNum > 3) {
      triggerUpgradeModal('Pro', `Lessons Day ${dayNum} and beyond`, () => {
        navigate('/lesson-player', { state: { entry: lessonEntry, path: lessonPath } });
      });
      return;
    }
    navigate('/lesson-player', { state: { entry: lessonEntry, path: lessonPath } });
  };

  const playLesson = (lesson) => {
    if (lesson.status === 'locked') return;
    handlePlayLesson(lesson, levelLessons);
  };

  const startSmartReview = () => {
    if (levelLessons.length > 0) {
      const activeOrCompleted = levelLessons.find(l => l.status !== 'locked') || levelLessons[0];
      handlePlayLesson(activeOrCompleted, levelLessons);
    } else if (learningPath.length > 0) {
      const activeOrCompleted = learningPath.find(l => l.status !== 'locked') || learningPath[0];
      handlePlayLesson(activeOrCompleted, learningPath);
    } else {
      navigate('/lesson-player', { state: { dayNumber: 1 } });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('migo_learner');
    navigate('/');
    window.location.reload();
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

  const userLevel = stats?.level || learner.level || 'beginner';
  const recentLessonsToShow = learningPath.slice(0, 4);

  return (
    <div className={styles.pageLayout}>
      <Sidebar onLogout={handleLogout} />

      <main className={styles.mainContent}>
        <AnimatePresence mode="wait">
          {!activeLevelDetails ? (
            <motion.div
              key="main-levels"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className={styles.scrollContainer}
            >
              {/* TOP HEADER STATUS */}
              <header className={styles.header}>
                <div className={styles.welcomeBlock}>
                  <h1>Welcome back, {learner.name}! 👋</h1>
                  <p>You are learning at <strong className={styles.lvlHighlight}>{userLevel.toUpperCase()} LEVEL</strong></p>
                </div>

                <div className={styles.headerStats}>
                  <div className={styles.statChip}>
                    <Flame size={18} color="#FF7A00" />
                    <span>{stats?.streak_count || 2} Day Streak</span>
                  </div>
                  <div className={styles.statChip}>
                    <Star size={18} color="#FFCA57" />
                    <span>{stats?.xp_points || 180} XP Points</span>
                  </div>
                </div>
              </header>

              {/* REVIEW BANNER */}
              <div className={styles.reviewBanner}>
                <div className={styles.bannerInfo}>
                  <div className={styles.lightbulbCircle}>💡</div>
                  <div>
                    <h3>You can review and practice anytime!</h3>
                    <p>Revisit Beginner and Intermediate lessons to build a stronger foundation.</p>
                  </div>
                </div>
                <button className={styles.recommendBtn} onClick={() => navigate('/roadmap')}>
                  <Compass size={18} />
                  <span>Go to My Recommendations</span>
                </button>
              </div>

              {/* CHOOSE LEARNING LEVEL SECTION */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Choose your learning level</h2>
                <div className={styles.levelCardsGrid}>
                  {Object.entries(LEVEL_CONFIGS).map(([key, config]) => {
                    const isLocked = getIsLevelLocked(key);
                    const isCurrent = userLevel.toLowerCase() === key;

                    return (
                      <div 
                        key={key} 
                        className={`${styles.levelCard} ${isLocked ? styles.cardLocked : ''}`}
                        style={{ borderTopColor: config.accent }}
                      >
                        <div className={styles.cardTop}>
                          <span className={styles.levelPlantIcon} style={{ color: config.accent }}>
                            {key === 'beginner' ? '🌱' : key === 'intermediate' ? '🌿' : '👑'}
                          </span>
                          {isCurrent && <span className={styles.userLvlBadge}>Your Level</span>}
                        </div>

                        <h3>{config.title}</h3>
                        <p className={styles.levelSub}>{config.sub}</p>

                        <ul className={styles.checklist}>
                          {config.checklist.map((item, idx) => (
                            <li key={idx}>
                              <CheckCircle2 size={16} color={isLocked ? '#BDC3C7' : config.accent} />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          className={`${styles.accessBtn} ${config.btnClass}`}
                          disabled={isLocked}
                          onClick={() => handleLevelAccess(key)}
                          type="button"
                        >
                          {isLocked ? (
                            <>
                              <Lock size={16} />
                              <span>Locked</span>
                            </>
                          ) : (
                            <>
                              <span>Access Lessons</span>
                              <ChevronRight size={16} />
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* PICK UP WHERE YOU LEFT OFF (Dynamic learning path progress cards) */}
              <section className={styles.section}>
                <div className={styles.sectionHeaderRow}>
                  <h2 className={styles.sectionTitle}>Pick up where you left off</h2>
                  <button className={styles.viewAllBtn} onClick={() => navigate('/roadmap')}>
                    View All Lessons →
                  </button>
                </div>

                {recentLessonsToShow.length === 0 ? (
                  <div className={styles.noLessonsBox}>
                    <p>Complete your Placement Assessment to load active lessons!</p>
                  </div>
                ) : (
                  <div className={styles.recentLessonsGrid}>
                    {recentLessonsToShow.map((entryItem) => {
                      const isLocked = entryItem.status === 'locked';
                      const lessonDetail = entryItem.lesson_detail;
                      if (!lessonDetail) return null;

                      return (
                        <div 
                          key={entryItem.id} 
                          className={`${styles.recentCard} ${isLocked ? styles.cardLocked : ''}`}
                        >
                          <div className={styles.recentTop}>
                            <span className={styles.tag} style={{ backgroundColor: '#FFF8F0', color: 'var(--color-orange-dark)' }}>
                              {lessonDetail.difficulty?.toUpperCase()}
                            </span>
                            {isLocked && <Lock size={14} color="#7F8C8D" />}
                          </div>

                          <h4>{lessonDetail.title}</h4>
                          <p>{lessonDetail.module}</p>

                          {!isLocked && (
                            <div className={styles.progressBox}>
                              <span>{entryItem.status === 'completed' ? '100% Complete' : 'Active Practice'}</span>
                              <div className={styles.progBarContainer}>
                                <div 
                                  className={styles.progBarFill} 
                                  style={{ 
                                    width: entryItem.status === 'completed' ? '100%' : '50%', 
                                    backgroundColor: 'var(--color-orange)' 
                                  }} 
                                />
                              </div>
                            </div>
                          )}

                          <button 
                            className={styles.continueBtn}
                            style={{ 
                              backgroundColor: isLocked ? '#E2E8F0' : 'rgba(255, 122, 0, 0.1)', 
                              color: isLocked ? '#7F8C8D' : 'var(--color-orange-dark)' 
                            }}
                            disabled={isLocked}
                            onClick={() => handlePlayLesson(entryItem, learningPath)}
                            type="button"
                          >
                            {isLocked ? 'Locked' : entryItem.status === 'completed' ? 'Review' : 'Continue'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* BOTTOM SMART REVIEW FOOTER */}
              <footer className={styles.smartReviewFooter}>
                <div className={styles.footerInfo}>
                  <span className={styles.owlIcon}>🦉</span>
                  <div>
                    <h4>Struggling with a topic?</h4>
                    <p>No worries! Review Beginner or Intermediate lessons to strengthen your skills.</p>
                  </div>
                </div>

                <button className={styles.smartReviewBtn} onClick={startSmartReview} type="button">
                  <Award size={18} />
                  <span>Smart Review</span>
                </button>
              </footer>
            </motion.div>
          ) : (
            <motion.div
              key="level-lessons"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={styles.lessonsViewContainer}
            >
              {/* Back to Levels chooser */}
              <header className={styles.lessonsHeader}>
                <button className={styles.backBtn} onClick={() => setActiveLevelDetails(null)} type="button">
                  <ArrowLeft size={18} />
                  <span>Back to Levels</span>
                </button>
                <div className={styles.lessonsTitleGroup}>
                  <h2>{LEVEL_CONFIGS[activeLevelDetails].title} Practice List</h2>
                  <p>{LEVEL_CONFIGS[activeLevelDetails].sub}</p>
                </div>
              </header>

              {loadingLessons ? (
                <div className={styles.loadingBox}>
                  <RefreshCw className={styles.spin} />
                  <p>Assembling review repository...</p>
                </div>
              ) : levelLessons.length === 0 ? (
                <div className={styles.loadingBox}>
                  <BookOpen size={44} color="#BDC3C7" />
                  <p>No lessons seeded for this level path yet.</p>
                </div>
              ) : (
                <div className={styles.lessonsGrid}>
                  {levelLessons.map((lesson) => {
                    const isLocked = lesson.status === 'locked';
                    const detail = lesson.lesson_detail;
                    if (!detail) return null;

                    return (
                      <div 
                        key={lesson.id} 
                        className={`${styles.lessonItemCard} ${isLocked ? styles.itemCardLocked : ''}`}
                        onClick={() => !isLocked && playLesson(lesson)}
                      >
                        <div className={styles.itemEmojiBox}>
                          {isLocked ? <Lock size={20} color="#95A5A6" /> : (detail.image_emoji || '📖')}
                        </div>

                        <div className={styles.itemMain}>
                          <span className={styles.itemBadge}>{detail.skill?.replace('_', ' ').toUpperCase()}</span>
                          <h4>{detail.title}</h4>
                          <span className={styles.itemSub}>Module: {detail.module} | Estimated: {detail.estimated_time}m</span>
                        </div>

                        <div className={styles.itemAction}>
                          {isLocked ? (
                            <span className={styles.lockedText}>Locked</span>
                          ) : (
                            <button className={styles.itemPlayBtn} type="button">
                              <Play size={14} fill="#FFFFFF" />
                              <span>Play</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
