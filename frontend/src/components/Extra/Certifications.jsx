import { useState, useEffect } from 'react';
import { useLearner } from '../../services/LearnerContext';
import { fetchUserAnalytics } from '../../services/api';
import Sidebar from '../Home/Sidebar';
import Header from '../Home/Header';
import { Lock, Award, Sparkles, CheckCircle2, Star, Flame, Trophy } from 'lucide-react';
import styles from './Extra.module.css';

const MOCK_CERTIFICATES = [
  { 
    id: 1, 
    title: 'Beginner Placement', 
    course: 'Reading, Writing & Comprehension', 
    type: 'Certificate of Placement', 
    icon: '🌱', 
    desc: 'Successfully evaluated and matched to the Beginner level module parameters.', 
    date: 'August 2026',
    requirementText: 'Completed placement check.'
  },
  { 
    id: 2, 
    title: 'Perfect Starter', 
    course: 'Consecutive Study Streak', 
    type: 'Certificate of Diligence', 
    icon: '🔥', 
    desc: 'Awarded for maintaining study engagement and streak continuity benchmarks.', 
    date: 'August 2026',
    requirementText: 'Complete at least 3 lessons and 15 minutes of study.'
  }
];

export default function Certifications() {
  const { learner, logout } = useLearner();
  const [activeCert, setActiveCert] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!learner) return;
    setLoading(true);
    fetchUserAnalytics(learner.learner_id)
      .then(res => {
        setAnalytics(res.data || {});
      })
      .catch(err => console.error('Error fetching analytics:', err))
      .finally(() => setLoading(false));
  }, [learner]);

  const lessonsCompleted = analytics?.lessons_completed || 0;
  const totalMins = analytics?.total_study_hours ? Math.round(analytics.total_study_hours * 60) : 0;
  
  const avgAccuracy = analytics?.quiz_accuracy_trend?.length
    ? Math.round(analytics.quiz_accuracy_trend.reduce((sum, item) => sum + item.score, 0) / analytics.quiz_accuracy_trend.length)
    : 0;

  // Evaluate if certificate requirements are met
  const isCertEarned = (certId) => {
    if (certId === 1) return true; // Placement certificate is always earned
    if (certId === 2) {
      return lessonsCompleted >= 3 && totalMins >= 15;
    }
    return false;
  };

  const BADGES = [
    {
      id: 'placement',
      title: 'First Steps',
      desc: 'Completed placement checks and created learning profile.',
      icon: '🌱',
      earned: true,
      progress: '100% Unlocked'
    },
    {
      id: 'focused_learner',
      title: 'Focused Learner',
      desc: 'Study for at least 15 minutes in total lessons.',
      icon: '⚡',
      earned: totalMins >= 15,
      progress: `${totalMins} / 15 min`
    },
    {
      id: 'quiz_master',
      title: 'Accuracy Starter',
      desc: 'Achieve an average of 70% or more on quiz attempts.',
      icon: '🎯',
      earned: avgAccuracy >= 70 && analytics?.quiz_accuracy_trend?.length > 0,
      progress: analytics?.quiz_accuracy_trend?.length > 0 ? `${avgAccuracy}% Avg` : 'No quizzes yet'
    },
    {
      id: 'streak_explorer',
      title: 'Consistent Learner',
      desc: 'Maintain active study consistency of 20% or more.',
      icon: '🔥',
      earned: (analytics?.learning_consistency || 0) >= 20,
      progress: `${analytics?.learning_consistency || 0}% active`
    }
  ];

  return (
    <div className={styles.pageLayout} style={{ position: 'relative' }}>
      <Sidebar onLogout={logout} />
      <main className={styles.mainContent}>
        <Header />

        <div className={styles.headerArea}>
          <span className={styles.headerIcon}>🎓</span>
          <div className={styles.headerMeta}>
            <h2>Achievements & Certifications</h2>
            <p>Track your unlocked milestones and official literacy course credentials</p>
          </div>
        </div>

        {/* SECTION 1: CERTIFICATES */}
        <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-orange-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={20} color="var(--color-orange)" />
          <span>Official Course Certificates</span>
        </h3>

        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', fontWeight: 800, color: 'var(--text-muted)' }}>
            Loading credentials data...
          </div>
        ) : (
          <div className={styles.cardsGrid} style={{ marginBottom: '40px' }}>
            {MOCK_CERTIFICATES.map(cert => {
              const earned = isCertEarned(cert.id);
              return (
                <div 
                  key={cert.id} 
                  className={styles.certificateCard}
                  style={!earned ? { opacity: 0.8, borderColor: '#E2E8F0', backgroundColor: '#FAF9F6' } : {}}
                >
                  {/* Status indicator */}
                  {!earned && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(241, 196, 15, 0.15)',
                      color: '#D4AC0D',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1.5px solid #F1C40F'
                    }}>
                      <Lock size={12} />
                      <span>Locked</span>
                    </div>
                  )}

                  {earned && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(39, 174, 96, 0.15)',
                      color: '#27AE60',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 850,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1.5px solid #27AE60'
                    }}>
                      <CheckCircle2 size={12} />
                      <span>Earned!</span>
                    </div>
                  )}

                  <div 
                    className={styles.certificateStamp}
                    style={!earned ? { backgroundColor: '#E2E8F0', borderColor: '#CBD5E1' } : {}}
                  >
                    {earned ? cert.icon : '🔒'}
                  </div>
                  
                  <h4 className={styles.certificateTitle} style={!earned ? { color: 'var(--text-dark)' } : {}}>
                    {cert.title}
                  </h4>
                  <p className={styles.certificateSub}>{cert.type}</p>
                  
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 600 }}>
                    {cert.desc}
                  </p>

                  {/* Requirements Progress Block */}
                  <div style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '12px',
                    marginBottom: '20px',
                    textAlign: 'left'
                  }}>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-dark)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Requirement:
                    </span>
                    <span style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '8px' }}>
                      {cert.requirementText}
                    </span>

                    {/* Progress bars inside locked cards */}
                    {cert.id === 2 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, color: 'var(--text-dark)' }}>
                            <span>Lessons Completed</span>
                            <span>{lessonsCompleted} / 3</span>
                          </div>
                          <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', marginTop: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, (lessonsCompleted / 3) * 100)}%`, height: '100%', backgroundColor: 'var(--color-orange)' }} />
                          </div>
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, color: 'var(--text-dark)' }}>
                            <span>Study Duration</span>
                            <span>{totalMins} / 15 min</span>
                          </div>
                          <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', marginTop: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, (totalMins / 15) * 100)}%`, height: '100%', backgroundColor: 'var(--color-orange)' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    className={styles.certificateBtn}
                    onClick={() => earned && setActiveCert(cert)}
                    disabled={!earned}
                    style={!earned ? {
                      borderColor: '#CBD5E1',
                      color: '#A0AEC0',
                      cursor: 'not-allowed',
                      backgroundColor: '#F7FAFC'
                    } : {}}
                    type="button"
                  >
                    {earned ? 'View Certificate' : 'Locked'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* SECTION 2: SKILL BADGES */}
        <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-orange-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={20} color="var(--color-orange)" />
          <span>My Earned Skill Badges</span>
        </h3>

        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', fontWeight: 800, color: 'var(--text-muted)' }}>
            Loading badges data...
          </div>
        ) : (
          <div className={styles.cardsGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {BADGES.map(badge => (
              <div 
                key={badge.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: badge.earned ? '3px solid var(--color-peach)' : '2.5px dashed #E2E8F0',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  opacity: badge.earned ? 1 : 0.65,
                  backgroundColor: badge.earned ? '#FFFFFF' : '#FAF9F6',
                  transition: 'transform 0.2s ease',
                  boxShadow: badge.earned ? 'var(--shadow-card)' : 'none'
                }}
              >
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: badge.earned ? 'var(--color-peach-light)' : '#E2E8F0',
                  border: badge.earned ? '2px solid var(--color-orange)' : '2.5px solid #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '12px'
                }}>
                  {badge.earned ? badge.icon : '🔒'}
                </div>

                <h4 style={{ fontSize: '15px', fontWeight: 850, color: badge.earned ? 'var(--color-orange-dark)' : 'var(--text-muted)', marginBottom: '4px' }}>
                  {badge.title}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.4, height: '40px', overflow: 'hidden', marginBottom: '12px' }}>
                  {badge.desc}
                </p>

                <span style={{
                  display: 'inline-block',
                  backgroundColor: badge.earned ? '#EBFDF2' : '#F7FAFC',
                  color: badge.earned ? '#27AE60' : '#A0AEC0',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: badge.earned ? '1px solid #27AE60' : '1px solid #CBD5E1'
                }}>
                  {badge.progress}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Modal Overlay */}
        {activeCert && (
          <div className={styles.certModalOverlay} onClick={() => setActiveCert(null)}>
            <div className={styles.certModalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.certModalClose} onClick={() => setActiveCert(null)} type="button">
                &times;
              </button>
              <div className={styles.certBadge}>{activeCert.icon}</div>
              <h1 className={styles.certMainTitle}>CERTIFICATE OF ACHIEVEMENT</h1>
              <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontWeight: 800 }}>
                This is proudly presented to
              </p>
              <h2 className={styles.certRecipient}>{learner?.name || 'Student Learner'}</h2>
              <div className={styles.certDivider}></div>
              <p className={styles.certDesc}>
                For successfully completing and unlocking the curriculum benchmarks for <strong>{activeCert.title}</strong> under the course track: <strong>{activeCert.course}</strong>.
              </p>
              <div className={styles.certDateRow}>
                <div>
                  <span style={{ display: 'block', borderBottom: '1px solid var(--color-peach)', paddingBottom: '4px', marginBottom: '4px' }}>
                    {activeCert.date}
                  </span>
                  <strong>Date Issued</strong>
                </div>
                <div>
                  <span style={{ display: 'block', borderBottom: '1px solid var(--color-peach)', paddingBottom: '4px', marginBottom: '4px', fontStyle: 'italic', fontFamily: 'serif' }}>
                    MiGo Owl
                  </span>
                  <strong>Authorized Signature</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
