// src/components/Landing/Landing.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Award, Star, ArrowRight, Sparkles, BookOpen, PenTool,
  Cpu, Mic, Target, ShieldCheck, Heart, User, CheckCircle2, ChevronDown, Check, Globe
} from 'lucide-react';
import owl from '../../assets/images/owl.png';
import styles from './Landing.module.css';

export default function Landing() {
  const navigate = useNavigate();
  
  // Interactive features states
  const [activeLang, setActiveLang] = useState(() => localStorage.getItem('migo_ui_language') || 'en');
  const [selectedToolTab, setSelectedToolTab] = useState('dictation');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  // Custom game matching state
  const [selectedWord, setSelectedWord] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [quizAnswerSelected, setQuizAnswerSelected] = useState(null);

  // Constellation map preview
  const [activeStar, setActiveStar] = useState(1);

  // Onboarding simulator state
  const [simStep, setSimStep] = useState(0); // 0: Name, 1: Age, 2: Languages, 3: Avatar, 4: Done/ID Card
  const [simName, setSimName] = useState('');
  const [simAge, setSimAge] = useState('');
  const [simKnownLang, setSimKnownLang] = useState('English');
  const [simLearnLang, setSimLearnLang] = useState('Hindi');
  const [simAvatar, setSimAvatar] = useState('🦉');
  const [simGeneratedId, setSimGeneratedId] = useState('MG000482');

  // Dictionary matching words
  const matchWords = [
    { id: '1', word: 'Apple', emoji: '🍎' },
    { id: '2', word: 'Dog', emoji: '🐶' },
    { id: '3', word: 'Sun', emoji: '☀️' }
  ];

  const handleMatchWord = (word) => {
    if (selectedWord === word) {
      setSelectedWord(null);
      return;
    }
    if (!selectedWord) {
      setSelectedWord(word);
    } else {
      // We already have a selected word, check matching
      const isMatch = (selectedWord.word === word.word);
      if (isMatch) {
        setMatchedPairs([...matchedPairs, word.word]);
      }
      setSelectedWord(null);
    }
  };

  const resetMatchGame = () => {
    setMatchedPairs([]);
    setSelectedWord(null);
  };

  return (
    <motion.div
      className={styles.landingWrapper}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ACCESS ACCESSIBILITY & HEADER NAVBAR */}
      <header className={styles.navbar}>
        <div className={styles.navLogo} onClick={() => navigate('/')}>
          <img src={owl} alt="MiGo Logo" className={styles.navLogoImg} />
          <span className={styles.navLogoText}>MiGo</span>
        </div>

        <nav className={styles.navLinks}>
          <a href="#how-it-works">How It Works</a>
          <a href="#vision">Our Mission</a>
          <a href="#skills">Skills</a>
          
          <div className={styles.langSelectContainer}>
            <button
              className={styles.langDropdownBtn}
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              type="button"
            >
              <Globe size={18} />
              <span>Language</span>
              <ChevronDown size={14} />
            </button>
            <AnimatePresence>
              {showLanguageDropdown && (
                <motion.div
                  className={styles.langDropdownMenu}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <button onClick={() => { setActiveLang('en'); localStorage.setItem('migo_ui_language', 'en'); setShowLanguageDropdown(false); }}>English</button>
                  <button onClick={() => { setActiveLang('hi'); localStorage.setItem('migo_ui_language', 'hi'); setShowLanguageDropdown(false); }}>हिन्दी (Hindi)</button>
                  <button onClick={() => { setActiveLang('kn'); localStorage.setItem('migo_ui_language', 'kn'); setShowLanguageDropdown(false); }}>ಕನ್ನಡ (Kannada)</button>
                  <button onClick={() => { setActiveLang('ta'); localStorage.setItem('migo_ui_language', 'ta'); setShowLanguageDropdown(false); }}>தமிழ் (Tamil)</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className={styles.heroSection} id="welcome">
        <div className={styles.heroContent}>
          <motion.div
            className={styles.heroBadge}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Sparkles size={16} color="#FF7A00" />
            <span>Active Gamified Language Platform</span>
          </motion.div>

          <h1 className={styles.heroTitle}>
            Welcome to <span className={styles.brandText}>MiGo</span>: Your Gamified Language Learning Adventure!
          </h1>
          
          <p className={styles.heroSubtitle}>
            MiGo makes learning a new language fun and interactive. Start your journey from the beginning and master new skills through engaging games and lessons. We'll guide you step-by-step!
          </p>

          <div className={styles.heroBtnGroup}>
            <button className={styles.heroPrimaryBtn} onClick={() => navigate('/register')}>
              <span>Start New Adventure 🦉</span>
              <ArrowRight size={20} />
            </button>
            
            <button className={styles.heroSecondaryBtn} onClick={() => navigate('/login')}>
              <span>I Already Have an ID</span>
            </button>
          </div>
        </div>

        <div className={styles.heroIllustration}>
          <div className={styles.floatingMascotContainer}>
            <motion.img
              src={owl}
              alt="MiGo Mascot Owl"
              className={styles.heroMascotImg}
              animate={{ y: [0, -16, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            />
          </div>
          <div className={styles.circleBgDecor} />
        </div>
      </section>

      {/* THE PROBLEM AND OUR VISION */}
      <section className={styles.visionSection} id="vision">
        <h2 className={styles.sectionHeading}>The Problem and Our Vision</h2>
        
        <div className={styles.visionGrid}>
          {/* Confused world Illustration */}
          <div className={styles.visionIllustrationCard}>
            <div className={styles.illustrationEmojis}>
              <span>🌍</span>
              <span>❓</span>
            </div>
            <p>Millions worldwide lack basic reading and communication access, creating a complex daily puzzle.</p>
          </div>

          {/* User profiles card */}
          <div className={styles.visionIllustrationCard}>
            <div className={styles.illustrationEmojis}>
              <span>👨‍🦳</span>
              <span>👩‍🦰</span>
              <span>👨‍🌾</span>
            </div>
            <p>Everyday elders and adult neo-literates face communication barriers, unable to decode modern interfaces.</p>
          </div>

          {/* Owl assistant card */}
          <div className={styles.visionIllustrationCard}>
            <div className={styles.illustrationEmojis}>
              <span>🦉</span>
              <span>✨</span>
              <span>📖</span>
            </div>
            <p>MiGo steps in as their friendly AI companion, transforming confusion into clear words and sentences.</p>
          </div>
        </div>

        {/* Vision details with Open book galaxy */}
        <div className={styles.visionDetailedPanel}>
          <div className={styles.visionText}>
            <p>
              Literacy unlocks a world of possibility. For millions, reading, writing, and communication are complex puzzles. Our mission at <strong>MiGo</strong> is to be the intelligent companion on their journey from confusion to clarity.
            </p>
          </div>
          <div className={styles.galaxyBookContainer}>
            <div className={styles.galaxyBook}>
              <span className={styles.bookEmoji}>📖</span>
              <div className={styles.galaxyTrail}>
                <span>✨</span>
                <span>⭐</span>
                <span>🌟</span>
                <span>💫</span>
              </div>
            </div>
            <p className={styles.galaxyCaption}>A universe of understanding, tailored to your needs.</p>
          </div>
        </div>
      </section>

      {/* FIRST-TIME REGISTRATION & ONBOARDING GUIDE */}
      <section className={styles.onboardingSection} id="how-it-works">
        <h2 className={styles.sectionHeading}>First-Time Registration & Onboarding Guide</h2>
        <p className={styles.sectionSubheading}>Interact with the live wizard below to see how easy it is to get started:</p>

        <div className={styles.visualGuideGrid}>
          {/* Card 1: Profile Settings */}
          <div className={styles.guideCard}>
            <div className={styles.guideCardHeader}>
              <span className={styles.guideNumber}>1</span>
              <h3>Profile Creation</h3>
            </div>
            <p className={styles.guideDesc}>
              Enter your Name and Age to set up a personalized view. Perfect for children or elderly learners.
            </p>
            <div className={styles.guideVisual}>
              <div className={styles.mockForm}>
                <div className={styles.mockFormRow}>
                  <label>Name</label>
                  <div className={styles.mockInput}>Ayesha</div>
                </div>
                <div className={styles.mockFormRow}>
                  <label>Age</label>
                  <div className={styles.mockInput}>34</div>
                </div>
                <div className={styles.mockAvatarRow}>
                  <span className={`${styles.mockAvatar} ${styles.mockAvatarActive}`}>🦉</span>
                  <span className={styles.mockAvatar}>🐱</span>
                  <span className={styles.mockAvatar}>🦊</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Language Selection */}
          <div className={styles.guideCard}>
            <div className={styles.guideCardHeader}>
              <span className={styles.guideNumber}>2</span>
              <h3>Language Route</h3>
            </div>
            <p className={styles.guideDesc}>
              Select your native tongue and pick the language path you want to learn (English, Hindi, Kannada, Tamil).
            </p>
            <div className={styles.guideVisual}>
              <div className={styles.mockLanguages}>
                <div className={styles.mockLangSection}>
                  <span className={styles.mockLangLabel}>Known:</span>
                  <div className={styles.mockLangChips}>
                    <span className={styles.mockChipActive}>English (EN)</span>
                  </div>
                </div>
                <div className={styles.mockLangSection}>
                  <span className={styles.mockLangLabel}>Learning:</span>
                  <div className={styles.mockLangChips}>
                    <span className={styles.mockChipLearning}>Hindi (हिंदी)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Voice Recognition */}
          <div className={styles.guideCard}>
            <div className={styles.guideCardHeader}>
              <span className={styles.guideNumber}>3</span>
              <h3>Voice Recognition</h3>
            </div>
            <p className={styles.guideDesc}>
              Speak words aloud. Our backend evaluation reads your voice and grades your pronunciation accuracy.
            </p>
            <div className={styles.guideVisual}>
              <div className={styles.mockSpeechCheck}>
                <div className={styles.mockMicCircle}>🎙️</div>
                <div className={styles.mockWaves}>
                  <span className={styles.waveBar} />
                  <span className={styles.waveBarActive} />
                  <span className={styles.waveBar} />
                </div>
                <span className={styles.mockScoreLabel}>Speech Accuracy: <strong>92%</strong></span>
              </div>
            </div>
          </div>

          {/* Card 4: Placement Assessment */}
          <div className={styles.guideCard}>
            <div className={styles.guideCardHeader}>
              <span className={styles.guideNumber}>4</span>
              <h3>Placement Check</h3>
            </div>
            <p className={styles.guideDesc}>
              Take a quick 5-question Reading, Writing, & Comprehension check to establish your personalized level.
            </p>
            <div className={styles.guideVisual}>
              <div className={styles.mockQuestionCard}>
                <div className={styles.mockQuestionHeader}>
                  <span>Question 1: Reading Check</span>
                </div>
                <div className={styles.mockQuestionText}>Identify: 🍎</div>
                <div className={styles.mockOptionsGrid}>
                  <div className={styles.mockOption}>🐱 Cat</div>
                  <div className={`${styles.mockOption} ${styles.mockOptionCorrect}`}>🍎 Apple</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Learner ID & Auto-Fill */}
          <div className={styles.guideCard}>
            <div className={styles.guideCardHeader}>
              <span className={styles.guideNumber}>5</span>
              <h3>ID Card & Auto-Fill</h3>
            </div>
            <p className={styles.guideDesc}>
              Receive your unique Learner ID card to log in instantly. Click below to test it automatically!
            </p>
            <div className={styles.guideVisual}>
              <div className={styles.mockIdCardContainer}>
                <div className={styles.mockIdCard}>
                  <div className={styles.mockIdHeader}>
                    <span>🦉 MIGO IDENTITY CARD</span>
                  </div>
                  <div className={styles.mockIdBody}>
                    <div className={styles.mockIdAvatar}>🦉</div>
                    <div className={styles.mockIdText}>
                      <strong>Ayesha</strong>
                      <span className={styles.mockIdNumber}>MG000001</span>
                    </div>
                  </div>
                </div>
                
                <button
                  className={styles.quickAutofillBtn}
                  onClick={() => {
                    localStorage.setItem('migo_simulated_id', 'MG000001');
                    navigate('/login');
                  }}
                  type="button"
                >
                  🚀 Test Auto-Fill Login
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.onboardingFooter}>
          <h4>Already a Learner?</h4>
          <p>Click "I Already Have an ID" at the top to jump right back in! You can search by your Name or Learner ID.</p>
        </div>
      </section>

      {/* MEET YOUR AI LITERACY COMPANION */}
      <section className={styles.companionSection}>
        <div className={styles.companionLayout}>
          <div className={styles.companionMockups}>
            {/* Simulated app interface 1: Profile card */}
            <div className={styles.mockupCard}>
              <div className={styles.mockupHeader}>
                <User size={16} color="#FF7A00" />
                <span>Learner Profile</span>
              </div>
              <div className={styles.mockupProfileContent}>
                <div className={styles.mockupAvatarBox}>🦉</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px' }}>Namitha</h4>
                  <span style={{ fontSize: '12px', color: '#777' }}>Intermediate Level</span>
                </div>
              </div>
              <div className={styles.mockupStatsRow}>
                <div>
                  <span className={styles.statLabel}>Consistency</span>
                  <span className={styles.statVal}>🔥 82%</span>
                </div>
                <div>
                  <span className={styles.statLabel}>Lessons</span>
                  <span className={styles.statVal}>✅ 18</span>
                </div>
              </div>
            </div>

            {/* Simulated app interface 2: Interactive learning map */}
            <div className={styles.mockupCard}>
              <div className={styles.mockupHeader}>
                <Compass size={16} color="#FF7A00" />
                <span>Constellation Learning Map</span>
              </div>
              <p style={{ fontSize: '11px', margin: '4px 0 12px 0', color: '#666' }}>Tap stars to explore lessons:</p>
              
              <div className={styles.mapConstellationArea}>
                <svg className={styles.mapLines} width="100%" height="80">
                  <line x1="20%" y1="50%" x2="50%" y2="20%" stroke="#FFB077" strokeWidth="2.5" strokeDasharray="4" />
                  <line x1="50%" y1="20%" x2="80%" y2="60%" stroke="#FFB077" strokeWidth="2.5" strokeDasharray="4" />
                </svg>
                
                <button
                  className={`${styles.mapStarNode} ${activeStar === 1 ? styles.starActive : ''}`}
                  style={{ left: '15%', top: '40%' }}
                  onClick={() => setActiveStar(1)}
                  type="button"
                >
                  ⭐
                </button>
                
                <button
                  className={`${styles.mapStarNode} ${activeStar === 2 ? styles.starActive : ''}`}
                  style={{ left: '45%', top: '10%' }}
                  onClick={() => setActiveStar(2)}
                  type="button"
                >
                  ⭐
                </button>
                
                <button
                  className={`${styles.mapStarNode} ${activeStar === 3 ? styles.starActive : ''}`}
                  style={{ left: '75%', top: '50%' }}
                  onClick={() => setActiveStar(3)}
                  type="button"
                >
                  ⭐
                </button>
              </div>

              <div className={styles.mapStarDetails}>
                {activeStar === 1 && <span>📍 Lesson 1: Alphabet Sounds & Tracing</span>}
                {activeStar === 2 && <span>📍 Lesson 2: Visual Word Building</span>}
                {activeStar === 3 && <span>📍 Lesson 3: Sentence Comprehension</span>}
              </div>
            </div>
          </div>

          <div className={styles.companionTextContent}>
            <h2 className={styles.sectionHeading} style={{ textAlign: 'left' }}>Meet your AI Literacy Companion</h2>
            <p>
              MiGo doesn't just teach; it understands you. By getting to know your unique style, interests, and current level, it creates a custom-fit learning path. As you grow, MiGo grows with you, making every step engaging.
            </p>

            <div className={styles.badgeListGrid}>
              <div className={styles.badgeShowcase}>
                <span className={styles.badgeShowcaseIcon}>🏆</span>
                <div>
                  <h4>Detailed Analytics</h4>
                  <p>Track your study hours, consistency rates, and lessons completed.</p>
                </div>
              </div>

              <div className={styles.badgeShowcase}>
                <span className={styles.badgeShowcaseIcon}>🏅</span>
                <div>
                  <h4>Celebrate Wins</h4>
                  <p>Earn XP points, unlock star achievements, and collect milestone badges.</p>
                </div>
              </div>

              <div className={styles.badgeShowcase}>
                <span className={styles.badgeShowcaseIcon}>📈</span>
                <div>
                  <h4>ML Predictions</h4>
                  <p>Get accurate, encouraging predictions of your learning speed and milestones.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS YOU'LL MASTER */}
      <section className={styles.skillsSection} id="skills">
        <h2 className={styles.sectionHeading}>Skills You'll Master</h2>
        <p className={styles.sectionSubheading}>Become a confident reader, fluent writer, and a sharp thinker. MiGo uses multi-sensory activities—sight, sound, and touch—to make literacy intuitive.</p>

        <div className={styles.skillsGrid}>
          {/* Skill 1: Reading */}
          <div className={styles.skillBlock}>
            <div className={styles.skillBlockHeader} style={{ borderColor: '#FF7A00', backgroundColor: '#FFF4E5' }}>
              <BookOpen size={24} color="#FF7A00" />
              <h3>Reading & Decoding</h3>
            </div>
            <ul className={styles.skillsBulletList}>
              <li><CheckCircle2 size={16} color="#FF7A00" /> <span>Letter Recognition</span></li>
              <li><CheckCircle2 size={16} color="#FF7A00" /> <span>Sound to Letter Matching (e.g. matching picture to word)</span></li>
              <li><CheckCircle2 size={16} color="#FF7A00" /> <span>Vocabulary Expansion</span></li>
            </ul>
          </div>

          {/* Skill 2: Writing */}
          <div className={styles.skillBlock}>
            <div className={styles.skillBlockHeader} style={{ borderColor: '#FF9F43', backgroundColor: '#FFFDF9' }}>
              <PenTool size={24} color="#FF9F43" />
              <h3>Writing & Expression</h3>
            </div>
            <ul className={styles.skillsBulletList}>
              <li><CheckCircle2 size={16} color="#FF9F43" /> <span>Correct Spelling & Unscrambling</span></li>
              <li><CheckCircle2 size={16} color="#FF9F43" /> <span>Sentence Formation & Structure</span></li>
              <li><CheckCircle2 size={16} color="#FF9F43" /> <span>Self-Reflection Journals</span></li>
            </ul>
          </div>

          {/* Skill 3: Comprehension */}
          <div className={styles.skillBlock}>
            <div className={styles.skillBlockHeader} style={{ borderColor: '#FF7A00', backgroundColor: '#FFF4E5' }}>
              <Target size={24} color="#FF7A00" />
              <h3>Comprehension & Understanding</h3>
            </div>
            <ul className={styles.skillsBulletList}>
              <li><CheckCircle2 size={16} color="#FF7A00" /> <span>Identifying Key Facts</span></li>
              <li><CheckCircle2 size={16} color="#FF7A00" /> <span>Critical Thinking Skills</span></li>
              <li><CheckCircle2 size={16} color="#FF7A00" /> <span>Analyzing Short Texts & Dialogues</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* MIGO'S AI TOOLS IN ACTION */}
      <section className={styles.aiActionSection}>
        <h2 className={styles.sectionHeading}>MiGo's AI Tools in Action</h2>
        <p className={styles.sectionSubheading}>How does our platform help you learn? Try them live right here:</p>

        {/* Tab switcher */}
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tabBtn} ${selectedToolTab === 'dictation' ? styles.activeTabBtn : ''}`}
            onClick={() => setSelectedToolTab('dictation')}
            type="button"
          >
            <Mic size={18} />
            <span>Live Dictation</span>
          </button>
          
          <button
            className={`${styles.tabBtn} ${selectedToolTab === 'match' ? styles.activeTabBtn : ''}`}
            onClick={() => setSelectedToolTab('match')}
            type="button"
          >
            <Globe size={18} />
            <span>Picture & Word Match</span>
          </button>
          
          <button
            className={`${styles.tabBtn} ${selectedToolTab === 'quizzes' ? styles.activeTabBtn : ''}`}
            onClick={() => setSelectedToolTab('quizzes')}
            type="button"
          >
            <Cpu size={18} />
            <span>Comprehension Checks</span>
          </button>
        </div>

        {/* Demo Area */}
        <div className={styles.demoContentBox}>
          {selectedToolTab === 'dictation' && (
            <div className={styles.dictationDemo}>
              <div className={styles.microphoneCircle}>
                <Mic size={36} color="#FFFFFF" />
              </div>
              <h3>"Say Apple"</h3>
              <p className={styles.dictationInstructions}>A special tool lets you type or speak, and MiGo listens and provides gentle, real-time corrections.</p>
              <div className={styles.dictationMatchesBox}>
                <span>🎙️ Click mascot mic inside lessons to repeat target sounds!</span>
              </div>
            </div>
          )}

          {selectedToolTab === 'match' && (
            <div className={styles.matchDemo}>
              <h3>Tap to Match Word with Image:</h3>
              
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', margin: '20px 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {matchWords.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleMatchWord(item)}
                      className={`${styles.matchWordBtn} ${selectedWord?.word === item.word ? styles.matchWordBtnSelected : ''} ${matchedPairs.includes(item.word) ? styles.matchWordBtnMatched : ''}`}
                      disabled={matchedPairs.includes(item.word)}
                      type="button"
                    >
                      {item.word}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {matchWords.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleMatchWord(item)}
                      className={`${styles.matchEmojiBtn} ${selectedWord?.word === item.word ? styles.matchWordBtnSelected : ''} ${matchedPairs.includes(item.word) ? styles.matchWordBtnMatched : ''}`}
                      disabled={matchedPairs.includes(item.word)}
                      type="button"
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {matchedPairs.length === 3 && (
                <div style={{ color: '#4CAF50', fontWeight: 800, fontSize: '15px', marginTop: '12px' }}>
                  🎉 Awesome! All matched successfully!
                </div>
              )}

              <button onClick={resetMatchGame} className={styles.resetBtn} type="button">
                Reset Match Game
              </button>
            </div>
          )}

          {selectedToolTab === 'quizzes' && (
            <div className={styles.quizDemo}>
              <h3>Read the story snippet and choose the main idea:</h3>
              <div className={styles.quizSnippet}>
                "The sun rose early, drying the damp fields. The farmer began planting wheat, hoping for rain soon."
              </div>

              <div className={styles.quizOptionsStack}>
                <button
                  className={`${styles.quizOptBtn} ${quizAnswerSelected === 'A' ? styles.quizOptBtnCorrect : ''}`}
                  onClick={() => setQuizAnswerSelected('A')}
                  type="button"
                >
                  A) A farmer starts planting crops at sunrise. (Correct ✓)
                </button>
                <button
                  className={`${styles.quizOptBtn} ${quizAnswerSelected === 'B' ? styles.quizOptBtnIncorrect : ''}`}
                  onClick={() => setQuizAnswerSelected('B')}
                  type="button"
                >
                  B) The farmer went to buy bread.
                </button>
                <button
                  className={`${styles.quizOptBtn} ${quizAnswerSelected === 'C' ? styles.quizOptBtnIncorrect : ''}`}
                  onClick={() => setQuizAnswerSelected('C')}
                  type="button"
                >
                  C) спаm details.
                </button>
              </div>

              {quizAnswerSelected === 'A' && (
                <p style={{ color: '#4CAF50', fontWeight: 800, fontSize: '14px', marginTop: '12px' }}>
                  ✓ That is correct! Short, fun quizzes ensure deep understanding of what you've learned.
                </p>
              )}
              {quizAnswerSelected && quizAnswerSelected !== 'A' && (
                <p style={{ color: '#E74C3C', fontWeight: 800, fontSize: '14px', marginTop: '12px' }}>
                  ✗ Try again! Look for the option that describes the action of the farmer.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* START YOUR PERSONALIZED JOURNEY NOW */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <h2>Start Your Personalized Journey Now</h2>
          <p>Take the short learning profile assessment and unlock games, stories, and letters in your native language today.</p>
          
          <button className={styles.ctaPrimaryBtn} onClick={() => navigate('/register')}>
            Create Your Profile
          </button>
          
          <a href="#vision" className={styles.ctaLink}>Explore Our Story & Team</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
        </div>
        
        <p className={styles.footerCopyright}>© 2026 MiGo Gamified Literacy Platform. All rights reserved.</p>

        <div className={styles.footerSocials}>
          <a href="#" aria-label="Facebook">🌐</a>
          <a href="#" aria-label="X">𝕏</a>
          <a href="#" aria-label="YouTube">📺</a>
        </div>
      </footer>
    </motion.div>
  );
}