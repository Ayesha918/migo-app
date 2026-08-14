// src/components/Extra/Support.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearner } from '../../services/LearnerContext';
import { submitSupportTicket } from '../../services/api';
import Sidebar from '../Home/Sidebar';
import Header from '../Home/Header';
import { 
  Search, ArrowLeft, Mail, Play, FileText, Video, ExternalLink, 
  HelpCircle, X, MessageSquare, Check, ArrowRight, BookOpen, Users, Compass 
} from 'lucide-react';
import styles from './Extra.module.css';

const FAQS = [
  { q: 'How do I start my first lesson?', a: 'Go to Lessons from the sidebar, pick a Beginner lesson, and tap Start Lesson. Progress saves automatically.' },
  { q: 'How does voice learning work?', a: 'Tap the microphone icon when asked to speak. Pronounce the words clearly in the language of the lesson. The browser speech engine will check your voice pronunciation locally.' },
  { q: 'How do I earn XP and badges?', a: 'You earn XP points by completing daily roadmap lessons, quizzes, and writing exercises. Level benchmarks unlock custom certificates.' },
  { q: 'Can I track my progress?', a: 'Yes! View the Roadmap & Curriculum screen or check the AI Score Prediction page to see real-time forecasts of your performance.' },
  { q: 'How do I use Study Groups?', a: 'Go to the Community tab in the sidebar! You can join or create groups, practice regional vocabulary, and chat with other learners.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use verified phone numbers for passwordless access recovery, and we never share your progress data with external services.' }
];

export default function Support() {
  const { learner, logout } = useLearner();
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);
  
  // Contact Form states
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Search state
  const [faqSearchQuery, setFaqSearchQuery] = useState('');

  // Modal view states
  const [activeModal, setActiveModal] = useState(null); // 'getting-started' | 'videos' | 'documentation' | null
  const [simulatedVideo, setSimulatedVideo] = useState(null);

  // Floating MiGo Helper states
  const [isHelperOpen, setIsHelperOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'migo',
      text: "Hi there! 🦉 I'm MiGo, your learning buddy. Click any of the help options below, and I'll explain how it works!"
    }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isHelperOpen]);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    submitSupportTicket({
      learner_id: learner?.learner_id,
      subject: subject.trim(),
      message: message.trim()
    })
      .then(() => {
        setSuccess('Thank you! Your ticket has been logged. We will get back to you within 24 hours.');
        setSubject('');
        setMessage('');
        setTimeout(() => setSuccess(''), 6000);
      })
      .catch(err => {
        console.error('Failed to submit ticket:', err);
        setSuccess('Failed to submit ticket. Please check backend connection.');
      })
      .finally(() => setSubmitting(false));
  };

  // Filtered FAQs based on query
  const filteredFaqs = FAQS.filter(faq => 
    faq.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(faqSearchQuery.toLowerCase())
  );

  // MiGo helper responses
  const HELPER_OPTIONS = [
    {
      q: 'How do I start a lesson?',
      a: 'Simply go to your Dashboard (Roadmap), click on any active module block (like Level 1 or 2), and tap the "Start Lesson" button. Progress is saved automatically!'
    },
    {
      q: 'How does voice learning work?',
      a: 'In pronunciation lessons, tap the speaker icon to hear the reference audio, then tap the mic icon and speak clearly close to your microphone. The AI checks your accuracy!'
    },
    {
      q: 'How do I earn XP?',
      a: 'You earn XP (Experience Points) by completing interactive lessons, reading fables in the Library, and scoring correctly in assessment quizzes!'
    },
    {
      q: 'How do I use Study Groups?',
      a: 'Click the "Community" item in the sidebar! You can join discussion threads, practice writing regional words, and collaborate with other classmates.'
    }
  ];

  const handleHelperOption = (option) => {
    // Add user question
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: option.q
    };
    
    // Add migo answer after delay
    setChatMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const migoMsg = {
        id: Date.now() + 1,
        sender: 'migo',
        text: option.a
      };
      setChatMessages(prev => [...prev, migoMsg]);
    }, 400);
  };

  const handlePlayVideo = (title) => {
    setSimulatedVideo(title);
    setTimeout(() => {
      setSimulatedVideo(null);
      alert(`Simulation completed! Checked playback of: "${title}"`);
    }, 3500);
  };

  return (
    <div className={styles.pageLayout} style={{ position: 'relative' }}>
      <Sidebar onLogout={logout} />
      <main className={styles.mainContent}>
        <Header />

        {/* Header Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div className={styles.headerArea} style={{ margin: 0, padding: 0, backgroundColor: 'transparent', border: 'none' }}>
            <span className={styles.headerIcon}>❓</span>
            <div className={styles.headerMeta}>
              <h2>Help & Support</h2>
              <p>Find answers and get the help you need</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '20px',
                border: '2.5px solid var(--color-peach)',
                backgroundColor: '#FFFFFF',
                color: 'var(--color-orange-dark)',
                fontSize: '13.5px',
                fontWeight: 900,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              type="button"
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </button>
            
            <button
              onClick={() => window.location.href = 'mailto:support@migoapp.com?subject=MiGo%20Support%20Request'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: 'var(--color-orange)',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 900,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              type="button"
            >
              <Mail size={16} />
              <span>Contact Support</span>
            </button>
          </div>
        </div>

        <div className={styles.supportGrid}>
          {/* Quick Guides cards row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {/* Card 1 */}
            <div 
              className={styles.sectionBox} 
              style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', transition: 'transform 0.15s ease', border: '3px solid var(--color-peach-light)' }}
              onClick={() => setActiveModal('getting-started')}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '28px' }}>📖</span>
              <h4 style={{ fontWeight: 850, color: 'var(--color-orange-dark)' }}>Getting Started Guide</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Learn the basics of using MiGo app.</p>
              <span style={{ marginTop: 'auto', fontSize: '12px', fontWeight: 900, color: 'var(--color-orange)' }}>Open Guide ➔</span>
            </div>
            
            {/* Card 2 */}
            <div 
              className={styles.sectionBox} 
              style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', transition: 'transform 0.15s ease', border: '3px solid var(--color-peach-light)' }}
              onClick={() => setActiveModal('videos')}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '28px' }}>🎥</span>
              <h4 style={{ fontWeight: 850, color: 'var(--color-orange-dark)' }}>Video Tutorials</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Watch step-by-step video guides.</p>
              <span style={{ marginTop: 'auto', fontSize: '12px', fontWeight: 900, color: 'var(--color-orange)' }}>Watch Videos ➔</span>
            </div>

            {/* Card 3 */}
            <div 
              className={styles.sectionBox} 
              style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', transition: 'transform 0.15s ease', border: '3px solid var(--color-peach-light)' }}
              onClick={() => navigate('/community')}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '28px' }}>👥</span>
              <h4 style={{ fontWeight: 850, color: 'var(--color-orange-dark)' }}>Community Forum</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Connect with other student learners.</p>
              <span style={{ marginTop: 'auto', fontSize: '12px', fontWeight: 900, color: 'var(--color-orange)' }}>Join Discussion ➔</span>
            </div>

            {/* Card 4 */}
            <div 
              className={styles.sectionBox} 
              style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', transition: 'transform 0.15s ease', border: '3px solid var(--color-peach-light)' }}
              onClick={() => setActiveModal('documentation')}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '28px' }}>📄</span>
              <h4 style={{ fontWeight: 850, color: 'var(--color-orange-dark)' }}>Documentation</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Read detailed grammar & spelling guides.</p>
              <span style={{ marginTop: 'auto', fontSize: '12px', fontWeight: 900, color: 'var(--color-orange)' }}>Read Docs ➔</span>
            </div>
          </div>

          {/* FAQ Accordions with Search bar */}
          <div className={styles.sectionBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '2.5px dashed var(--color-peach)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ border: 'none', margin: 0, padding: 0 }}>🚩 Frequently Asked Questions</h3>
              
              {/* Dynamic FAQ Search Input */}
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-orange)' }} />
                <input
                  type="text"
                  placeholder="Search FAQs by keywords..."
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '20px',
                    border: '2px solid var(--color-peach)',
                    fontSize: '13px',
                    fontWeight: 750,
                    outline: 'none'
                  }}
                />
                {faqSearchQuery && (
                  <button
                    onClick={() => setFaqSearchQuery('')}
                    style={{ position: 'absolute', right: '10px', top: '8px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    type="button"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Display list of FAQs */}
            <div className={styles.faqList}>
              {filteredFaqs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontWeight: 750, fontSize: '14.5px' }}>
                  🔍 No matching questions found for "{faqSearchQuery}". Try using other keywords like 'voice', 'lesson', or 'XP'.
                </div>
              ) : (
                filteredFaqs.map((faq, idx) => {
                  const isOpen = openIndex === idx;
                  return (
                    <div key={idx} className={styles.faqItem} style={{ border: isOpen ? '2px solid var(--color-orange)' : '2px solid var(--color-peach-light)' }}>
                      <button className={styles.faqHeader} onClick={() => toggleFaq(idx)} type="button">
                        <span style={{ fontWeight: 850 }}>{faq.q}</span>
                        <span style={{ color: 'var(--color-orange)', fontWeight: 900 }}>{isOpen ? '▲' : '▼'}</span>
                      </button>
                      {isOpen && (
                        <div className={styles.faqAnswer}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Contact support ticket logging form */}
          <div className={styles.sectionBox}>
            <h3>✉️ Open a Support Ticket</h3>
            {success && (
              <div style={{ padding: '12px 16px', backgroundColor: success.includes('Failed') ? '#FFEAEB' : '#E8FAEF', color: success.includes('Failed') ? '#FF4757' : '#27AE60', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: '14px', marginBottom: '16px' }}>
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
              <button className={styles.submitBtn} type="submit" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        {/* MODAL 1: GETTING STARTED */}
        {activeModal === 'getting-started' && (
          <div className={styles.certModalOverlay} onClick={() => setActiveModal(null)}>
            <div className={styles.certModalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', border: '5px double var(--color-peach)', padding: '30px' }}>
              <button className={styles.certModalClose} onClick={() => setActiveModal(null)} type="button">&times;</button>
              
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '42px' }}>📖</span>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-orange-dark)', marginTop: '8px' }}>Getting Started with MiGo</h2>
                <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Follow these simple steps to begin your learning adventure!</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-peach-light)', color: 'var(--color-orange)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>1</div>
                  <div>
                    <h5 style={{ fontSize: '15px', fontWeight: 850, color: 'var(--text-dark)', margin: '0 0 2px 0' }}>Explore the Learning Roadmap</h5>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>Open your Dashboard to view the level nodes. Complete lessons in order to level up your literacy skills.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-peach-light)', color: 'var(--color-orange)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>2</div>
                  <div>
                    <h5 style={{ fontSize: '15px', fontWeight: 850, color: 'var(--text-dark)', margin: '0 0 2px 0' }}>Complete Interactive Lessons</h5>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>Click on an unlocked roadmap block, pick a lesson topic, read carefully, and answer quiz assessments.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-peach-light)', color: 'var(--color-orange)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>3</div>
                  <div>
                    <h5 style={{ fontSize: '15px', fontWeight: 850, color: 'var(--text-dark)', margin: '0 0 2px 0' }}>Speak Aloud with Voice Synthesis</h5>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>Tap microphone buttons in pronunciation exercises to speak. The system rates your accuracy instantly!</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-peach-light)', color: 'var(--color-orange)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>4</div>
                  <div>
                    <h5 style={{ fontSize: '15px', fontWeight: 850, color: 'var(--text-dark)', margin: '0 0 2px 0' }}>Unlock Certificates & Track Progress</h5>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>Review forecasts on the Predictions page, check your daily milestones, and unlock official certificates.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: VIDEO TUTORIALS */}
        {activeModal === 'videos' && (
          <div className={styles.certModalOverlay} onClick={() => setActiveModal(null)}>
            <div className={styles.certModalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', border: '5px double var(--color-peach)', padding: '30px' }}>
              <button className={styles.certModalClose} onClick={() => setActiveModal(null)} type="button">&times;</button>
              
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '42px' }}>🎥</span>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-orange-dark)', marginTop: '8px' }}>Video Tutorials</h2>
                <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Watch quick guides on how to use MiGo features effectively!</p>
              </div>

              {simulatedVideo && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#FFF2E6',
                  border: '2px solid var(--color-orange)',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  color: 'var(--color-orange-dark)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-orange)', animation: 'pulse 1.2s infinite' }} />
                  <span>Loading simulated video walkthrough: "{simulatedVideo}"...</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {/* Video item 1 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1.5px solid var(--color-peach-light)', borderRadius: '12px', textAlign: 'left', backgroundColor: '#FFFFFF' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-peach-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Play size={20} color="var(--color-orange)" fill="var(--color-orange)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontSize: '14.5px', fontWeight: 850, margin: '0 0 2px 0', color: 'var(--text-dark)' }}>Video 1: Complete App Tour (2:30)</h5>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 650, margin: 0 }}>Learn how to navigate the dashboard roadmap, library, and support pages.</p>
                  </div>
                  <button 
                    onClick={() => handlePlayVideo('Complete App Tour')}
                    style={{ padding: '6px 12px', borderRadius: '12px', border: '2px solid var(--color-orange)', color: 'var(--color-orange)', backgroundColor: 'transparent', fontWeight: 850, fontSize: '11px', cursor: 'pointer' }}
                    type="button"
                  >
                    Play
                  </button>
                </div>

                {/* Video item 2 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1.5px solid var(--color-peach-light)', borderRadius: '12px', textAlign: 'left', backgroundColor: '#FFFFFF' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-peach-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Play size={20} color="var(--color-orange)" fill="var(--color-orange)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontSize: '14.5px', fontWeight: 850, margin: '0 0 2px 0', color: 'var(--text-dark)' }}>Video 2: Voice Phonics Practice (3:15)</h5>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 650, margin: 0 }}>Tips for clear voice pronunciation checking in Indian regional languages.</p>
                  </div>
                  <button 
                    onClick={() => handlePlayVideo('Voice Phonics Practice')}
                    style={{ padding: '6px 12px', borderRadius: '12px', border: '2px solid var(--color-orange)', color: 'var(--color-orange)', backgroundColor: 'transparent', fontWeight: 850, fontSize: '11px', cursor: 'pointer' }}
                    type="button"
                  >
                    Play
                  </button>
                </div>

                {/* Video item 3 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1.5px solid var(--color-peach-light)', borderRadius: '12px', textAlign: 'left', backgroundColor: '#FFFFFF' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-peach-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Play size={20} color="var(--color-orange)" fill="var(--color-orange)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontSize: '14.5px', fontWeight: 850, margin: '0 0 2px 0', color: 'var(--text-dark)' }}>Video 3: Certifications & Predictions (1:45)</h5>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 650, margin: 0 }}>How to unlock credentials and check your RandomForest ML timeline.</p>
                  </div>
                  <button 
                    onClick={() => handlePlayVideo('Certifications & Predictions')}
                    style={{ padding: '6px 12px', borderRadius: '12px', border: '2px solid var(--color-orange)', color: 'var(--color-orange)', backgroundColor: 'transparent', fontWeight: 850, fontSize: '11px', cursor: 'pointer' }}
                    type="button"
                  >
                    Play
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: DOCUMENTATION */}
        {activeModal === 'documentation' && (
          <div className={styles.certModalOverlay} onClick={() => setActiveModal(null)}>
            <div className={styles.certModalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', border: '5px double var(--color-peach)', padding: '30px' }}>
              <button className={styles.certModalClose} onClick={() => setActiveModal(null)} type="button">&times;</button>
              
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '42px' }}>📄</span>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-orange-dark)', marginTop: '8px' }}>MiGo Documentation</h2>
                <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Read guides on literacy concepts and voice engine parameters.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', maxHeight: '450px', overflowY: 'auto', paddingRight: '6px' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--color-orange-dark)', borderBottom: '1.5px dashed var(--color-peach-light)', paddingBottom: '4px', margin: '0 0 8px 0' }}>📖 Reading Comprehension Guidelines</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 650, lineHeight: 1.5, margin: 0 }}>
                    Our library contains multi-page fables translated across regional BCP-47 language codes (English, Hindi, Kannada, Tamil). For best results, encourage learners to split fables page-by-page and complete quizzes after reading.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--color-orange-dark)', borderBottom: '1.5px dashed var(--color-peach-light)', paddingBottom: '4px', margin: '0 0 8px 0' }}>🎙️ Voice Phonics Synthesis & Recognition</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 650, lineHeight: 1.5, margin: 0 }}>
                    MiGo features browser Web Speech API bindings. Pronunciation tutor checkpoints matching target characters/syllables expect clear, slow speech input. Check browser mic permissions if check boxes fail to load.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--color-orange-dark)', borderBottom: '1.5px dashed var(--color-peach-light)', paddingBottom: '4px', margin: '0 0 8px 0' }}>🏆 Experience Points (XP) & Certificates Rules</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 650, lineHeight: 1.5, margin: 0 }}>
                    * **Placement Certificate**: Granted instantly upon initial evaluation setup.<br />
                    * **Perfect Starter Certificate**: Granted when a student completes 3 active roadmap lessons and logs 15 minutes of learning time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING MIGO HELPER CHATBOT CHATBOX */}
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999 }}>
          {/* Chat Bubble trigger button */}
          <button
            onClick={() => setIsHelperOpen(!isHelperOpen)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-orange)',
              color: '#FFFFFF',
              border: '4px solid #FFFFFF',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            type="button"
          >
            {isHelperOpen ? <X size={24} /> : <MessageSquare size={24} />}
          </button>

          {/* Floating Chat Box Panel */}
          {isHelperOpen && (
            <div 
              style={{
                position: 'absolute',
                bottom: '76px',
                right: '0',
                width: '330px',
                height: '430px',
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '3.5px solid var(--color-peach)',
                boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* Chat Header */}
              <div style={{
                padding: '12px 16px',
                background: 'linear-gradient(135deg, var(--color-orange) 0%, var(--color-orange-dark) 100%)',
                color: '#FFFFFF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🦉</span>
                  <span style={{ fontWeight: 900, fontSize: '14.5px' }}>MiGo AI Helper</span>
                </div>
                <button
                  onClick={() => setIsHelperOpen(false)}
                  style={{ border: 'none', background: 'none', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Chat Messages Body */}
              <div style={{
                flex: 1,
                padding: '12px',
                overflowY: 'auto',
                backgroundColor: '#FAF8F5',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    style={{
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      backgroundColor: msg.sender === 'user' ? 'var(--color-peach-light)' : '#FFFFFF',
                      color: 'var(--text-dark)',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      borderTopRightRadius: msg.sender === 'user' ? '2px' : '12px',
                      borderTopLeftRadius: msg.sender === 'migo' ? '2px' : '12px',
                      maxWidth: '85%',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      lineHeight: 1.4,
                      border: '1.5px solid var(--color-peach-light)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    {msg.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Predefined Options Footer */}
              <div style={{
                padding: '12px',
                borderTop: '2px dashed var(--color-peach-light)',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                  Choose a question to ask:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {HELPER_OPTIONS.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleHelperOption(opt)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '10px',
                        border: '1.5px solid var(--color-peach-light)',
                        backgroundColor: '#FFFDF9',
                        color: 'var(--color-orange-dark)',
                        fontSize: '11px',
                        fontWeight: 800,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-peach-light)';
                        e.currentTarget.style.borderColor = 'var(--color-orange)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFDF9';
                        e.currentTarget.style.borderColor = 'var(--color-peach-light)';
                      }}
                      type="button"
                      title={opt.q}
                    >
                      {opt.q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
