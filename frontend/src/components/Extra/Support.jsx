// src/components/Extra/Support.jsx
import { useState } from 'react';
import { useLearner } from '../../services/LearnerContext';
import Sidebar from '../Home/Sidebar';
import Header from '../Home/Header';
import styles from './Extra.module.css';

const FAQS = [
  { q: 'How do I start my first lesson?', a: 'Go to Lessons from the sidebar, pick a Beginner lesson, and tap Start Lesson. Progress saves automatically.' },
  { q: 'How does voice learning work?', a: 'Tap the microphone icon when asked to speak. Pronounce the words clearly in the language of the lesson. The browser speech engine will check your voice pronunciation locally.' },
  { q: 'How do I earn XP and badges?', a: 'You earn XP points by completing daily roadmap lessons, quizzes, and writing exercises. Level benchmarks unlock custom certificates.' },
  { q: 'Can I track my progress?', a: 'Yes! View the Roadmap & Curriculum screen or check the AI Score Prediction page to see real-time forecasts of your performance.' },
  { q: 'How do I change my subscription?', a: 'You can change your tier level on the Subscriptions page from the sidebar. Changes are processed instantly.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use verified phone numbers for passwordless access recovery, and we never share your progress data with external services.' }
];

export default function Support() {
  const { logout } = useLearner();
  const [openIndex, setOpenIndex] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSuccess('Thank you! Your message has been sent successfully. We will get back to you within 24 hours.');
    setSubject('');
    setMessage('');
    setTimeout(() => setSuccess(''), 5000);
  };

  return (
    <div className={styles.pageLayout}>
      <Sidebar onLogout={logout} />
      <main className={styles.mainContent}>
        <Header />

        <div className={styles.headerArea}>
          <span className={styles.headerIcon}>❓</span>
          <div className={styles.headerMeta}>
            <h2>Help & Support</h2>
            <p>Find answers and get the help you need</p>
          </div>
        </div>

        <div className={styles.supportGrid}>
          {/* Quick Guides cards row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className={styles.sectionBox} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>📖</span>
              <h4 style={{ fontWeight: 800 }}>Getting Started Guide</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Learn the basics of using MiGo app.</p>
            </div>
            <div className={styles.sectionBox} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🎥</span>
              <h4 style={{ fontWeight: 800 }}>Video Tutorials</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Watch step-by-step video guides.</p>
            </div>
            <div className={styles.sectionBox} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>👥</span>
              <h4 style={{ fontWeight: 800 }}>Community Forum</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Connect with other student learners.</p>
            </div>
            <div className={styles.sectionBox} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>📄</span>
              <h4 style={{ fontWeight: 800 }}>Documentation</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Read detailed grammar & spelling guides.</p>
            </div>
          </div>

          {/* FAQ Accordions */}
          <div className={styles.sectionBox}>
            <h3>🚩 Frequently Asked Questions</h3>
            <div className={styles.faqList}>
              {FAQS.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div key={idx} className={styles.faqItem}>
                    <button className={styles.faqHeader} onClick={() => toggleFaq(idx)} type="button">
                      <span>{faq.q}</span>
                      <span>{isOpen ? '▲' : '▼'}</span>
                    </button>
                    {isOpen && (
                      <div className={faq.q === FAQS[1].q ? `${styles.faqAnswer} faq-voice` : styles.faqAnswer}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact support */}
          <div className={styles.sectionBox}>
            <h3>✉️ Contact Support</h3>
            {success && (
              <div style={{ padding: '12px 16px', backgroundColor: '#E8FAEF', color: '#27AE60', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: '14px', marginBottom: '16px' }}>
                {success}
              </div>
            )}
            <form onSubmit={handleSendMessage}>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Subject</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="What do you need help with?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Describe your issue or question</label>
                <textarea
                  className={styles.formTextarea}
                  rows={4}
                  placeholder="Type details of your issue..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <button className={styles.submitBtn} type="submit">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
