// src/components/Dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Award, Map, ArrowLeft, CheckCircle2, Star, 
  Flame, Sparkles, Zap, DollarSign, Users, ChevronRight, Volume2,
  RefreshCw, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line
} from 'recharts';
import { useLearner } from '../../services/LearnerContext';
import useTranslate from '../../services/useTranslate';
import { fetchDashboardSummary } from '../../services/api';
import owl from '../../assets/images/owl.png';
import Sidebar from '../Home/Sidebar';
import styles from './Dashboard.module.css';

const AVATAR_EMOJI = {
  boy: '👦', girl: '👧', grandmother: '👵', grandfather: '👴',
  teacher: '🧑‍🏫', book: '📖', lion: '🦁', tiger: '🐯',
  apple: '🍎', flower: '🌸', star: '⭐', migo: '🦊',
};

const STORE_ITEMS = [
  { id: 'xp_boost', title: 'Double XP Boost', cost: 50, emoji: '⚡', desc: 'Get double XP points for next 3 lessons.' },
  { id: 'mascot_skin', title: 'Owl Mascot Skin', cost: 120, emoji: '👑', desc: 'Unlock a golden crown for your mascot tutor.' },
  { id: 'star_badge', title: 'Super Star Badge', cost: 30, emoji: '🎖️', desc: 'Decorate your learner profile avatar frame.' }
];

export default function Dashboard() {
  const { learner } = useLearner();
  const navigate = useNavigate();
  const t = useTranslate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyMessage, setBuyMessage] = useState('');

  useEffect(() => {
    if (!learner) return;
    fetchDashboardSummary(learner.learner_id)
      .then((res) => setSummary(res.data))
      .catch((err) => console.error('Failed to load dashboard:', err))
      .finally(() => setLoading(false));
  }, [learner]);

  const handleSpeakRecommendation = () => {
    if (summary?.ai_recommendation && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(summary.ai_recommendation);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleBuyItem = (item) => {
    if (!summary) return;
    if (summary.virtual_coins < item.cost) {
      setBuyMessage(`❌ Not enough coins! You need ${item.cost - summary.virtual_coins} more 🪙.`);
      setTimeout(() => setBuyMessage(''), 3000);
      return;
    }
    // Deduct coins mock action
    setSummary({
      ...summary,
      virtual_coins: summary.virtual_coins - item.cost
    });
    setBuyMessage(`🎉 Success! You unlocked: ${item.title} ${item.emoji}!`);
    setTimeout(() => setBuyMessage(''), 3000);
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

  // Parse skill radar values into Recharts structure
  const skillsData = summary?.skills_radar ? Object.entries(summary.skills_radar).map(([name, score]) => ({
    subject: name,
    value: score,
    fullMark: 100
  })) : [];

  // Parse weekly study chart values into chart structure
  const studyChartData = summary?.weekly_study_chart ? summary.weekly_study_chart.map((minutes, idx) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return { name: days[idx] || '', Study: minutes };
  }) : [];

  // Parse pronunciation trend data
  const pronunciationTrendData = summary?.pronunciation_trend ? summary.pronunciation_trend.map((score, idx) => ({
    name: `A${idx + 1}`,
    Score: score
  })) : [];

  // Format progress improvement lists
  const readingChartData = summary?.reading_improvement?.map((score, i) => ({ name: `T${i+1}`, Score: score })) || [];
  const writingChartData = summary?.writing_improvement?.map((score, i) => ({ name: `T${i+1}`, Score: score })) || [];
  const speakingChartData = summary?.speaking_improvement?.map((score, i) => ({ name: `T${i+1}`, Score: score })) || [];

  return (
    <div className={styles.pageLayout}>
      <Sidebar onLogout={handleLogout} />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <Trophy size={32} color="var(--color-orange)" />
            <div>
              <h1>Trophy Room & Progress Analytics</h1>
              <p>Review speaking scores, streaking streaks, earned badges, and custom AI recommendations.</p>
            </div>
          </div>
          
          <button className={styles.backBtn} onClick={() => navigate('/home')}>
            <ArrowLeft size={18} />
            <span>Adventure Map</span>
          </button>
        </header>

        {loading ? (
          <div className={styles.loadingBox}>
            <RefreshCw className={styles.spin} />
            <p>Gathering dashboard telemetry...</p>
          </div>
        ) : summary ? (
          <>
            {/* HERO PROFILE & AI RECOMMENDATION */}
            <section className={styles.heroSection}>
              <div className={styles.profileBanner}>
                <div className={styles.avatarBox}>{AVATAR_EMOJI[learner.avatar] || '⭐'}</div>
                <div className={styles.profileInfo}>
                  <h2>Super Star {learner.name}! 🌟</h2>
                  <p>ID: {learner.learner_id} | Language Path: {learner.learning_language.toUpperCase()}</p>
                </div>
              </div>

              {/* AI Recommendations Box */}
              <div className={styles.aiTutorRecomBox}>
                <img src={owl} alt="AI Tutor Owl" className={styles.tutorOwlMascot} />
                <div className={styles.tutorBubble}>
                  <div className={styles.bubbleHeader}>
                    <span>🦉 AI Tutor Recommendation</span>
                    <button className={styles.speakBtn} onClick={handleSpeakRecommendation} title="Read Aloud">
                      <Volume2 size={16} />
                    </button>
                  </div>
                  <p className={styles.recommendationText}>
                    "{summary.ai_recommendation || 'Keep practicing your lesson activities daily to build consistent overall literacy!'}"
                  </p>
                </div>
              </div>
            </section>

            {/* QUICK STATS WIDGETS (Streaks, XP, Coins, Lessons) */}
            <section className={styles.quickStatsGrid}>
              {/* Widget 1: Lessons Completed */}
              <div className={styles.statCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>📖</span>
                  <h4>Lessons Completed</h4>
                </div>
                <h3>{summary.lessons_completed} Lessons</h3>
                <span className={styles.statSub}>On {summary.level?.toUpperCase()} stage</span>
              </div>

              {/* Widget 2: Weekly Study Time */}
              <div className={styles.statCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>⏱️</span>
                  <h4>Weekly Study Time</h4>
                </div>
                <h3>{summary.weekly_study_time} mins</h3>
                <span className={styles.statSub}>In last 7 days</span>
              </div>

              {/* Widget 3: Daily streak */}
              <div className={styles.statCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon} style={{ color: '#FF7A00' }}>🔥</span>
                  <h4>Daily Streak</h4>
                </div>
                <h3>{summary.streak_count} Days</h3>
                <span className={styles.statSub}>Keep consistency active!</span>
              </div>

              {/* Widget 4: XP progress */}
              <div className={styles.statCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon} style={{ color: '#FFCA57' }}>🌟</span>
                  <h4>XP Points</h4>
                </div>
                <h3>{summary.xp_points} / {summary.xp_target}</h3>
                <div className={styles.xpProgressContainer}>
                  <div 
                    className={styles.xpProgressBar} 
                    style={{ width: `${Math.min(100, (summary.xp_points / summary.xp_target) * 100)}%` }} 
                  />
                </div>
              </div>
            </section>

            {/* MAIN PROGRESS CHARTS (Simplified for Neo-Literates & Elderly Learners) */}
            <section className={styles.chartsGrid}>
              {/* Widget 5: Skills Comparison Bar Chart */}
              <div className={styles.chartCard}>
                <h3>🎯 Skill-wise Mastery comparison</h3>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={skillsData}>
                      <XAxis dataKey="subject" tick={{ fill: 'var(--text-dark)', fontSize: 13, fontWeight: 700 }} />
                      <YAxis domain={[0, 100]} tickLine={false} axisLine={false} ticks={[0, 25, 50, 75, 100]} tick={{ fill: 'var(--text-dark)' }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="var(--color-orange)" radius={[8, 8, 0, 0]} barSize={35} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Widget 6: Pronunciation Trend Chart */}
              <div className={styles.chartCard}>
                <h3>🎙️ Pronunciation accuracy trend</h3>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={pronunciationTrendData}>
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-dark)', fontWeight: 700 }} />
                      <YAxis domain={[0, 100]} tickLine={false} axisLine={false} ticks={[0, 20, 40, 60, 80, 100]} tick={{ fill: 'var(--text-dark)' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="Score" stroke="var(--color-orange)" strokeWidth={4} dot={{ r: 8, fill: '#FF7A00', strokeWidth: 3, stroke: '#FFF8F0' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Widget 7: Weekly Study distribution Bar Chart */}
              <div className={styles.chartCard} style={{ gridColumn: 'span 2' }}>
                <h3>📈 Study Time Activity (Minutes per Day)</h3>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={studyChartData}>
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-dark)', fontWeight: 700 }} />
                      <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: 'var(--text-dark)' }} />
                      <Tooltip />
                      <Bar dataKey="Study" fill="#FF9F43" radius={[8, 8, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* SKILL IMPROVEMENT COMPARISONS (Line/Bar graphs) */}
            <section className={styles.skillQuestsSection}>
              <h3>📊 Skill-wise Progress Trends</h3>
              <div className={styles.miniChartsRow}>
                {/* Reading score path */}
                <div className={styles.miniChartCard}>
                  <h4>Reading Improvement</h4>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={readingChartData}>
                      <Tooltip />
                      <Line type="monotone" dataKey="Score" stroke="#FF9F43" strokeWidth={3.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <span>Score: <strong>{summary.reading_score}%</strong></span>
                </div>

                {/* Writing score path */}
                <div className={styles.miniChartCard}>
                  <h4>Writing Improvement</h4>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={writingChartData}>
                      <Tooltip />
                      <Line type="monotone" dataKey="Score" stroke="#1DD1A1" strokeWidth={3.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <span>Score: <strong>{summary.writing_score}%</strong></span>
                </div>

                {/* Speaking score path */}
                <div className={styles.miniChartCard}>
                  <h4>Speaking Improvement</h4>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={speakingChartData}>
                      <Tooltip />
                      <Line type="monotone" dataKey="Score" stroke="#9C88FF" strokeWidth={3.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <span>Score: <strong>{summary.skills_radar?.Speaking}%</strong></span>
                </div>
              </div>
            </section>

            {/* GAMIFICATION ROOM (Store, badges, leaderboard) */}
            <section className={styles.gamificationSection}>
              {/* Virtual Coin Store */}
              <div className={styles.storeCard}>
                <div className={styles.storeHeader}>
                  <h3>🪙 Virtual Reward Shop</h3>
                  <span className={styles.coinsCount}>Balance: 🪙 {summary.virtual_coins}</span>
                </div>
                
                <AnimatePresence mode="wait">
                  {buyMessage && (
                    <motion.div 
                      className={styles.shopToast}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {buyMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={styles.storeItemsList}>
                  {STORE_ITEMS.map((item) => (
                    <div key={item.id} className={styles.storeItem}>
                      <span className={styles.itemEmoji}>{item.emoji}</span>
                      <div className={styles.itemMeta}>
                        <h5>{item.title}</h5>
                        <p>{item.desc}</p>
                      </div>
                      <button className={styles.buyBtn} onClick={() => handleBuyItem(item)}>
                        <span>Buy {item.cost} 🪙</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard widget */}
              <div className={styles.leaderboardCard}>
                <h3>🏆 Adventure Leaderboard</h3>
                <div className={styles.leaderboardList}>
                  {summary.leaderboard?.map((user) => (
                    <div key={user.rank} className={`${styles.leaderboardUser} ${user.name === learner.name ? styles.leaderboardMe : ''}`}>
                      <span className={styles.rankNum}>{user.rank}</span>
                      <span className={styles.avatarEmoji}>{AVATAR_EMOJI[user.avatar] || '⭐'}</span>
                      <div className={styles.userInfo}>
                        <h5>{user.name}</h5>
                        <span>{user.xp} XP Points</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges display */}
              <div className={styles.badgesPanel}>
                <h3>🎖️ Unlocked Badges & Achievements</h3>
                
                {summary.badges?.length === 0 ? (
                  <p className={styles.noActivity}>No achievements earned yet. Complete speaking practice or daily lessons to unlock badges!</p>
                ) : (
                  <div className={styles.badgesGrid}>
                    {summary.badges?.map((badge, idx) => (
                      <div key={idx} className={styles.badgeItem} title={badge.description}>
                        <div className={styles.badgeCircle}>{badge.icon_emoji}</div>
                        <strong>{badge.title}</strong>
                        <span>{badge.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <div className={styles.loadingBox}>
            <AlertCircle size={32} color="var(--color-pink)" />
            <p>Could not compile dashboard statistics.</p>
          </div>
        )}
      </main>
    </div>
  );
}