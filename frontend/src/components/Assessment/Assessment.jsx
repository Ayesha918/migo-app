// src/components/Assessment/Assessment.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLearner } from '../../services/LearnerContext';
import { fetchDashboardSummary } from '../../services/api';
import ReadingAssessment from './ReadingAssessment';
import WritingAssessment from './WritingAssessment';
import ComprehensionAssessment from './ComprehensionAssessment';
import styles from './Assessment.module.css';

function Assessment() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { learner } = useLearner();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (learner) {
      fetchDashboardSummary(learner.learner_id)
        .then(res => setSummary(res.data))
        .catch(err => console.error('Failed to load summary inside Assessment:', err));
    }
  }, [learner]);

  if (!learner) {
    return (
      <div className={styles.page}>
        <p>Please log in first.</p>
        <button className={styles.nextButton} onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  const validTypes = ['reading', 'writing', 'comprehension'];
  if (!validTypes.includes(type)) {
    return (
      <div className={styles.page}>
        <p>Unknown assessment type.</p>
        <button className={styles.nextButton} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const commonProps = { learner };

  // Fetch score percentages
  const readingPct = summary?.reading_score !== undefined ? `${summary.reading_score}%` : '0%';
  const writingPct = summary?.writing_score !== undefined ? `${summary.writing_score}%` : '0%';
  const comprehensionPct = summary?.comprehension_score !== undefined ? `${summary.comprehension_score}%` : '0%';

  return (
    <div className={styles.page}>
      
      {/* Assessments Navigation Top bar */}
      <div style={{ width: '100%', maxWidth: '540px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Back and Title Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className={styles.backButton} 
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            type="button"
          >
            ←
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)', margin: 0 }}>
            🦉 Assessment Center
          </h1>
        </div>

        {/* Tab Row showing scores of Reading, Writing, Comprehension */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: '#FFFFFF', padding: '6px', borderRadius: '16px', border: '2.5px solid var(--color-peach)' }}>
          {[
            { id: 'reading', label: 'Reading', score: readingPct, emoji: '📖' },
            { id: 'writing', label: 'Writing', score: writingPct, emoji: '✍️' },
            { id: 'comprehension', label: 'Comprehension', score: comprehensionPct, emoji: '🧠' }
          ].map((tab) => {
            const isActive = type === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(`/assessment/${tab.id}`)}
                style={{
                  padding: '12px 8px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, var(--color-orange), #FF8A00)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-dark)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
                type="button"
              >
                <span style={{ fontSize: '18px' }}>{tab.emoji}</span>
                <span style={{ fontSize: '11px', fontWeight: 900 }}>{tab.label}</span>
                <span style={{ fontSize: '12px', fontWeight: 950, opacity: isActive ? 1 : 0.75 }}>
                  {tab.score}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {type === 'reading' && <ReadingAssessment {...commonProps} />}
      {type === 'writing' && <WritingAssessment {...commonProps} />}
      {type === 'comprehension' && <ComprehensionAssessment {...commonProps} />}
    </div>
  );
}

export default Assessment;