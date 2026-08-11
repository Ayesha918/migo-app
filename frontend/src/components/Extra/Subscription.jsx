// src/components/Extra/Subscription.jsx
import { useState } from 'react';
import { useLearner } from '../../services/LearnerContext';
import Sidebar from '../Home/Sidebar';
import Header from '../Home/Header';
import { Check, ShieldCheck } from 'lucide-react';
import styles from './Extra.module.css';

export default function Subscription() {
  const { logout } = useLearner();
  const [activePlan, setActivePlan] = useState('Free');
  const [success, setSuccess] = useState('');

  const handleUpgrade = (planName) => {
    if (planName === activePlan) return;
    setSuccess(`Successfully subscribed to ${planName} Plan! Sandbox checkout completed via Stripe.`);
    setActivePlan(planName);
    setTimeout(() => setSuccess(''), 5000);
  };

  return (
    <div className={styles.pageLayout}>
      <Sidebar onLogout={logout} />
      <main className={styles.mainContent}>
        <Header />

        <div className={styles.headerArea}>
          <span className={styles.headerIcon}>💳</span>
          <div className={styles.headerMeta}>
            <h2>Subscription Plans</h2>
            <p>Choose the plan that fits your language learning journey</p>
          </div>
        </div>

        {success && (
          <div style={{ padding: '12px 16px', backgroundColor: '#E8FAEF', color: '#27AE60', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: '14px' }}>
            {success}
          </div>
        )}

        <div className={styles.subGrid}>
          {/* Free Tier */}
          <div className={styles.subCard}>
            <div className={styles.subHeader}>
              <h4>Free</h4>
              <div className={styles.subPrice}>
                ₹0 <span>/ forever</span>
              </div>
            </div>
            <ul className={styles.subBulletList}>
              <li className={styles.subBulletItem}>
                <Check size={16} className={styles.subBulletIcon} />
                <span>Access to 20+ beginner lessons</span>
              </li>
              <li className={styles.subBulletItem}>
                <Check size={16} className={styles.subBulletIcon} />
                <span>Basic progress tracking</span>
              </li>
              <li className={styles.subBulletItem}>
                <Check size={16} className={styles.subBulletIcon} />
                <span>AI Assistant (5 messages/day)</span>
              </li>
              <li className={styles.subBulletItem}>
                <Check size={16} className={styles.subBulletIcon} />
                <span>Community access</span>
              </li>
              <li className={styles.subBulletItem}>
                <Check size={16} className={styles.subBulletIcon} />
                <span>Daily streak tracking</span>
              </li>
            </ul>
            <button
              className={`${styles.subBtn} ${activePlan === 'Free' ? styles.subBtnActive : ''}`}
              onClick={() => handleUpgrade('Free')}
              disabled={activePlan === 'Free'}
              type="button"
            >
              {activePlan === 'Free' ? 'Current Plan' : 'Select Free'}
            </button>
          </div>

          {/* Pro Tier */}
          <div className={`${styles.subCard} ${styles.subCardPopular}`}>
            <span className={styles.popularBadge}>Most Popular</span>
            <div className={styles.subHeader}>
              <h4>Pro</h4>
              <div className={styles.subPrice}>
                ₹499 <span>/ month</span>
              </div>
            </div>
            <ul className={styles.subBulletList}>
              <li className={styles.subBulletItem}>
                <Check size={16} className={styles.subBulletIcon} />
                <span>Unlimited lessons (all levels)</span>
              </li>
              <li className={styles.subBulletItem}>
                <Check size={16} className={styles.subBulletIcon} />
                <span>Full analytics & reports</span>
              </li>
              <li className={styles.subBulletItem}>
                <Check size={16} className={styles.subBulletIcon} />
                <span>AI Assistant (unlimited)</span>
              </li>
              <li className={styles.subBulletItem}>
                <Check size={16} className={styles.subBulletIcon} />
                <span>Voice learning & pronunciation</span>
              </li>
              <li className={styles.subBulletItem}>
                <Check size={16} className={styles.subBulletIcon} />
                <span>All gamification features</span>
              </li>
              <li className={styles.subBulletItem}>
                <Check size={16} className={styles.subBulletIcon} />
                <span>Priority support</span>
              </li>
            </ul>
            <button
              className={`${styles.subBtn} ${activePlan === 'Pro' ? styles.subBtnActive : ''}`}
              onClick={() => handleUpgrade('Pro')}
              type="button"
            >
              {activePlan === 'Pro' ? 'Current Plan ✓' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* Premium Tier */}
          <div className={styles.subCard}>
            <div className={styles.subHeader}>
              <h4>Premium</h4>
              <div className={styles.subPrice}>
                ₹999 <span>/ month</span>
              </div>
            </div>
            <ul className={styles.subBulletList}>
              <li className={styles.subBulletItem}>
                <Check size={16} className={styles.subBulletIcon} />
                <span>Everything in Pro</span>
              </li>
              <li className={styles.subBulletItem}>
                <Check size={16} className={styles.subBulletIcon} />
                <span>1-on-1 AI tutoring sessions</span>
              </li>
              <li className={styles.subBulletItem}>
                <Check size={16} className={styles.subBulletIcon} />
                <span>Custom learning paths</span>
              </li>
              <li className={styles.subBulletItem}>
                <Check size={16} className={styles.subBulletIcon} />
                <span>Advanced pronunciation analysis</span>
              </li>
              <li className={styles.subBulletItem}>
                <Check size={16} className={styles.subBulletIcon} />
                <span>Exportable certificates</span>
              </li>
              <li className={styles.subBulletItem}>
                <Check size={16} className={styles.subBulletIcon} />
                <span>Early access to new features</span>
              </li>
            </ul>
            <button
              className={`${styles.subBtn} ${activePlan === 'Premium' ? styles.subBtnActive : ''}`}
              onClick={() => handleUpgrade('Premium')}
              type="button"
            >
              {activePlan === 'Premium' ? 'Current Plan ✓' : 'Upgrade to Premium'}
            </button>
          </div>
        </div>

        <div className={styles.stripeInfoBox}>
          <ShieldCheck size={20} color="#27AE60" />
          <span>
            <strong>Secure Payments by Stripe</strong> — Subscriptions renew monthly and can be cancelled anytime. Test mode is active — use card <strong>4242 4242 4242 4242</strong>.
          </span>
        </div>
      </main>
    </div>
  );
}
