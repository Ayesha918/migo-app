// src/components/Extra/Notifications.jsx
import { useState } from 'react';
import { useLearner } from '../../services/LearnerContext';
import Sidebar from '../Home/Sidebar';
import Header from '../Home/Header';
import { CheckCircle2, Info, Star } from 'lucide-react';
import styles from './Extra.module.css';

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'placement', title: 'Placement Complete!', desc: 'You completed your initial placement checks and have been placed in the Beginner level. Your custom roadmap is ready!', time: '5m ago', unread: true, color: '#27AE60', icon: CheckCircle2 },
  { id: 2, type: 'welcome', title: 'Welcome to MiGo!', desc: 'Embark on your journey to learn Hindi, Kannada, Tamil, or English with child-friendly interactive exercises!', time: '6m ago', unread: true, color: '#2980B9', icon: Info },
  { id: 3, type: 'milestone', title: 'First Steps Milestone', desc: 'Congratulations! You unlocked the Beginner Starter Badge for completing your very first learning block.', time: '1d ago', unread: false, color: '#F1C40F', icon: Star }
];

export default function Notifications() {
  const { logout } = useLearner();
  const [filter, setFilter] = useState('All');
  const [notifs, setNotifs] = useState(INITIAL_NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotifs(notifs.map(n => ({ ...n, unread: false })));
  };

  const filteredNotifs = filter === 'All'
    ? notifs
    : notifs.filter(n => n.unread);

  return (
    <div className={styles.pageLayout}>
      <Sidebar onLogout={logout} />
      <main className={styles.mainContent}>
        <Header />

        <div className={styles.headerArea}>
          <span className={styles.headerIcon}>🔔</span>
          <div className={styles.headerMeta}>
            <h2>Notifications</h2>
            <p>Stay updated on your learning milestones and achievements</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div className={styles.tabBar} style={{ margin: 0 }}>
            {['All', 'Unread'].map(opt => (
              <button
                key={opt}
                className={`${styles.tabPill} ${filter === opt ? styles.activeTabPill : ''}`}
                onClick={() => setFilter(opt)}
                type="button"
              >
                {opt}
              </button>
            ))}
          </div>
          {notifs.some(n => n.unread) && (
            <button
              onClick={handleMarkAllRead}
              style={{ background: 'none', border: 'none', color: 'var(--color-orange)', fontWeight: 800, fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
              type="button"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div style={{ maxWidth: '680px', width: '100%', margin: '0 auto' }}>
          {filteredNotifs.length === 0 ? (
            <div className={styles.sectionBox} style={{ textAlign: 'center', padding: '40px 20px' }}>
              <span style={{ fontSize: '48px' }}>📭</span>
              <h3 style={{ border: 'none', padding: 0, marginTop: '12px' }}>All Clear!</h3>
              <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>No unread notifications to review.</p>
            </div>
          ) : (
            filteredNotifs.map(notif => {
              const Icon = notif.icon;
              return (
                <div
                  key={notif.id}
                  className={`${styles.notificationCard} ${notif.unread ? styles.notificationCardUnread : ''}`}
                >
                  <div className={styles.notifCircle} style={{ backgroundColor: `${notif.color}15`, color: notif.color }}>
                    <Icon size={20} />
                  </div>
                  <div className={styles.notifText}>
                    <p>
                      <strong>{notif.title}</strong> — {notif.desc}
                    </p>
                    <span className={styles.notifTime}>{notif.time}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
