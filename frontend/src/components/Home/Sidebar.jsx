// src/components/Home/Sidebar.jsx

import { useNavigate, useLocation } from 'react-router-dom';
import owl from '../../assets/images/owl.png';
import { Home as HomeIcon, Compass, TrendingUp, Trophy, ClipboardCheck, LogOut, Mic, BookOpen } from 'lucide-react';
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

      {/* Logout */}
      <button className={styles.logoutBtn} onClick={onLogout}>
        <LogOut size={20} />
        <span>{t('exitGame')}</span>
      </button>
    </aside>
  );
}