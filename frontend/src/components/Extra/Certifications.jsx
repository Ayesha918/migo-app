// src/components/Extra/Certifications.jsx
import { useState } from 'react';
import { useLearner } from '../../services/LearnerContext';
import Sidebar from '../Home/Sidebar';
import Header from '../Home/Header';
import styles from './Extra.module.css';

const MOCK_CERTIFICATES = [
  { id: 1, title: 'Beginner Placement', course: 'Reading, Writing & Comprehension', type: 'Certificate of Placement', icon: '🌱', desc: 'Successfully evaluated and matched to the Beginner level module parameters.', date: 'August 2026' },
  { id: 2, title: 'Perfect Starter', course: 'Consecutive Study Streak', type: 'Certificate of Diligence', icon: '🔥', desc: 'Awarded for maintaining study engagement and streak continuity benchmarks.', date: 'August 2026' }
];

export default function Certifications() {
  const { learner, logout } = useLearner();
  const [activeCert, setActiveCert] = useState(null);

  return (
    <div className={styles.pageLayout}>
      <Sidebar onLogout={logout} />
      <main className={styles.mainContent}>
        <Header />

        <div className={styles.headerArea}>
          <span className={styles.headerIcon}>🎓</span>
          <div className={styles.headerMeta}>
            <h2>Certifications</h2>
            <p>View and export your officially unlocked literacy course credentials</p>
          </div>
        </div>

        <div className={styles.cardsGrid}>
          {MOCK_CERTIFICATES.map(cert => (
            <div key={cert.id} className={styles.certificateCard}>
              <div className={styles.certificateStamp}>
                {cert.icon}
              </div>
              <h4 className={styles.certificateTitle}>{cert.title}</h4>
              <p className={styles.certificateSub}>{cert.type}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', fontWeight: 600 }}>
                {cert.desc}
              </p>
              <button
                className={styles.certificateBtn}
                onClick={() => setActiveCert(cert)}
                type="button"
              >
                View Credential
              </button>
            </div>
          ))}
        </div>

        {/* Modal Overlay */}
        {activeCert && (
          <div className={styles.certModalOverlay} onClick={() => setActiveCert(null)}>
            <div className={styles.certModalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.certModalClose} onClick={() => setActiveCert(null)} type="button">
                &times;
              </button>
              <div className={styles.certBadge}>{activeCert.icon}</div>
              <h1 className={styles.certMainTitle}>CERTIFICATE OF ACHIEVEMENT</h1>
              <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontWeight: 800 }}>
                This is proudly presented to
              </p>
              <h2 className={styles.certRecipient}>{learner?.name || 'Student Learner'}</h2>
              <div className={styles.certDivider}></div>
              <p className={styles.certDesc}>
                For successfully completing and unlocking the curriculum benchmarks for <strong>{activeCert.title}</strong> under the course track: <strong>{activeCert.course}</strong>.
              </p>
              <div className={styles.certDateRow}>
                <div>
                  <span style={{ display: 'block', borderBottom: '1px solid var(--color-peach)', paddingBottom: '4px', marginBottom: '4px' }}>
                    {activeCert.date}
                  </span>
                  <strong>Date Issued</strong>
                </div>
                <div>
                  <span style={{ display: 'block', borderBottom: '1px solid var(--color-peach)', paddingBottom: '4px', marginBottom: '4px', fontStyle: 'italic', fontFamily: 'serif' }}>
                    MiGo Owl
                  </span>
                  <strong>Authorized Signature</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
