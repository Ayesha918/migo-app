// src/components/Home/Header.jsx

import styles from './Header.module.css';
import { Flame, Star, Coins, Zap } from 'lucide-react';
import { useLearner } from '../../services/LearnerContext';

const AVATAR_EMOJI = {
  boy: '👦', girl: '👧', grandmother: '👵', grandfather: '👴',
  teacher: '🧑‍🏫', book: '📖', lion: '🦁', tiger: '🐯',
  apple: '🍎', flower: '🌸', star: '⭐', migo: '🦊',
};

export default function Header({ learner: propLearner, rewards, dashboard }) {
  const { learner: contextLearner } = useLearner();
  const learner = propLearner || contextLearner;

  const streak = dashboard?.streak ?? 1;
  const profile = rewards?.profile || {};

  const stars = profile.total_stars || 0;
  const coins = profile.coins || 0;
  const xp = profile.total_xp || 0;

  const avatarDisplay = AVATAR_EMOJI[learner?.avatar] || learner?.name?.charAt(0)?.toUpperCase() || '⭐';

  const activePlan = learner?.subscription_tier || 'Free';
  const planColor = activePlan === 'Premium' ? 'var(--color-purple)' : activePlan === 'Pro' ? 'var(--color-orange)' : 'var(--text-light)';
  const planBg = activePlan === 'Premium' ? '#F4F0FF' : activePlan === 'Pro' ? 'var(--color-peach-light)' : '#F1F2F6';

  return (
    <header className={styles.header}>
      {/* Learner Profile Chip */}
      <div className={styles.profileChip}>
        <div className={styles.avatarCircle}>{avatarDisplay}</div>
        <div className={styles.profileMeta}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0 }}>{learner?.name || 'Explorer'}</h3>
            <span style={{
              fontSize: '10px',
              fontWeight: 900,
              color: planColor,
              backgroundColor: planBg,
              border: `1.5px solid ${planColor}`,
              padding: '2px 8px',
              borderRadius: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              display: 'inline-block'
            }}>{activePlan}</span>
          </div>
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