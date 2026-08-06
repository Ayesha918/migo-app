// src/components/Home/MilestoneModal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Coins, Sparkles, X, Gift } from 'lucide-react';
import treasure from '../../assets/images/treasure.png';
import gift from '../../assets/images/gift.jpeg';
import styles from './MilestoneModal.module.css';

export default function MilestoneModal({ isOpen, onClose, milestoneNumber }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.7, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>

          <div className={styles.sparkleRow}>✨ 🌟 🎉 🌟 ✨</div>

          <div className={styles.imageWrap}>
            <img src={treasure} alt="Treasure Chest" className={styles.chestImg} />
          </div>

          <h2 className={styles.title}>Milestone {milestoneNumber} Unlocked!</h2>
          <p className={styles.subtitle}>You reached a special adventure checkpoint!</p>

          <div className={styles.rewardsRow}>
            <div className={styles.rewardBadge}>
              <Coins size={28} color="#FFB400" />
              <span>+10 Coins</span>
            </div>
            <div className={styles.rewardBadge}>
              <Star size={28} color="#F7B500" />
              <span>+5 Bonus Stars</span>
            </div>
            <div className={styles.rewardBadge}>
              <Sparkles size={28} color="#9C88FF" />
              <span>Chest Badge</span>
            </div>
          </div>

          <button className={styles.claimBtn} onClick={onClose}>
            <span>Claim Rewards! 🎁</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
