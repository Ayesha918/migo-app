// src/components/Dashboard/PredictionPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, Clock, Calendar, CheckCircle2, Award, Sparkles, ArrowLeft,
  BookOpen, PenTool, Cpu, Target, ShieldCheck, Activity, LineChart as ChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, AreaChart, Area
} from 'recharts';
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

  // Fallback defaults for missing prediction data
  const predData = prediction || {
    predicted_reading_20: 55,
    predicted_reading_50: 70,
    predicted_reading_100: 85,
    predicted_writing_20: 45,
    predicted_writing_50: 60,
    predicted_writing_100: 75,
    time_to_independent_reading: '4 weeks',
    time_to_independent_writing: '6 weeks',
    expected_completion_date: 'October 15, 2026',
    completion_probability: 0.85,
    basis: {
      current_reading_score: 40,
      current_writing_score: 30,
      lessons_completed: 2,
    }
  };

  const analyticData = analytics || {
    total_study_hours: 1.2,
    avg_daily_study_time: 15,
    lessons_completed: 2,
    learning_consistency: 70,
    reading_score: 40,
    writing_score: 30,
    overall_score: 35,
    weekly_study_hours: [
      { name: 'Mon', hours: 0.2 },
      { name: 'Tue', hours: 0.4 },
      { name: 'Wed', hours: 0.1 },
      { name: 'Thu', hours: 0.5 },
      { name: 'Fri', hours: 0.3 },
      { name: 'Sat', hours: 0.2 },
      { name: 'Sun', hours: 0.6 },
    ],
    quiz_accuracy_trend: [
      { attempt: 1, score: 50 },
      { attempt: 2, score: 60 },
      { attempt: 3, score: 75 },
    ]
  };

  const confidencePercent = Math.round(predData.completion_probability * 100);

  // Status badge logic
  const getStatusBadge = (score) => {
    if (score >= 80) return { label: 'Excellent', style: styles.badgeExcellent };
    if (score >= 60) return { label: 'Good', style: styles.badgeGood };
    if (score >= 45) return { label: 'Improving', style: styles.badgeImproving };
    return { label: 'Needs Practice', style: styles.badgePractice };
  };

  const readingBadge = getStatusBadge(analyticData.reading_score);
  const writingBadge = getStatusBadge(analyticData.writing_score);

  // Generate dynamic AI Insights based on performance values
  const getAIRecommendations = () => {
    const recs = [];
    if (analyticData.learning_consistency >= 70) {
      recs.push("You're making steady progress. Your learning consistency is fantastic!");
    } else {
      recs.push("Studying consistently for the next 7 days will reduce your estimated completion time.");
    }

    if (analyticData.reading_score > analyticData.writing_score + 10) {
      recs.push("Your reading skills are improving faster than writing. Try taking extra writing checkups.");
    }

    if (analyticData.lessons_completed < 5) {
      recs.push("Completing 5 more lessons this week will significantly improve your target accuracy predictions.");
    }

    const accuracyValues = analyticData.quiz_accuracy_trend.map(a => a.score);
    if (accuracyValues.length >= 2 && accuracyValues[accuracyValues.length - 1] > accuracyValues[0]) {
      const diff = Math.round(accuracyValues[accuracyValues.length - 1] - accuracyValues[0]);
      recs.push(`Your quiz accuracy has increased by ${diff}% since your first checkup! Keep up the good work.`);
    }

    return recs;
  };

  const recommendationsList = getAIRecommendations();

  // Progress scores mapping for the timeline milestones (based on lessons completed)
  const milestones = [
    {
      level: 'Current Level',
      reading: predData.basis?.current_reading_score || 40,
      writing: predData.basis?.current_writing_score || 30,
      date: 'Today',
      isCompleted: true
    },
    {
      level: 'After 20 Lessons',
      reading: predData.predicted_reading_2h || 55,
      writing: predData.predicted_writing_2h || 45,
      date: 'Milestone 1',
      isCompleted: false
    },
    {
      level: 'After 50 Lessons',
      reading: predData.predicted_reading_5h || 70,
      writing: predData.predicted_writing_5h || 60,
      date: 'Milestone 2',
      isCompleted: false
    },
    {
      level: 'After 100 Lessons',
      reading: predData.predicted_reading_10h || 85,
      writing: predData.predicted_writing_10h || 75,
      date: predData.expected_completion_date,
      isCompleted: false
    }
  ];

  return (
    <div className={styles.pageLayout}>
      <Sidebar onLogout={handleLogout} />

      <main className={styles.mainContent}>
        <Header learner={learner} />

        {/* Top Header Row */}
        <section className={styles.predictionHeader}>
          <div className={styles.titleGroup}>
            <TrendingUp size={36} className={styles.orangeIcon} />
            <div>
              <h1>Your Learning Forecast</h1>
              <p>Real-time AI projections based on your active study logs</p>
            </div>
          </div>

          <div className={styles.headerBtnRow}>
            <button className={styles.refreshBtn} onClick={loadData}>
              <RefreshCwIcon />
              <span>Sync Dashboard</span>
            </button>
            <button className={styles.backMapBtn} onClick={() => navigate('/home')}>
              <ArrowLeft size={20} />
              <span>Adventure Map</span>
            </button>
          </div>
        </section>

        {loading ? (
          <div className={styles.skeletonContainer}>
            <p>🔮 Syncing learning forecast from database...</p>
          </div>
        ) : (
          <div className={styles.dashboardGrid}>
            
            {/* 4 SUMMARY STATS UNDER THE TITLE */}
            <div className={styles.summaryStatsRow}>
              <div className={styles.summaryCard}>
                <Calendar className={styles.summaryIcon} color="#FF7A00" />
                <div>
                  <h4>Completion Date</h4>
                  <h3>{predData.expected_completion_date}</h3>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <Activity className={styles.summaryIcon} color="#1DD1A1" />
                <div>
                  <h4>Current Progress</h4>
                  <h3>{analyticData.overall_score}%</h3>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <Clock className={styles.summaryIcon} color="#9C88FF" />
                <div>
                  <h4>Remaining Time</h4>
                  <h3>{predData.time_to_independent_reading}</h3>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <ShieldCheck className={styles.summaryIcon} color="#FECA57" />
                <div>
                  <h4>Prediction Confidence</h4>
                  <h3>{confidencePercent}%</h3>
                </div>
              </div>
            </div>

            {/* TIMELINE PROGRESS CARD */}
            <div className={styles.timelineCard}>
              <div className={styles.cardHeader}>
                <Target size={24} color="#FF7A00" />
                <h2>Learning Progress Timeline</h2>
              </div>
              <div className={styles.timelineTimeline}>
                {milestones.map((m, idx) => {
                  const avgScore = Math.round((m.reading + m.writing) / 2);
                  return (
                    <div key={idx} className={styles.timelineNode}>
                      <div className={`${styles.nodeDot} ${m.isCompleted ? styles.nodeCompleted : ''}`}>
                        <span>{idx + 1}</span>
                      </div>
                      <div className={styles.nodeContent}>
                        <div className={styles.nodeHeader}>
                          <h4>{m.level}</h4>
                          <span className={styles.nodeDate}>{m.date}</span>
                        </div>
                        <div className={styles.nodeProgressRow}>
                          <div className={styles.barOuter}>
                            <div className={styles.barInner} style={{ width: `${avgScore}%` }} />
                          </div>
                          <span className={styles.nodeScore}>Score: {avgScore}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* READING & WRITING PREDICTIONS */}
            <div className={styles.skillsPredictionsRow}>
              {/* Reading Forecast */}
              <div className={styles.skillCard}>
                <div className={styles.skillHeader}>
                  <BookOpen size={24} color="#FF7A00" />
                  <h3>Reading Forecast</h3>
                  <span className={`${styles.statusBadge} ${readingBadge.style}`}>{readingBadge.label}</span>
                </div>
                <div className={styles.skillBody}>
                  <div className={styles.scoreRow}>
                    <div>
                      <span>Current Reading</span>
                      <h2>{analyticData.reading_score}%</h2>
                    </div>
                    <div>
                      <span>Predicted Reading</span>
                      <h2 style={{ color: '#FF7A00' }}>{predData.predicted_reading_2h || predData.predicted_reading_20}%</h2>
                    </div>
                  </div>
                  <div className={styles.improvementRow}>
                    <span>Expected Improvement:</span>
                    <strong>+{Math.max(0, roundOneDec((predData.predicted_reading_2h || predData.predicted_reading_20) - analyticData.reading_score))}%</strong>
                  </div>
                  <div className={styles.barOuter}>
                    <div className={styles.barInner} style={{ width: `${predData.predicted_reading_2h || predData.predicted_reading_20}%`, backgroundColor: '#FF7A00' }} />
                  </div>
                </div>
              </div>

              {/* Writing Forecast */}
              <div className={styles.skillCard}>
                <div className={styles.skillHeader}>
                  <PenTool size={24} color="#FF9F43" />
                  <h3>Writing Forecast</h3>
                  <span className={`${styles.statusBadge} ${writingBadge.style}`}>{writingBadge.label}</span>
                </div>
                <div className={styles.skillBody}>
                  <div className={styles.scoreRow}>
                    <div>
                      <span>Current Writing</span>
                      <h2>{analyticData.writing_score}%</h2>
                    </div>
                    <div>
                      <span>Predicted Writing</span>
                      <h2 style={{ color: '#FF9F43' }}>{predData.predicted_writing_2h || predData.predicted_writing_20}%</h2>
                    </div>
                  </div>
                  <div className={styles.improvementRow}>
                    <span>Expected Improvement:</span>
                    <strong>+{Math.max(0, roundOneDec((predData.predicted_writing_2h || predData.predicted_writing_20) - analyticData.writing_score))}%</strong>
                  </div>
                  <div className={styles.barOuter}>
                    <div className={styles.barInner} style={{ width: `${predData.predicted_writing_2h || predData.predicted_writing_20}%`, backgroundColor: '#FF9F43' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* CHARTS GRAPHICS SECTION */}
            <div className={styles.chartsGrid}>
              {/* Weekly study hours */}
              <div className={styles.chartCard}>
                <div className={styles.chartTitleRow}>
                  <Clock size={20} color="#FF7A00" />
                  <span>Weekly Study hours</span>
                </div>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                    <BarChart data={analyticData.weekly_study_hours}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="hours" fill="#FF7A00" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quiz accuracy */}
              <div className={styles.chartCard}>
                <div className={styles.chartTitleRow}>
                  <ChartIcon size={20} color="#FF7A00" />
                  <span>Quiz Accuracy Trend</span>
                </div>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                    <LineChart data={analyticData.quiz_accuracy_trend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="attempt" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#FF7A00" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* AI STUDY INSIGHTS */}
            <div className={styles.insightsCard}>
              <div className={styles.insightsHeader}>
                <Sparkles size={24} color="#FECA57" fill="#FECA57" />
                <h2>AI Study Insights</h2>
              </div>
              <ul className={styles.insightsList}>
                {recommendationsList.map((rec, i) => (
                  <li key={i} className={styles.insightItem}>
                    <div className={styles.insightDot} />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

// Helpers
function roundOneDec(val) {
  return Math.round(val * 10) / 10;
}

function RefreshCwIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );
}
