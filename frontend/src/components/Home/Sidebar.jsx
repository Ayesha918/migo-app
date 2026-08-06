// src/components/Home/Sidebar.jsx

import { useNavigate, useLocation } from 'react-router-dom';
import owl from '../../assets/images/owl.png';
import { Home as HomeIcon, Compass, TrendingUp, Trophy, ClipboardCheck, LogOut, Mic, BookOpen } from 'lucide-react';
import styles from './Sidebar.module.css';

const menuItems = [
  { title: 'Adventure Map', icon: HomeIcon, route: '/home' },
  { title: 'Learn (Review)', icon: BookOpen, route: '/learn' },
  { title: 'Roadmap & Curriculum', icon: Compass, route: '/roadmap' },
  { title: 'AI Score Prediction', icon: TrendingUp, route: '/prediction' },
  { title: 'Pronunciation Practice', icon: Mic, route: '/pronunciation' },
  { title: 'Trophy Room', icon: Trophy, route: '/dashboard' },
  { title: 'Assessments', icon: ClipboardCheck, route: '/assessment/reading' },
];

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className={styles.sidebar}>
      {/* Logo Group */}
      <div className={styles.logoBox} onClick={() => navigate('/home')}>
        <img src={owl} alt="MiGo Owl" className={styles.logoImg} />
        <div>
          <h2 className={styles.logoTitle}>MiGo</h2>
          <span className={styles.logoSub}>Adventure Platform</span>
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
              <span>{item.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <button className={styles.logoutBtn} onClick={onLogout}>
        <LogOut size={20} />
        <span>Exit Game</span>
      </button>
    </aside>
  );
}