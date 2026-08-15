// src/components/Roadmap/Roadmap.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Compass, Award, CheckCircle2, Star, ArrowLeft, Sparkles, BookOpen, Lock, Check } from 'lucide-react';
import { useLearner } from '../../services/LearnerContext';
import { fetchUserAnalytics } from '../../services/api';
import PredictionCard from '../Dashboard/PredictionCard';
import Sidebar from '../Home/Sidebar';
import Header from '../Home/Header';
import owl from '../../assets/images/owl.png';
import styles from './Roadmap.module.css';

const ROADMAP_STAGES = [
  {
    level: 'beginner',
    title: 'Beginner Level 🌱',
    subtitle: 'Foundation & Letter Sounds',
    color: '#FFF4E5',
    borderColor: '#FF7A00',
    icon: '🔤',
    modules: ['Alphabet Basics', 'Letter Sounds', 'Simple Words', 'Picture Words', 'Short Sentences'],
  },
  {
    level: 'intermediate',
    title: 'Intermediate Level 🌿',
    subtitle: 'Vocabulary & Paragraph Reading',
    color: '#E8FAEF',
    borderColor: '#1DD1A1',
    icon: '📖',
    modules: ['Grammar Basics', 'Vocabulary Building', 'Sentence Construction', 'Paragraph Reading', 'Everyday Conversation'],
  },
  {
    level: 'advanced',
    title: 'Advanced Level 🌳',
    subtitle: 'Fluency & Critical Thinking',
    color: '#F4F0FF',
    borderColor: '#9C88FF',
    icon: '🎓',
    modules: ['Advanced Grammar', 'Rich Vocabulary', 'Essay Writing', 'Long-Form Comprehension', 'Critical Thinking'],
  },
];

export default function Roadmap() {
  const navigate = useNavigate();
  const { learner, logout, hasFeatureAccess, triggerUpgradeModal } = useLearner();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (learner) {
      setLoading(true);
      fetchUserAnalytics(learner.learner_id)
        .then((res) => {
          setAnalytics(res.data);
        })
        .catch((err) => console.error('Failed to load user analytics in roadmap:', err))
        .finally(() => setLoading(false));
    }
  }, [learner]);

  if (!learner) {
    return (
      <div className={styles.center}>
        <p>Please log in first.</p>
        <button className={styles.primaryBtn} onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={styles.pageLayout}>
      <Sidebar onLogout={handleLogout} />

      <main className={styles.mainContent}>
        <Header learner={learner} />

        {/* Roadmap Top Header */}
        <section className={styles.roadmapHeader}>
          <div className={styles.titleGroup}>
            <Compass size={32} color="#FF7A00" />
            <div>
              <h1>Curriculum Roadmap & Growth Trajectory</h1>
              <p>Explore your complete learning pathway from Beginner to Advanced mastery!</p>
            </div>
          </div>

          <button className={styles.backMapBtn} onClick={() => navigate('/home')}>
            <ArrowLeft size={20} />
            <span>Adventure Map</span>
          </button>
        </section>

        {/* Learner Proficiency Trajectory Card */}
        <PredictionCard learnerId={learner.learner_id} />

        {/* Curriculum Stages Breakdown */}
        <section className={styles.stagesSection}>
          <div className={styles.sectionTitleRow}>
            <Sparkles size={24} color="#FF7A00" />
            <h2>Curriculum Mastery Stages</h2>
          </div>

          {loading ? (
            <div className={styles.center} style={{ minHeight: '200px' }}>
              <p>🔮 Syncing curriculum stages...</p>
            </div>
          ) : (
            <div className={styles.stagesGrid}>
              {ROADMAP_STAGES.map((stage, idx) => {
                const currentLevel = (learner.level || 'beginner').toLowerCase();
                const completedLessons = analytics?.lessons_completed || 0;
                
                // Calculate stage-specific details
                let stageTotal = 30;
                let stageCompleted = 0;
                let stageStatus = 'locked'; // 'locked', 'current', 'completed'

                if (stage.level === 'beginner') {
                  stageTotal = 30;
                  stageCompleted = Math.min(completedLessons, 30);
                  if (currentLevel === 'beginner') {
                    stageStatus = 'current';
                  } else {
                    stageStatus = 'completed';
                  }
                } else if (stage.level === 'intermediate') {
                  stageTotal = 20;
                  stageCompleted = completedLessons > 30 ? Math.min(completedLessons - 30, 20) : 0;
                  if (currentLevel === 'intermediate') {
                    stageStatus = 'current';
                  } else if (currentLevel === 'advanced') {
                    stageStatus = 'completed';
                  } else {
                    stageStatus = 'locked';
                  }
                } else if (stage.level === 'advanced') {
                  stageTotal = 20;
                  stageCompleted = completedLessons > 50 ? Math.min(completedLessons - 50, 20) : 0;
                  if (currentLevel === 'advanced') {
                    if (completedLessons >= 70) {
                      stageStatus = 'completed';
                    } else {
                      stageStatus = 'current';
                    }
                  } else {
                    stageStatus = 'locked';
                  }
                }

                let subLocked = false;
                let requiredTierForStage = 'Free';
                if (stage.level === 'intermediate') {
                  requiredTierForStage = 'Pro';
                  subLocked = !hasFeatureAccess('Pro');
                } else if (stage.level === 'advanced') {
                  requiredTierForStage = 'Premium';
                  subLocked = !hasFeatureAccess('Premium');
                }

                const progressPct = Math.round((stageCompleted / stageTotal) * 100);
                const isCurrent = stageStatus === 'current';
                const isCompleted = stageStatus === 'completed';
                const isLocked = stageStatus === 'locked' || subLocked;

                return (
                  <motion.div
                    key={stage.level}
                    className={`${styles.stageCard} ${isCurrent ? styles.currentStageCard : ''}`}
                    style={{
                      backgroundColor: isLocked ? '#F8F9FA' : stage.color,
                      borderColor: isCurrent ? 'var(--color-orange)' : (isCompleted ? '#4CAF50' : 'var(--color-peach-light)'),
                      opacity: isLocked ? 0.75 : 1,
                      position: 'relative'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}
                  >
                    {/* Status Badge overlay */}
                    <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                      {isCurrent && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 900, backgroundColor: '#FFF3E0', color: '#E65100', padding: '4px 8px', borderRadius: '12px', border: '1px solid #FFE0B2' }}>
                          <Star size={10} fill="#FF9800" stroke="#FF9800" /> Active Level
                        </span>
                      )}
                      {isCompleted && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 900, backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '4px 8px', borderRadius: '12px', border: '1px solid #C8E6C9' }}>
                          <Check size={10} strokeWidth={3} /> Graduated
                        </span>
                      )}
                      {isLocked && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 900, backgroundColor: subLocked ? '#FFEBEB' : '#ECEFF1', color: subLocked ? '#C0392B' : '#455A64', padding: '4px 8px', borderRadius: '12px', border: subLocked ? '1px solid #FADBD8' : '1px solid #CFD8DC' }}>
                          <Lock size={10} /> {subLocked ? 'Plan Locked' : 'Locked'}
                        </span>
                      )}
                    </div>

                    <div className={styles.stageHeader}>
                      <span className={styles.stageIcon}>{stage.icon}</span>
                      <div>
                        <h3>{stage.title}</h3>
                        <span className={styles.stageSub}>{stage.subtitle}</span>
                      </div>
                    </div>

                    {/* Stage Progress Bar */}
                    <div style={{ marginBottom: '20px', width: '100%', background: '#FFFFFF', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--color-peach-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '6px' }}>
                        <span>Stage Progress</span>
                        <span>{stageCompleted} / {stageTotal} Lessons</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: '#E2E8F0', borderRadius: '20px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${progressPct}%`,
                            height: '100%',
                            backgroundColor: isCompleted ? '#4CAF50' : 'var(--color-orange)',
                            borderRadius: '20px',
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>
                    </div>

                    <ul className={styles.moduleList}>
                      {stage.modules.map((mod, i) => (
                        <li key={i} className={styles.moduleItem} style={{ opacity: isLocked ? 0.7 : 1 }}>
                          <CheckCircle2 size={16} color={isCompleted ? '#4CAF50' : (isCurrent ? 'var(--color-orange)' : '#94A3B8')} />
                          <span>{mod}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={styles.stageStartBtn}
                      style={{
                        background: subLocked 
                          ? 'linear-gradient(135deg, var(--color-orange), #FF9F43)'
                          : (isLocked ? '#CBD5E1' : (isCompleted ? '#4CAF50' : 'linear-gradient(135deg, var(--color-orange), #FF9F43)')),
                        cursor: (isLocked && !subLocked) ? 'not-allowed' : 'pointer'
                      }}
                      disabled={isLocked && !subLocked}
                      onClick={() => {
                        if (subLocked) {
                          triggerUpgradeModal(requiredTierForStage, `${stage.title}`);
                        } else {
                          navigate('/home');
                        }
                      }}
                    >
                      <span>
                        {subLocked 
                          ? `Preview ${requiredTierForStage} to Unlock` 
                          : (isCompleted ? 'Review Stage' : isCurrent ? 'Continue Journey' : isLocked ? 'Stage Locked' : 'Start Stage')}
                      </span>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
