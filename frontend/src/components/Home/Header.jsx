// src/components/Home/Header.jsx

import styles from './Header.module.css';
import { Flame, Star, Coins, Zap } from 'lucide-react';

const AVATAR_EMOJI = {
  boy: '👦', girl: '👧', grandmother: '👵', grandfather: '👴',
  teacher: '🧑‍🏫', book: '📖', lion: '🦁', tiger: '🐯',
  apple: '🍎', flower: '🌸', star: '⭐', migo: '🦊',
};

export default function Header({ learner, rewards, dashboard }) {
  const streak = dashboard?.streak ?? 1;
  const profile = rewards?.profile || {};

  const stars = profile.total_stars || 0;
  const coins = profile.coins || 0;
  const xp = profile.total_xp || 0;

  const avatarDisplay = AVATAR_EMOJI[learner?.avatar] || learner?.name?.charAt(0)?.toUpperCase() || '⭐';

  return (
    <header className={styles.header}>
      {/* Learner Profile Chip */}
      <div className={styles.profileChip}>
        <div className={styles.avatarCircle}>{avatarDisplay}</div>
        <div className={styles.profileMeta}>
          <h3>{learner?.name || 'Explorer'}</h3>
          <span className={styles.langTag}>{learner?.learning_language || 'English'}</span>
        </div>
      </div>

      {/* Gamified Stats Chips Bar */}
      <div className={styles.statsBar}>
        <div className={`${styles.statChip} ${styles.streakChip}`}>
          <Flame size={20} color="#FF6B35" fill="#FF6B35" />
          <span>{streak} Days</span>
        </div>

        <div className={`${styles.statChip} ${styles.starsChip}`}>
          <Star size={20} color="#FFD700" fill="#FFD700" />
          <span>{stars} Stars</span>
        </div>

        <div className={`${styles.statChip} ${styles.coinsChip}`}>
          <Coins size={20} color="#FFB400" fill="#FFB400" />
          <span>{coins} Coins</span>
        </div>

        <div className={`${styles.statChip} ${styles.xpChip}`}>
          <Zap size={20} color="#9C88FF" fill="#9C88FF" />
          <span>{xp} XP</span>
        </div>
      </div>
    </header>
  );
}