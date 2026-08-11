// src/components/Lessons/LessonDocument.jsx
import { X, BookOpen, PenTool, MessageCircle } from 'lucide-react';
import styles from './LessonDocument.module.css';

const SAMPLE_GUIDES = {
  kn: {
    title: 'Kannada Core Study Guide',
    alphabet: ['ಅ (a)', 'ಆ (aa)', 'ಇ (i)', 'ಈ (ee)', 'ಉ (u)', 'ಊ (oo)', 'ಎ (e)', 'ಏ (ae)', 'ಒ (o)', 'ಓ (oo)', 'ಕ (ka)', 'ಖ (kha)', 'ಗ (ga)'],
    vocab: [
      { word: 'ಮರ', pron: 'Mara', trans: 'Tree' },
      { word: 'ಬೆಕ್ಕು', pron: 'Bekku', trans: 'Cat' },
      { word: 'ಹಾಲು', pron: 'Haalu', trans: 'Milk' },
      { word: 'ಅರಸ', pron: 'Arasa', trans: 'King' }
    ],
    tips: 'In Kannada, sentences usually follow the Subject-Object-Verb (SOV) order. Nouns and verbs change endings depending on gender, status, and numbers.'
  },
  hi: {
    title: 'Hindi Core Study Guide',
    alphabet: ['अ (a)', 'आ (aa)', 'इ (i)', 'ई (ee)', 'उ (u)', 'ऊ (oo)', 'ए (e)', 'ऐ (ai)', 'क (ka)', 'ख (kha)', 'ग (ga)', 'घ (gha)'],
    vocab: [
      { word: 'पेड़', pron: 'Ped', trans: 'Tree' },
      { word: 'बिल्ली', pron: 'Billi', trans: 'Cat' },
      { word: 'दूध', pron: 'Doodh', trans: 'Milk' },
      { word: 'राजा', pron: 'Raja', trans: 'King' }
    ],
    tips: 'Hindi is written in Devnagari script. Every noun has a grammatical gender (masculine or feminine). Verbs agree with the gender and number of the noun.'
  },
  ta: {
    title: 'Tamil Core Study Guide',
    alphabet: ['அ (a)', 'ஆ (aa)', 'இ (i)', 'ಈ (ee)', 'உ (u)', 'ஊ (oo)', 'எ (e)', 'ஏ (ae)', 'ஐ (ai)', 'ஒ (o)', 'ஓ (oo)', 'க (ka)'],
    vocab: [
      { word: 'மரம்', pron: 'Maram', trans: 'Tree' },
      { word: 'பூனை', pron: 'Poonai', trans: 'Cat' },
      { word: 'பால்', pron: 'Paal', trans: 'Milk' },
      { word: 'அரசன்', pron: 'Arasan', trans: 'King' }
    ],
    tips: 'Tamil is a classical language written left-to-right. Verb conjugations show the subject person, number, and gender.'
  },
  en: {
    title: 'English Core Study Guide',
    alphabet: ['A (ae)', 'B (bee)', 'C (cee)', 'D (dee)', 'E (ee)', 'F (eff)', 'G (jee)', 'H (aych)', 'I (ai)', 'J (jay)'],
    vocab: [
      { word: 'Tree', pron: 'Tree', trans: 'पेड़ / ಮರ / மரம்' },
      { word: 'Cat', pron: 'Cat', trans: 'बिल्ली / ಬೆಕ್ಕು / பூனை' },
      { word: 'Milk', pron: 'Milk', trans: 'दूध / ಹಾಲು / பால்' },
      { word: 'King', pron: 'King', trans: 'राजा / ಅರಸ / அரசன்' }
    ],
    tips: 'English sentences generally follow the Subject-Verb-Object (SVO) order. Adjectives are placed before the nouns they modify.'
  }
};

export default function LessonDocument({ language = 'en', onClose }) {
  const guide = SAMPLE_GUIDES[language] || SAMPLE_GUIDES.en;

  return (
    <div className={styles.overlay}>
      <div className={styles.drawer}>
        <header className={styles.header}>
          <div className={styles.titleBox}>
            <span className={styles.icon}>📄</span>
            <div>
              <h3>{guide.title}</h3>
              <p>Lesson Study Notes & cheatsheet</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={24} />
          </button>
        </header>

        <div className={styles.body}>
          {/* Alphabet Trace Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <PenTool size={18} color="#FF7A00" />
              <span>Alphabet & Characters</span>
            </div>
            <div className={styles.alphabetGrid}>
              {guide.alphabet.map((letter, idx) => (
                <div key={idx} className={styles.letterPill}>
                  {letter}
                </div>
              ))}
            </div>
          </div>

          {/* Vocabulary Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <BookOpen size={18} color="#FF7A00" />
              <span>Key Vocabulary</span>
            </div>
            <div className={styles.vocabList}>
              {guide.vocab.map((v, idx) => (
                <div key={idx} className={styles.vocabItem}>
                  <div className={styles.vocabLeft}>
                    <span className={styles.nativeText}>{v.word}</span>
                    <span className={styles.pronText}>({v.pron})</span>
                  </div>
                  <div className={styles.vocabRight}>
                    {v.trans}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grammar Tips Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <MessageCircle size={18} color="#FF7A00" />
              <span>Grammar & Tracing Tips</span>
            </div>
            <p className={styles.tipsText}>
              {guide.tips}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
