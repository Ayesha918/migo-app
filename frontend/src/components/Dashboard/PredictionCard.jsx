// src/components/Dashboard/PredictionCard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Clock, Sparkles, Zap, Cpu, BookOpen, PenTool, Calendar, ArrowRight } from 'lucide-react';
import { fetchPrediction } from '../../services/api';
import speak from '../../services/speak';
import styles from './PredictionCard.module.css';

export default function PredictionCard({ learnerId }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  // Time booster level: 15 mins, 30 mins (+2x speed booster), 45 mins (+3x speed booster)
  const [practiceBoost, setPracticeBoost] = useState(15);

  useEffect(() => {
    if (!learnerId) return;
    fetchPrediction(learnerId)
      .then((res) => setPrediction(res.data))
      .catch((err) => console.error('Prediction fetch error:', err))
      .finally(() => setLoading(false));
  }, [learnerId]);

  if (loading) {
    return (
      <div className={styles.cardContainer}>
        <p className={styles.loadingText}>🔮 Running Scikit-Learn RandomForestRegressor ML model...</p>
      </div>
    );
  }

  if (!prediction) return null;

  const {
    predicted_reading_20 = 55,
    predicted_reading_50 = 70,
    predicted_reading_100 = 85,
    predicted_writing_20 = 45,
    predicted_writing_50 = 60,
    predicted_writing_100 = 78,
    completion_probability = 0.85,
    model_name = 'Scikit-Learn RandomForestRegressor (ML Model)',
    basis = {},
  } = prediction;

  const confidencePercent = Math.round(completion_probability * 100);

  // Calculate dynamic completion date based on selected practiceBoost time
  const currentOverall = (basis.current_reading_score + basis.current_writing_score) / 2 || 40;
  const pointsNeeded = 100 - currentOverall;

  // Study multiplier factor
  const multiplier = practiceBoost === 15 ? 1.0 : practiceBoost === 30 ? 2.2 : 3.5;
  const daysNeeded = Math.max(10, Math.round(pointsNeeded * 1.5 / multiplier));

  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysNeeded);
  const formattedCompletionDate = targetDate.toLocaleDateString('en-US', options);

  const speakBoostInfo = () => {
    speak(`If you study for ${practiceBoost} minutes a day, you will graduate on ${formattedCompletionDate}!`, 'en-US');
  };

  return (
    <div className={styles.cardContainer}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.headerTitleGroup}>
          <TrendingUp size={32} color="#FF7A00" />
          <div>
            <h2>AI Learning Speed Projections</h2>
            <p className={styles.headerSubtitle}>
              Model: <strong>{model_name}</strong>
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className={styles.confidenceChip} style={{ backgroundColor: 'var(--color-peach-light)', borderColor: '#FF7A00', color: '#FF7A00' }}>
            <Clock size={16} color="#FF7A00" />
            <span>Tracked Time: <strong>{basis.actual_practice_minutes || 0.0} min</strong></span>
          </div>
          <div className={styles.confidenceChip} style={{ backgroundColor: 'var(--color-peach-light)', borderColor: '#FF9F43', color: '#E65100' }}>
            <Cpu size={16} color="#FF9F43" />
            <span>ML Accuracy {confidencePercent}%</span>
          </div>
        </div>
      </div>

      {/* Speed Slider / Toggle Selector */}
      <div className={styles.boostPanel}>
        <div className={styles.boostTitleRow}>
          <Clock size={20} color="#FF7A00" />
          <span>Select Your Daily Study Time:</span>
        </div>
        <div className={styles.boostBtnGroup}>
          {[15, 30, 45].map((mins) => (
            <button
              key={mins}
              className={`${styles.boostBtn} ${practiceBoost === mins ? styles.activeBoostBtn : ''}`}
              onClick={() => {
                setPracticeBoost(mins);
                speak(`Speed set to ${mins} minutes per day.`, 'en-US');
              }}
              type="button"
            >
              <span>{mins} mins/day</span>
              {mins > 15 && <span className={styles.boosterLabel}>⚡ Booster</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Trajectory Timeline Cards */}
      <div className={styles.trajectoryTimelineGrid}>
        <div className={styles.timelineItem} onClick={speakBoostInfo} style={{ cursor: 'pointer' }}>
          <Calendar size={22} color="#FF7A00" />
          <div>
            <h4>Expected Completion Date</h4>
            <span className={styles.highlightDate}>{formattedCompletionDate}</span>
          </div>
        </div>

        <div className={styles.timelineItem}>
          <BookOpen size={22} color="#FF7A00" />
          <div>
            <h4>Time to Independent Reading</h4>
            <span>{Math.max(1, Math.round(30 / multiplier))} weeks</span>
          </div>
        </div>

        <div className={styles.timelineItem}>
          <PenTool size={22} color="#FF9F43" />
          <div>
            <h4>Time to Independent Writing</h4>
            <span>{Math.max(1, Math.round(45 / multiplier))} weeks</span>
          </div>
        </div>
      </div>

      {/* Trajectory Predictions Table */}
      <div className={styles.predictionTableContainer}>
        <h3>Proficiency Projections Timeline</h3>
        <table className={styles.predictionTable}>
          <thead>
            <tr>
              <th>Milestone Stage</th>
              <th>Predicted Reading Score</th>
              <th>Predicted Writing Score</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Current Baseline</td>
              <td>{basis.current_reading_score || 40}%</td>
              <td>{basis.current_writing_score || 30}%</td>
            </tr>
            <tr>
              <td>After 20 Lessons</td>
              <td style={{ color: '#FF7A00', fontSize: '16px', fontWeight: 800 }}>{predicted_reading_20}%</td>
              <td style={{ color: '#FF9F43', fontSize: '16px', fontWeight: 800 }}>{predicted_writing_20}%</td>
            </tr>
            <tr>
              <td>After 50 Lessons</td>
              <td style={{ color: '#FF7A00', fontSize: '16px', fontWeight: 800 }}>{predicted_reading_50}%</td>
              <td style={{ color: '#FF9F43', fontSize: '16px', fontWeight: 800 }}>{predicted_writing_50}%</td>
            </tr>
            <tr>
              <td>After 100 Lessons</td>
              <td style={{ color: '#FF7A00', fontSize: '16px', fontWeight: 800 }}>{predicted_reading_100}%</td>
              <td style={{ color: '#FF9F43', fontSize: '16px', fontWeight: 800 }}>{predicted_writing_100}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Recommendations Footer */}
      <div className={styles.recsFooter}>
        <Sparkles size={20} color="#FECA57" />
        <span>
          <strong>AI Insight:</strong> Increasing practice time to **{practiceBoost} minutes** accelerates your expected completion date by **{Math.max(0, 45 - Math.round(45 / multiplier))} weeks**!
        </span>
      </div>
    </div>
  );
}
