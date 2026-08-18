// src/components/Lessons/LessonDocument.jsx
import { X, BookOpen, PenTool, MessageCircle, Mic } from 'lucide-react';
import styles from './LessonDocument.module.css';

export default function LessonDocument({ lesson, language = 'en', onClose }) {
  // Fallback to a mock lesson if none passed
  const activeLesson = lesson || {
    title: 'Lesson Notes',
    concept_intro: 'Learn key concepts and vocabulary in this lesson.',
    difficulty: 'beginner',
    skill: 'vocabulary'
  };

  const currentLang = activeLesson.language || language || 'en';

  // Multilingual UI Labels
  const LABELS = {
    en: {
      title: 'Study Guide',
      subtitle: 'Lesson Study Notes & cheatsheet',
      concept: 'Concept & Core Lesson',
      vocab: 'Key Vocabulary & Practice',
      tips: 'Grammar & Study Tips',
      speaking: 'Speaking Practice Target',
      real_life: 'Real-Life Context',
      no_vocab: 'No vocabulary list for this lesson.',
      no_tips: 'Pay close attention to explanations in the lesson slides.'
    },
    hi: {
      title: 'अध्ययन मार्गदर्शिका',
      subtitle: 'पाठ अध्ययन नोट्स और सहायक पुस्तिका',
      concept: 'अवधारणा और मुख्य पाठ',
      vocab: 'मुख्य शब्दावली और अभ्यास',
      tips: 'व्याकरण और अध्ययन युक्तियाँ',
      speaking: 'बोलने का अभ्यास लक्ष्य',
      real_life: 'दैनिक जीवन संदर्भ',
      no_vocab: 'इस पाठ के लिए कोई शब्दावली सूची नहीं है।',
      no_tips: 'पाठ के स्लाइडों में दिए गए स्पष्टीकरणों पर ध्यान दें।'
    },
    kn: {
      title: 'ಅಧ್ಯಯನ ಮಾರ್ಗದರ್ಶಿ',
      subtitle: 'ಪಾಠದ ಅಧ್ಯಯನ ಟಿಪ್ಪಣಿಗಳು ಮತ್ತು ಸಹಾಯಕ ಮಾಹಿತಿ',
      concept: 'ಪರಿಕಲ್ಪನೆ ಮತ್ತು ಪ್ರಮುಖ ಪಾಠ',
      vocab: 'ಪ್ರಮುಖ ಶಬ್ದಕೋಶ ಮತ್ತು ಅಭ್ಯಾಸಗಳು',
      tips: 'ವ್ಯಾಕರಣ ಮತ್ತು ಅಧ್ಯಯನ ಸಲಹೆಗಳು',
      speaking: 'ಮಾತನಾಡುವ ಅಭ್ಯಾಸದ ಗುರಿ',
      real_life: 'ದೈನಂದಿನ ಜೀವನದ ಸಂದರ್ಭ',
      no_vocab: 'ಈ ಪಾಠಕ್ಕೆ ಯಾವುದೇ ಶಬ್ದಕೋಶ ಪಟ್ಟಿ ಇಲ್ಲ.',
      no_tips: 'ಪಾಠದ ಸ್ಲೈಡ್‌ಗಳಲ್ಲಿನ ವಿವರಣೆಗಳಿಗೆ ಗಮನ ಕೊಡಿ.'
    },
    ta: {
      title: 'பாட வழிகாட்டி',
      subtitle: 'பாடப் படிப்பு குறிப்புகள் மற்றும் வழிகாட்டி',
      concept: 'கருத்து மற்றும் முக்கிய பாடம்',
      vocab: 'முக்கிய சொற்கள் மற்றும் பயிற்சிகள்',
      tips: 'இலக்கணம் மற்றும் படிப்பு குறிப்புகள்',
      speaking: 'பேச்சு பயிற்சி இலக்கு',
      real_life: 'நிஜ வாழ்க்கை சூழல்',
      no_vocab: 'இந்த பாடத்திற்கு சொற்கள் பட்டியல் இல்லை.',
      no_tips: 'பாட ஸ்லைடுகளில் உள்ள விளக்கங்களை கவனமாக கவனியுங்கள்.'
    }
  };

  const labels = LABELS[currentLang] || LABELS.en;

  // Extract spelling/vocabulary elements dynamically from the lesson's activities
  const vocabList = [];
  const alphabetList = [];
  let grammarTips = activeLesson.improvement_tip || '';

  const activities = activeLesson.activities || activeLesson.activities_data || [];
  
  activities.forEach((act) => {
    // Collect alphabet letters/words
    if (act.type === 'trace_letter' && act.target) {
      alphabetList.push(act.target);
    }
    if (act.type === 'learn_letter' && act.letter) {
      alphabetList.push(act.letter);
    }

    // Collect terms or words to practice
    if (act.term) {
      vocabList.push({ word: act.term, trans: act.phonetic || act.instruction || '' });
    }
    if (act.type === 'write_word' && act.target) {
      vocabList.push({ word: act.target, trans: act.instruction || '' });
    }
    if (act.type === 'unscramble_words' && act.items) {
      act.items.forEach(item => {
        if (item.word || item.target) {
          vocabList.push({ word: item.word || item.target, trans: item.clue || item.meaning || '' });
        }
      });
    }
    // Handle storyboard tabs
    if (act.type === 'storyboard_story' && act.tabs) {
      Object.keys(act.tabs).forEach(tabKey => {
        const tab = act.tabs[tabKey];
        if (tab.question) {
          vocabList.push({ word: tab.question, trans: tab.options?.join(', ') || '' });
        }
      });
    }
  });

  // Unique elements
  const uniqueAlphabet = [...new Set(alphabetList)];
  const uniqueVocab = [];
  const seenWords = new Set();
  vocabList.forEach(item => {
    if (!seenWords.has(item.word)) {
      seenWords.add(item.word);
      uniqueVocab.push(item);
    }
  });

  // Fallback guidelines for each skill & language if empty
  if (!grammarTips) {
    if (activeLesson.skill === 'writing') {
      if (currentLang === 'kn') {
        grammarTips = 'ಬರೆಯುವಾಗ ಅಕ್ಷರಗಳ ಸರಿಯಾದ ಜೋಡಣೆ ಮತ್ತು ಒತ್ತಕ್ಷರಗಳನ್ನು ಗಮನಿಸಿ. ವಾಕ್ಯದ ಕೊನೆಯಲ್ಲಿ ಪೂರ್ಣವಿರಾಮ ಇರಲಿ.';
      } else if (currentLang === 'hi') {
        grammarTips = 'लिखते समय मात्राओं और वर्तनी (spelling) का विशेष ध्यान रखें। वाक्यों के अंत में पूर्णविराम अवश्य लगाएं।';
      } else if (currentLang === 'ta') {
        grammarTips = 'எழுதும் போது எழுத்துப் பிழைகள் இல்லாமல் எழுதவும். வாக்கியத்தின் இறுதியில் முற்றுப்புள்ளி வைக்கவும்.';
      } else {
        grammarTips = 'Focus on spelling accuracy, capital letters, and correct spacing. Ensure appropriate punctuation at the end of sentences.';
      }
    } else {
      if (currentLang === 'kn') {
        grammarTips = 'ಕನ್ನಡ ವಾಕ್ಯಗಳು ಸಾಮಾನ್ಯವಾಗಿ ಕರ್ತೃ-ಕರ್ಮ-ಕ್ರಿಯಾಪದ (SOV) ರೂಪದಲ್ಲಿರುತ್ತವೆ. ಪದಗಳ ಉಚ್ಚಾರಣೆಯನ್ನು ಗಮನವಿಟ್ಟು ಕೇಳಿ.';
      } else if (currentLang === 'hi') {
        grammarTips = 'हिन्दी वाक्य आमतौर पर कर्ता-कर्म-क्रिया (SOV) क्रम में होते हैं। शब्दों के सही उच्चारण के लिए ध्वनि चिह्नों पर ध्यान दें।';
      } else if (currentLang === 'ta') {
        grammarTips = 'தமிழ் வாக்கியங்கள் எழுவாய்-செயப்படுபொருள்-பயனிலை (SOV) வரிசையில் அமையும். உச்சரிப்பை கவனமாகக் கேட்கவும்.';
      } else {
        grammarTips = 'English sentences follow the Subject-Verb-Object (SVO) pattern. Listen carefully to the phonetics and pronounce words clearly.';
      }
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.drawer}>
        <header className={styles.header}>
          <div className={styles.titleBox}>
            <span className={styles.icon}>📄</span>
            <div>
              <h3>{activeLesson.title} - {labels.title}</h3>
              <p>{labels.subtitle}</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={24} />
          </button>
        </header>

        <div className={styles.body}>
          {/* Concept Overview Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <BookOpen size={18} color="#FF7A00" />
              <span>{labels.concept}</span>
            </div>
            <p className={styles.tipsText} style={{ fontWeight: 800, color: 'var(--text-dark)' }}>
              {activeLesson.concept_intro || activeLesson.title}
            </p>
            {activeLesson.real_life_context && (
              <p className={styles.tipsText} style={{ fontSize: '11px', marginTop: '6px', color: 'var(--text-muted)' }}>
                <strong>{labels.real_life}:</strong> {activeLesson.real_life_context}
              </p>
            )}
          </div>

          {/* Alphabet Grid Section */}
          {uniqueAlphabet.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <PenTool size={18} color="#FF7A00" />
                <span>Alphabet & Characters</span>
              </div>
              <div className={styles.alphabetGrid}>
                {uniqueAlphabet.map((letter, idx) => (
                  <div key={idx} className={styles.letterPill}>
                    {letter}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vocabulary Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <BookOpen size={18} color="#FF7A00" />
              <span>{labels.vocab}</span>
            </div>
            {uniqueVocab.length > 0 ? (
              <div className={styles.vocabList}>
                {uniqueVocab.map((v, idx) => (
                  <div key={idx} className={styles.vocabItem}>
                    <div className={styles.vocabLeft}>
                      <span className={styles.nativeText}>{v.word}</span>
                    </div>
                    <div className={styles.vocabRight} style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {v.trans}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.tipsText} style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                {labels.no_vocab}
              </p>
            )}
          </div>

          {/* Speaking Practice Section */}
          {activeLesson.voice_activity && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <Mic size={18} color="#FF7A00" />
                <span>{labels.speaking}</span>
              </div>
              <p className={styles.tipsText} style={{ fontWeight: 800, color: 'var(--color-orange-dark)', backgroundColor: 'var(--color-cream-bg)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--color-peach-light)' }}>
                🗣️ "{activeLesson.voice_activity}"
              </p>
            </div>
          )}

          {/* Grammar Tips Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <MessageCircle size={18} color="#FF7A00" />
              <span>{labels.tips}</span>
            </div>
            <p className={styles.tipsText}>
              {grammarTips}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
