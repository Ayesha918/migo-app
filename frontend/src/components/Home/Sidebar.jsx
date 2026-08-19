// src/components/Home/Sidebar.jsx

import { useNavigate, useLocation } from 'react-router-dom';
import owl from '../../assets/images/owl.png';
import { Home as HomeIcon, Compass, TrendingUp, Trophy, ClipboardCheck, LogOut, Mic, BookOpen, ShieldCheck, Users, Bell, CreditCard, Award, HelpCircle, Lock } from 'lucide-react';
import { useLearner } from '../../services/LearnerContext';
import useTranslate from '../../services/useTranslate';
import styles from './Sidebar.module.css';

const AVATAR_EMOJI = {
  boy: '👦', girl: '👧', grandmother: '👵', grandfather: '👴',
  teacher: '🧑‍🏫', book: '📖', lion: '🦁', tiger: '🐯',
  apple: '🍎', flower: '🌸', star: '⭐', migo: '🦊',
};

const menuItems = [
  { title: 'Adventure Map', key: 'adventureMap', icon: HomeIcon, route: '/home' },
  { title: 'Learn (Review)', key: 'learnReview', icon: BookOpen, route: '/learn' },
  { title: 'Roadmap & Curriculum', key: 'roadmapCurriculum', icon: Compass, route: '/roadmap' },
  { title: 'AI Score Prediction', key: 'aiScorePrediction', icon: TrendingUp, route: '/prediction' },
  { title: 'Pronunciation Practice', key: 'pronunciationPractice', icon: Mic, route: '/pronunciation' },
  { title: 'Trophy Room', key: 'trophyRoom', icon: Trophy, route: '/dashboard' },
  { title: 'Assessments', key: 'assessments', icon: ClipboardCheck, route: '/assessment/reading' },
  { title: 'Library', key: 'library', icon: BookOpen, route: '/library' },
  { title: 'Community', key: 'community', icon: Users, route: '/community' },
  { title: 'Notifications', key: 'notifications', icon: Bell, route: '/notifications' },
  { title: 'Certifications', key: 'certifications', icon: Award, route: '/certifications' },
  { title: 'Help & Support', key: 'helpSupport', icon: HelpCircle, route: '/support' },
];

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslate();
  const { learner, hasFeatureAccess } = useLearner();

  return (
    <>
      <div className={styles.sidebarSpacer} />
      <aside className={styles.sidebar}>
        {/* Logo Group */}
        <div className={styles.logoBox} onClick={() => navigate('/home')}>
          <img src={owl} alt="MiGo Owl" className={styles.logoImg} />
          <div>
            <h2 className={styles.logoTitle}>MiGo</h2>
            <span className={styles.logoSub}>{t('adventureMap')}</span>
          </div>
        </div>

        {/* Nav Menu */}
        <nav className={styles.navMenu}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.route;

            let isLocked = false;
            if (learner) {
              if (item.key === 'aiScorePrediction') {
                isLocked = !hasFeatureAccess('Pro');
              } else if (item.key === 'certifications') {
                isLocked = !hasFeatureAccess('Premium');
              }
            }

            return (
              <button
                key={item.title}
                className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}
                onClick={() => navigate(item.route)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={22} />
                  <span>{t(item.key)}</span>
                </div>
                {isLocked && <Lock size={14} style={{ color: 'var(--text-light)', opacity: 0.7 }} />}
              </button>
            );
          })}
        </nav>

        {/* Keep it up widget card */}
        <div className={styles.sidebarCard}>
          <div className={styles.sidebarCardHeader}>
            <ShieldCheck size={18} color="#FF7A00" />
            <span>Keep it up!</span>
          </div>
          <p className={styles.sidebarCardSub}>You are doing better than yesterday.</p>
          <svg width="100%" height="40" viewBox="0 0 120 40" style={{ marginTop: '8px' }}>
            <path
              d="M5,35 Q20,15 40,25 T80,10 T115,5"
              fill="none"
              stroke="#FF7A00"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="115" cy="5" r="4.5" fill="#FF7A00" />
          </svg>
        </div>

        {/* Profile Progress Card */}
        {learner && (
          <div className={styles.profileCard}>
            <span className={styles.profileEmoji}>
              {AVATAR_EMOJI[learner.avatar] || '🦊'}
            </span>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{learner.name}</span>
              <span className={styles.profileLevel}>
                {learner.level || 'beginner'} Level
              </span>
              <span className={styles.profileTier}>
                Tier: {learner.subscription_tier || 'Free'}
              </span>
            </div>
          </div>
        )}

        {/* Logout */}
        <button className={styles.logoutBtn} onClick={onLogout}>
          <LogOut size={20} />
          <span>{t('exitGame')}</span>
        </button>
      </aside>
    </>
  );
}