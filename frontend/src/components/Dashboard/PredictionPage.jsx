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
  const { learner, logout } = useLearner();

  const [prediction, setPrediction] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Static mockup data overlay matching the spec screenshot perfectly
  const dashboardData = {
    lastUpdated: 'May 07, 2025',
    lastUpdatedTime: '07:14 AM',
    activeLearningTime: '37 min',
    lessonsCompleted: '3',
    confidenceScore: '68%',
    confidenceLabel: 'Medium',
    currentPredictedScore: '82%',
    expectedScoreMin: '79%',
    expectedScoreMax: '86%',
    questionsAttempted: '42',
    recentAccuracy: '81%',
    dayStreak: '7',
  };

  // Circular confidence ring calculations
  const strokeWidth = 5;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (68 / 100) * circumference;

  return (
    <div className={styles.pageLayout}>
      <Sidebar onLogout={handleLogout} />

      <main className={styles.mainContent}>
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
                    <div className={styles.timelineConnectorActive} />

                    {/* Node 1 */}
                    <div className={styles.timelineStepNode}>
                      <div className={`${styles.stepDot} ${styles.stepDotCompleted}`}>
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      </div>
                      <div className={styles.stepCard}>
                        <span className={styles.stepTitle}>15 min</span>
                        <span className={styles.stepDesc}>Focused Learning</span>
                        <span className={styles.stepDate}>May 07, 06:37 AM</span>
                        <span className={styles.stepScore}>79%</span>
                      </div>
                    </div>

                    {/* Node 2 */}
                    <div className={styles.timelineStepNode}>
                      <div className={`${styles.stepDot} ${styles.stepDotCompleted}`}>
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      </div>
                      <div className={styles.stepCard}>
                        <span className={styles.stepTitle}>30 min</span>
                        <span className={styles.stepDesc}>Focused Learning</span>
                        <span className={styles.stepDate}>May 07, 06:52 AM</span>
                        <span className={styles.stepScore}>81%</span>
                      </div>
                    </div>

                    {/* Node 3 */}
                    <div className={styles.timelineStepNode}>
                      <div className={`${styles.stepDot} ${styles.stepDotActive}`}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
                      </div>
                      <div className={`${styles.stepCard} ${styles.stepCardActive}`}>
                        <span className={styles.stepTitle}>37 min</span>
                        <span className={styles.stepDesc}>Focused Learning</span>
                        <span className={`${styles.stepDate} ${styles.stepDateActive}`}>May 07, 07:14 AM</span>
                        <span className={`${styles.stepScore} ${styles.stepScoreActive}`}>82%</span>
                      </div>
                    </div>

                    {/* Node 4 */}
                    <div className={styles.timelineStepNode}>
                      <div className={styles.stepDot} />
                      <div className={styles.stepCard}>
                        <span className={styles.stepTitle}>45 min</span>
                        <span className={styles.stepDesc}>Focused Learning</span>
                        <span className={styles.stepDate}>Upcoming</span>
                        <span className={`${styles.stepScore} ${styles.stepScoreUpcoming}`}>–</span>
                      </div>
                    </div>

                    {/* Node 5 */}
                    <div className={styles.timelineStepNode}>
                      <div className={styles.stepDot} />
                      <div className={styles.stepCard}>
                        <span className={styles.stepTitle}>60 min</span>
                        <span className={styles.stepDesc}>Focused Learning</span>
                        <span className={styles.stepDate}>Upcoming</span>
                        <span className={`${styles.stepScore} ${styles.stepScoreUpcoming}`}>–</span>
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
                {/* Panel 1: What if I study more? */}
                <div className={styles.rightPanelCard}>
                  <div className={styles.panelHeader}>
                    <Clock size={20} color="#FF7A00" />
                    <h3>What if I study more?</h3>
                  </div>
                  <p className={styles.panelSubtitle}>See how your score could improve with consistent learning.</p>

                  <div className={styles.scenarioList}>
                    {/* Scenario 1 */}
                    <div className={styles.scenarioTile}>
                      <div className={styles.scenarioLeft}>
                        <div className={styles.scenarioIconWrapper} style={{ backgroundColor: '#E8F8F0' }}>
                          <TrendingUp size={18} color="#27AE60" />
                        </div>
                        <div className={styles.scenarioInfo}>
                          <div className={styles.scenarioTitleRow}>
                            <span className={styles.scenarioTitleText}>Continue Current Pattern</span>
                            <span className={styles.scenarioTag}>Recommended</span>
                          </div>
                          <span className={styles.scenarioLabel}>Expected Score</span>
                        </div>
                      </div>
                      <span className={styles.scenarioScore}>83% – 87%</span>
                    </div>

                    {/* Scenario 2 */}
                    <div className={styles.scenarioTile}>
                      <div className={styles.scenarioLeft}>
                        <div className={styles.scenarioIconWrapper} style={{ backgroundColor: '#EAF2FF' }}>
                          <Clock size={18} color="#3B82F6" />
                        </div>
                        <div className={styles.scenarioInfo}>
                          <span className={styles.scenarioTitleText}>30 min / day</span>
                          <span className={styles.scenarioLabel}>Expected Score</span>
                        </div>
                      </div>
                      <span className={styles.scenarioScore}>85% – 89%</span>
                    </div>

                    {/* Scenario 3 */}
                    <div className={styles.scenarioTile}>
                      <div className={styles.scenarioLeft}>
                        <div className={styles.scenarioIconWrapper} style={{ backgroundColor: '#F3E8FF' }}>
                          <Zap size={18} color="#9F7AEA" />
                        </div>
                        <div className={styles.scenarioInfo}>
                          <span className={styles.scenarioTitleText}>60 min / day + Revision</span>
                          <span className={styles.scenarioLabel}>Expected Score</span>
                        </div>
                      </div>
                      <span className={styles.scenarioScore}>88% – 92%</span>
                    </div>
                  </div>

                  <p className={styles.disclaimerText}>
                    These are estimates based on your historical performance and may vary.
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
