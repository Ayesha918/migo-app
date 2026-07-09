// src/components/Dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLearner } from '../../services/LearnerContext';
import useTranslate from '../../services/useTranslate';
import { fetchDashboardSummary } from '../../services/api';
import styles from './Dashboard.module.css';

const AVATAR_EMOJI = {
  boy: '👦', girl: '👧', grandmother: '👵', grandfather: '👴',
  teacher: '🧑‍🏫', book: '📖', lion: '🦁', tiger: '🐯',
  apple: '🍎', flower: '🌸', star: '⭐', migo: '🦊',
};

const ASSESSMENT_CARDS = [
  { type: 'reading', emoji: '📖', labelKey: 'readingAssessment', color: '#ffe0e6' },
  { type: 'writing', emoji: '✍️', labelKey: 'writingAssessment', color: '#e0f0ff' },
  { type: 'comprehension', emoji: '🧠', labelKey: 'comprehensionAssessment', color: '#e6ffe0' },
];

function Dashboard() {
  const { learner } = useLearner();
  const navigate = useNavigate();
  const t = useTranslate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!learner) return;
    fetchDashboardSummary(learner.learner_id)
      .then((res) => setSummary(res.data))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [learner]);

  if (!learner) {
    return (
      <div className={styles.page}>
        <p>Please log in first.</p>
        <button className={styles.primaryButton} onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.avatarBig}>{AVATAR_EMOJI[learner.avatar] || '⭐'}</span>
        <div>
          <h1 className={styles.welcomeText}>{t('welcome')}, {learner.name}!</h1>
          <p className={styles.subText}>{learner.learner_id}</p>
        </div>
      </div>

      <div className={styles.cardsGrid}>
        {ASSESSMENT_CARDS.map((card, i) => (
          <motion.button
            key={card.type}
            type="button"
            className={styles.assessmentCard}
            style={{ backgroundColor: card.color }}
            onClick={() => navigate(`/assessment/${card.type}`)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            whileTap={{ scale: 0.96 }}
          >
            <span className={styles.cardEmoji}>{card.emoji}</span>
            <span className={styles.cardLabel}>{t(card.labelKey)}</span>
          </motion.button>
        ))}
      </div>

      {loading ? (
        <p className={styles.subText}>Loading progress...</p>
      ) : summary ? (
        <div className={styles.progressCard}>
          <div className={styles.progressRow}>
            <span className={styles.progressLabel}>{t('overallLevel')}</span>
            <span className={styles.progressValue}>{t(summary.level)}</span>
          </div>
          <div className={styles.progressRow}>
            <span className={styles.progressLabel}>{t('latestScore')}</span>
            <span className={styles.progressValue}>{summary.overall_score}%</span>
          </div>
          <div className={styles.progressRow}>
            <span className={styles.progressLabel}>{t('completion')}</span>
            <span className={styles.progressValue}>{summary.completion_percent}%</span>
          </div>

          <h3 className={styles.recentTitle}>{t('recentActivity')}</h3>
          {summary.recent_activity.length === 0 ? (
            <p className={styles.subText}>{t('noActivityYet')}</p>
          ) : (
            <ul className={styles.activityList}>
              {summary.recent_activity.map((item, idx) => (
                <li key={idx} className={styles.activityItem}>
                  <span>{t(item.assessment_type + 'Assessment') || item.assessment_type}</span>
                  <span className={styles.activityScore}>{item.score}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className={styles.subText}>Could not load progress.</p>
      )}
    </div>
  );
}

export default Dashboard;