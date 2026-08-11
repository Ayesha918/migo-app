// src/components/Home/Sidebar.jsx

import { useNavigate, useLocation } from 'react-router-dom';
import owl from '../../assets/images/owl.png';
import { Home as HomeIcon, Compass, TrendingUp, Trophy, ClipboardCheck, LogOut, Mic, BookOpen, ShieldCheck } from 'lucide-react';
import useTranslate from '../../services/useTranslate';
import styles from './Sidebar.module.css';

const menuItems = [
  { title: 'Adventure Map', key: 'adventureMap', icon: HomeIcon, route: '/home' },
  { title: 'Learn (Review)', key: 'learnReview', icon: BookOpen, route: '/learn' },
  { title: 'Roadmap & Curriculum', key: 'roadmapCurriculum', icon: Compass, route: '/roadmap' },
  { title: 'AI Score Prediction', key: 'aiScorePrediction', icon: TrendingUp, route: '/prediction' },
  { title: 'Pronunciation Practice', key: 'pronunciationPractice', icon: Mic, route: '/pronunciation' },
  { title: 'Trophy Room', key: 'trophyRoom', icon: Trophy, route: '/dashboard' },
  { title: 'Assessments', key: 'assessments', icon: ClipboardCheck, route: '/assessment/reading' },
];

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslate();

  return (
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

          return (
            <button
              key={item.title}
              className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}
              onClick={() => navigate(item.route)}
            >
              <Icon size={22} />
              <span>{t(item.key)}</span>
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

      {/* Logout */}
      <button className={styles.logoutBtn} onClick={onLogout}>
        <LogOut size={20} />
        <span>{t('exitGame')}</span>
      </button>
    </aside>
  );
}