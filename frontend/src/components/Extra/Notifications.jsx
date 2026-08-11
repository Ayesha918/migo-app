// src/components/Extra/Notifications.jsx
import { useState, useEffect } from 'react';
import { useLearner } from '../../services/LearnerContext';
import { fetchNotifications, markNotificationsRead } from '../../services/api';
import Sidebar from '../Home/Sidebar';
import Header from '../Home/Header';
import { CheckCircle2, Info, Star, CreditCard } from 'lucide-react';
import styles from './Extra.module.css';

const ICON_MAP = {
  placement: { icon: CheckCircle2, color: '#27AE60' },
  welcome: { icon: Info, color: '#2980B9' },
  milestone: { icon: Star, color: '#F1C40F' },
  payment: { icon: CreditCard, color: '#FF7A00' }
};

export default function Notifications() {
  const { learner, logout } = useLearner();
  const [filter, setFilter] = useState('All');
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = () => {
    if (!learner) return;
    setLoading(true);
    fetchNotifications(learner.learner_id)
      .then(res => {
        setNotifs(res.data || []);
      })
      .catch(err => console.error('Failed to load notifications:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, [learner]);

  const handleMarkAllRead = () => {
    if (!learner) return;
    markNotificationsRead(learner.learner_id)
      .then(() => {
        setNotifs(notifs.map(n => ({ ...n, unread: false })));
      })
      .catch(err => console.error('Failed to mark all as read:', err));
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
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifs.length === 0 ? (
            <div className={styles.sectionBox} style={{ textAlign: 'center', padding: '40px 20px' }}>
              <span style={{ fontSize: '48px' }}>📭</span>
              <h3 style={{ border: 'none', padding: 0, marginTop: '12px' }}>All Clear!</h3>
              <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>No notifications to review.</p>
            </div>
          ) : (
            filteredNotifs.map(notif => {
              const meta = ICON_MAP[notif.notification_type] || ICON_MAP.welcome;
              const Icon = meta.icon;
              return (
                <div
                  key={notif.id}
                  className={`${styles.notificationCard} ${notif.unread ? styles.notificationCardUnread : ''}`}
                >
                  <div className={styles.notifCircle} style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>
                    <Icon size={20} />
                  </div>
                  <div className={styles.notifText}>
                    <p>
                      <strong>{notif.title}</strong> — {notif.description}
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
