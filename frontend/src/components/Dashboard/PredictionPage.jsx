// src/components/Dashboard/PredictionPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, Clock, Calendar, ShieldCheck, Check, Sparkles, ArrowLeft,
  BookOpen, Zap, Flame, HelpCircle, Info, Lock
} from 'lucide-react';
import { useLearner } from '../../services/LearnerContext';
import { fetchPrediction, fetchUserAnalytics } from '../../services/api';
import Sidebar from '../Home/Sidebar';
import Header from '../Home/Header';
import styles from './PredictionPage.module.css';

export default function PredictionPage() {
  const navigate = useNavigate();
  const { learner, logout, hasFeatureAccess, triggerUpgradeModal } = useLearner();

  const [prediction, setPrediction] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic interactive study duration simulation state
  const [simulationMins, setSimulationMins] = useState(20);
  const [simulatedData, setSimulatedData] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const loadData = () => {
    if (!learner) return;
    setLoading(true);
    Promise.all([
      fetchPrediction(learner.learner_id).catch(() => ({ data: {} })),
      fetchUserAnalytics(learner.learner_id).catch(() => ({ data: {} })),
    ])
      .then(([predRes, analyticRes]) => {
        setPrediction(predRes.data);
        setAnalytics(analyticRes.data);
      })
      .catch((err) => console.error('Error fetching dashboard data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [learner]);

  useEffect(() => {
    if (!learner) return;
    setSimulating(true);
    // Convert minutes to seconds for backend RF model
    fetchPrediction(learner.learner_id, simulationMins * 60)
      .then((res) => {
        setSimulatedData(res.data);
      })
      .catch((err) => console.error('Simulated prediction error:', err))
      .finally(() => setSimulating(false));
  }, [simulationMins, learner]);

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

  const p = prediction || {};
  const a = analytics || {};

  const currentOverallScore = a.overall_score || 50;
  const currentRead = a.reading_score || 40;
  const currentWrite = a.writing_score || 30;

  const predictedScore = p.predicted_reading_score && p.predicted_writing_score
    ? Math.round((p.predicted_reading_score + p.predicted_writing_score) / 2)
    : 68;

  const confidenceScoreVal = p.completion_probability 
    ? Math.round(p.completion_probability * 100) 
    : 75;

  const confidenceLabelText = confidenceScoreVal >= 80 ? 'High' : confidenceScoreVal >= 60 ? 'Medium' : 'Low';

  const avgAccuracy = a.quiz_accuracy_trend?.length
    ? Math.round(a.quiz_accuracy_trend.reduce((sum, item) => sum + item.score, 0) / a.quiz_accuracy_trend.length)
    : 78;

  const totalMins = Math.round((a.total_study_hours || 0) * 60);

  const dashboardData = {
    lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    lastUpdatedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    activeLearningTime: `${totalMins} min`,
    lessonsCompleted: String(a.lessons_completed || 0),
    confidenceScore: `${confidenceScoreVal}%`,
    confidenceLabel: confidenceLabelText,
    currentPredictedScore: `${predictedScore}%`,
    expectedScoreMin: `${predictedScore - 3}%`,
    expectedScoreMax: `${predictedScore + 3}%`,
    questionsAttempted: String(a.quiz_accuracy_trend?.length ? a.quiz_accuracy_trend.length * 5 : 15),
    recentAccuracy: `${avgAccuracy}%`,
    dayStreak: String(learner?.day_streak || 0),
  };

  // Circular confidence ring calculations
  const strokeWidth = 5;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidenceScoreVal / 100) * circumference;

  const isLocked = !hasFeatureAccess('Pro');

  const renderLockOverlay = () => {
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 248, 240, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 10,
        padding: '24px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '4px solid var(--color-peach)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 32px',
          maxWidth: '480px',
          textAlign: 'center',
          boxShadow: '0 20px 45px rgba(0,0,0,0.1), var(--shadow-soft)'
        }}>
          <span style={{
            display: 'inline-block',
            backgroundColor: 'var(--color-peach-light)',
            color: 'var(--color-orange-dark)',
            fontSize: '12px',
            fontWeight: 800,
            padding: '6px 14px',
            borderRadius: '20px',
            textTransform: 'uppercase',
            marginBottom: '16px',
            border: '1px solid var(--color-peach)'
          }}>Pro Feature</span>
          <h2 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '12px', color: 'var(--text-dark)' }}>AI Score Projections</h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>
            Unlock realistic, data-driven forecasts of your learning growth and confidence analytics. Switch to the Pro plan to sync predictions!
          </p>
          <div style={{
            backgroundColor: '#FFF9E6',
            border: '1.5px dashed var(--color-yellow-dark)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 16px',
            marginBottom: '24px',
            fontSize: '13px',
            color: '#7d6500',
            fontWeight: '700'
          }}>
            Demo Mode — Switch instantly to preview.
          </div>
          <button
            onClick={() => triggerUpgradeModal('Pro', 'AI Score Prediction')}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, var(--color-orange), #FF9F43)',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 850,
              padding: '14px 24px',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-button-orange)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Preview Pro Plan ➔
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageLayout} style={{ position: 'relative' }}>
      <Sidebar onLogout={handleLogout} />

      <main 
        className={styles.mainContent} 
        style={isLocked ? { filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none' } : {}}
      >
        <Header learner={learner} />

        {/* Prediction Header */}
        <section className={styles.predictionHeader}>
          <div className={styles.titleGroup}>
            <TrendingUp size={32} color="var(--color-orange)" style={{ flexShrink: 0 }} />
            <div>
              <h1>AI Score Prediction</h1>
              <p>Realistic, data-driven forecast of your literacy learning path</p>
            </div>
          </div>

          <div className={styles.headerBtnRow}>
            <button className={styles.refreshBtn} onClick={loadData}>
              <RefreshCwIcon />
              <span>Sync Projections</span>
            </button>
            <button className={styles.backMapBtn} onClick={() => navigate('/home')}>
              <ArrowLeft size={18} />
              <span>Adventure Map</span>
            </button>
          </div>
        </section>

        {loading ? (
          <div className={styles.skeletonContainer}>
            <p>🔮 Querying Scikit-Learn RandomForestRegressor & syncing latest active logs...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Top 4 Summary Cards */}
            <div className={styles.summaryStatsRow}>
              {/* Card 1: Last Updated */}
              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>
                  <Calendar size={22} color="#FF7A00" />
                </div>
                <div className={styles.summaryText}>
                  <h4>Last Updated</h4>
                  <h3>{dashboardData.lastUpdated}</h3>
                  <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>{dashboardData.lastUpdatedTime}</span>
                </div>
              </div>

              {/* Card 2: Active Learning Time */}
              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>
                  <Clock size={22} color="#10B981" />
                </div>
                <div className={styles.summaryText}>
                  <h4>Active Learning Time</h4>
                  <h3>{dashboardData.activeLearningTime}</h3>
                  <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>Today</span>
                </div>
              </div>

              {/* Card 3: Lessons Completed */}
              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>
                  <BookOpen size={22} color="#8B5CF6" />
                </div>
                <div className={styles.summaryText}>
                  <h4>Lessons Completed</h4>
                  <h3>{dashboardData.lessonsCompleted}</h3>
                  <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>Today</span>
                </div>
              </div>

              {/* Card 4: Prediction Confidence */}
              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>
                  <ShieldCheck size={22} color="#F59E0B" />
                </div>
                <div className={styles.summaryText}>
                  <h4>Prediction Confidence</h4>
                  <h3>{dashboardData.confidenceScore}</h3>
                  <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 800 }}>{dashboardData.confidenceLabel}</span>
                </div>
              </div>
            </div>

            {/* Dashboard Two-Column Grid */}
            <div className={styles.dashboardGrid}>
              
              {/* Left Column - Main Forecast and Timeline */}
              <div className={styles.mainPredictionCard}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.cardIconBox}>
                    <TrendingUp size={24} />
                  </div>
                  <h2>AI Learning Prediction</h2>
                  <span className={styles.updateBadge}>Updated 2 min ago</span>
                </div>
                <p className={styles.cardSubtitle}>
                  Prediction updates every 15 minutes of active learning or when enough new performance data is available.
                </p>

                {/* Score details grid row */}
                <div className={styles.scoreDetailsRow}>
                  <div className={styles.scoreItem}>
                    <span>Current Predicted Score</span>
                    <h2>{dashboardData.currentPredictedScore}</h2>
                  </div>

                  <div className={styles.scoreItem}>
                    <span>Expected Score Range</span>
                    <h3>{dashboardData.expectedScoreMin} – {dashboardData.expectedScoreMax}</h3>
                  </div>

                  <div className={styles.confidenceCircleWrapper}>
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="#FFF4E5"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="#10B981"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 40 40)"
                      />
                      <text
                        x="50%"
                        y="44%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontWeight="900"
                        fontSize="15px"
                        fill="#1E293B"
                      >
                        {dashboardData.confidenceScore}
                      </text>
                      <text
                        x="50%"
                        y="62%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontWeight="800"
                        fontSize="8px"
                        fill="#64748B"
                      >
                        Confidence
                      </text>
                    </svg>
                  </div>
                </div>

                {/* Based on metrics summary */}
                <div className={styles.basedOnSection}>
                  <span className={styles.sectionTitle}>Based on:</span>
                  <div className={styles.basedOnGrid}>
                    {/* Metric 1 */}
                    <div className={styles.metricTile}>
                      <Clock size={16} className={styles.tileIcon} color="#FF7A00" />
                      <span className={styles.tileValue}>{dashboardData.activeLearningTime}</span>
                      <span className={styles.tileLabel}>Focused Learning</span>
                    </div>

                    {/* Metric 2 */}
                    <div className={styles.metricTile}>
                      <HelpCircle size={16} className={styles.tileIcon} color="#3B82F6" />
                      <span className={styles.tileValue}>{dashboardData.questionsAttempted}</span>
                      <span className={styles.tileLabel}>Questions Attempted</span>
                    </div>

                    {/* Metric 3 */}
                    <div className={styles.metricTile}>
                      <TrendingUp size={16} className={styles.tileIcon} color="#10B981" />
                      <span className={styles.tileValue}>{dashboardData.recentAccuracy}</span>
                      <span className={styles.tileLabel}>Recent Accuracy</span>
                    </div>

                    {/* Metric 4 */}
                    <div className={styles.metricTile}>
                      <BookOpen size={16} className={styles.tileIcon} color="#8B5CF6" />
                      <span className={styles.tileValue}>{dashboardData.lessonsCompleted}</span>
                      <span className={styles.tileLabel}>Lessons Completed</span>
                    </div>

                    {/* Metric 5 */}
                    <div className={styles.metricTile}>
                      <Flame size={16} className={styles.tileIcon} color="#EF4444" />
                      <span className={styles.tileValue}>{dashboardData.dayStreak}</span>
                      <span className={styles.tileLabel}>Day Streak</span>
                    </div>
                  </div>
                </div>

                {/* Prediction Timeline */}
                <div className={styles.timelineSection}>
                  <span className={styles.sectionTitle}>Prediction Timeline (Based on Your Actual Learning)</span>
                  
                  <div className={styles.timelineGrid}>
                    <div className={styles.timelineConnectorLine} />
                    <div className={styles.timelineConnectorActive} style={{ width: `${Math.min(100, (totalMins / 60) * 10)}%` }} />

                    {/* Node 1 */}
                    <div className={styles.timelineStepNode}>
                      <div className={`${styles.stepDot} ${styles.stepDotCompleted}`}>
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      </div>
                      <div className={styles.stepCard}>
                        <span className={styles.stepTitle}>Baseline</span>
                        <span className={styles.stepDesc}>Initial Entry</span>
                        <span className={styles.stepDate}>Checked</span>
                        <span className={styles.stepScore}>{Math.round(currentOverallScore)}%</span>
                      </div>
                    </div>

                    {/* Node 2 */}
                    <div className={styles.timelineStepNode}>
                      <div className={`${styles.stepDot} ${totalMins >= 120 ? styles.stepDotCompleted : (totalMins >= 30 && totalMins < 120 ? styles.stepDotActive : '')}`}>
                        {totalMins >= 120 ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: totalMins >= 30 ? '#FFFFFF' : 'transparent' }} />}
                      </div>
                      <div className={`${styles.stepCard} ${totalMins >= 30 && totalMins < 120 ? styles.stepCardActive : ''}`}>
                        <span className={styles.stepTitle}>2 Hours</span>
                        <span className={styles.stepDesc}>Projections</span>
                        <span className={styles.stepDate}>{totalMins >= 120 ? 'Reached' : 'Upcoming'}</span>
                        <span className={styles.stepScore}>{p.predicted_reading_2h && p.predicted_writing_2h ? Math.round((p.predicted_reading_2h + p.predicted_writing_2h) / 2) : 62}%</span>
                      </div>
                    </div>

                    {/* Node 3 */}
                    <div className={styles.timelineStepNode}>
                      <div className={`${styles.stepDot} ${totalMins >= 300 ? styles.stepDotCompleted : (totalMins >= 120 && totalMins < 300 ? styles.stepDotActive : '')}`}>
                        {totalMins >= 300 ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: totalMins >= 120 ? '#FFFFFF' : 'transparent' }} />}
                      </div>
                      <div className={`${styles.stepCard} ${totalMins >= 120 && totalMins < 300 ? styles.stepCardActive : ''}`}>
                        <span className={styles.stepTitle}>5 Hours</span>
                        <span className={styles.stepDesc}>Projections</span>
                        <span className={styles.stepDate}>{totalMins >= 300 ? 'Reached' : 'Upcoming'}</span>
                        <span className={styles.stepScore}>{p.predicted_reading_5h && p.predicted_writing_5h ? Math.round((p.predicted_reading_5h + p.predicted_writing_5h) / 2) : 75}%</span>
                      </div>
                    </div>

                    {/* Node 4 */}
                    <div className={styles.timelineStepNode}>
                      <div className={`${styles.stepDot} ${totalMins >= 600 ? styles.stepDotCompleted : (totalMins >= 300 && totalMins < 600 ? styles.stepDotActive : '')}`}>
                        {totalMins >= 600 ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: totalMins >= 300 ? '#FFFFFF' : 'transparent' }} />}
                      </div>
                      <div className={`${styles.stepCard} ${totalMins >= 300 && totalMins < 600 ? styles.stepCardActive : ''}`}>
                        <span className={styles.stepTitle}>10 Hours</span>
                        <span className={styles.stepDesc}>Projections</span>
                        <span className={styles.stepDate}>{totalMins >= 600 ? 'Reached' : 'Upcoming'}</span>
                        <span className={styles.stepScore}>{p.predicted_reading_10h && p.predicted_writing_10h ? Math.round((p.predicted_reading_10h + p.predicted_writing_10h) / 2) : 88}%</span>
                      </div>
                    </div>

                    {/* Node 5 */}
                    <div className={styles.timelineStepNode}>
                      <div className={`${styles.stepDot} ${totalMins >= 900 ? styles.stepDotCompleted : (totalMins >= 600 && totalMins < 900 ? styles.stepDotActive : '')}`}>
                        {totalMins >= 900 ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: totalMins >= 600 ? '#FFFFFF' : 'transparent' }} />}
                      </div>
                      <div className={`${styles.stepCard} ${totalMins >= 600 && totalMins < 900 ? styles.stepCardActive : ''}`}>
                        <span className={styles.stepTitle}>Target</span>
                        <span className={styles.stepDesc}>Mastery Goal</span>
                        <span className={styles.stepDate}>Estimated</span>
                        <span className={styles.stepScore}>100%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alert Notice Box */}
                <div className={styles.alertNotice}>
                  <Sparkles size={20} className={styles.alertIcon} />
                  <span>Predictions become more accurate as you continue to learn and complete more assessments. Future predictions are estimates and are not guaranteed.</span>
                </div>

              </div>

              {/* Right Column Panels */}
              <div className={styles.rightColLayout}>
                {/* Panel 1: Interactive study simulator */}
                <div className={styles.rightPanelCard} style={{ backgroundColor: '#FFFDF9', border: '3.5px solid var(--color-peach)' }}>
                  <div className={styles.panelHeader}>
                    <Clock size={20} color="var(--color-orange)" />
                    <h3 style={{ color: 'var(--color-orange-dark)' }}>Study Time Simulator</h3>
                  </div>
                  <p className={styles.panelSubtitle}>Drag the slider to predict growth curves based on lesson study minutes!</p>

                  <div style={{ margin: '20px 0', padding: '14px', backgroundColor: '#FFF9F3', borderRadius: '12px', border: '2px solid var(--color-peach-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, color: 'var(--color-orange-dark)', fontSize: '15px', marginBottom: '8px' }}>
                      <span>Additional Study Time</span>
                      <span>{simulationMins} Minutes</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      step="5"
                      value={simulationMins}
                      onChange={(e) => setSimulationMins(Number(e.target.value))}
                      style={{
                        width: '100%',
                        accentColor: 'var(--color-orange)',
                        cursor: 'pointer',
                        height: '8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--color-peach-light)'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginTop: '4px' }}>
                      <span>0m (Baseline)</span>
                      <span>90m (1.5 Hours)</span>
                      <span>180m (3 Hours)</span>
                    </div>
                  </div>

                  {simulating ? (
                    <div style={{ padding: '10px 0', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 800, fontSize: '13px' }}>
                      🔮 RandomForestRegressor computing projections...
                    </div>
                  ) : (
                    <div className={styles.scenarioList}>
                      {/* Projected Reading Score */}
                      <div className={styles.scenarioTile} style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--color-peach-light)' }}>
                        <div style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', color: 'var(--text-dark)' }}>
                            <span>Expected Reading Score</span>
                            <span style={{ color: 'var(--color-orange-dark)', fontWeight: 900 }}>{simulatedData?.current_reading_score || currentRead}%</span>
                          </div>
                          <div style={{ height: '8px', backgroundColor: 'var(--color-peach-light)', borderRadius: '4px', marginTop: '6px', overflow: 'hidden' }}>
                            <div style={{ width: `${simulatedData?.current_reading_score || currentRead}%`, height: '100%', backgroundColor: 'var(--color-orange)' }} />
                          </div>
                        </div>
                      </div>

                      {/* Projected Writing Score */}
                      <div className={styles.scenarioTile} style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--color-peach-light)', marginTop: '8px' }}>
                        <div style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', color: 'var(--text-dark)' }}>
                            <span>Expected Writing Score</span>
                            <span style={{ color: 'var(--color-mint)', fontWeight: 900 }}>{simulatedData?.current_writing_score || currentWrite}%</span>
                          </div>
                          <div style={{ height: '8px', backgroundColor: 'var(--color-peach-light)', borderRadius: '4px', marginTop: '6px', overflow: 'hidden' }}>
                            <div style={{ width: `${simulatedData?.current_writing_score || currentWrite}%`, height: '100%', backgroundColor: 'var(--color-mint)' }} />
                          </div>
                        </div>
                      </div>

                      {/* Projected Cumulative Gain */}
                      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 800, color: 'var(--text-muted)' }}>
                        <Sparkles size={14} style={{ color: 'var(--color-orange)' }} />
                        <span>Estimated overall gain: <strong>+{simulatedData?.estimated_improvement || 0}%</strong></span>
                      </div>
                    </div>
                  )}

                  <p className={styles.disclaimerText} style={{ marginTop: '14px', borderTop: '1px dashed var(--color-peach-light)', paddingTop: '8px' }}>
                    Model: {simulatedData?.model_name || 'RandomForestRegressor'}
                  </p>
                </div>

                {/* Panel 2: Tips to Improve */}
                <div className={styles.rightPanelCard}>
                  <div className={styles.panelHeader}>
                    <Sparkles size={20} color="#FF7A00" />
                    <h3>Tips to Improve</h3>
                  </div>

                  <div className={styles.tipsList}>
                    <div className={styles.tipItem}>
                      <div className={styles.tipCheck}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>Complete more practice questions</span>
                    </div>

                    <div className={styles.tipItem}>
                      <div className={styles.tipCheck}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>Revise weak topics</span>
                    </div>

                    <div className={styles.tipItem}>
                      <div className={styles.tipCheck}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>Maintain a daily learning streak</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Footer Notice */}
            <div className={styles.footerNotice}>
              <div className={styles.footerLeft}>
                <Lock size={18} className={styles.footerLockIcon} />
                <span>We only count active learning time. Idle or inactive time is not included in your focused learning time.</span>
              </div>
              <a className={styles.footerLearnMore} onClick={() => alert('Active learning measures keyboard inputs, mouse movements, question answers, and audio recording durations to filter out tab inactivity.')}>
                Learn more
              </a>
            </div>

          </div>
        )}
      </main>
      {isLocked && renderLockOverlay()}
    </div>
  );
}

function RefreshCwIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );
}
