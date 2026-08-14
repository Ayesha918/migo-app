// src/components/Extra/Library.jsx
import { useState, useEffect, useRef } from 'react';
import { useLearner } from '../../services/LearnerContext';
import { fetchBooks } from '../../services/api';
import Sidebar from '../Home/Sidebar';
import Header from '../Home/Header';
import { 
  Search, BookOpen, Star, Volume2, VolumeX, ArrowLeft, ArrowRight, Play, X, 
  Headphones, Clock, Bookmark, Sparkles, Award, RotateCcw, AlertCircle, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Extra.module.css';

// Import book covers statically to guarantee Vite resolves them correctly in production
import lostWalletCover from '../../assets/images/lost_wallet_cover.jpg';
import tortoiseHareCover from '../../assets/images/tortoise_hare_cover.jpg';
import panchatantraCover from '../../assets/images/panchatantra_cover.jpg';
import grandmaStoriesCover from '../../assets/images/grandma_stories_cover.jpg';
import honestWoodcutterCover from '../../assets/images/honest_woodcutter_cover.jpg';
import elephantTailorCover from '../../assets/images/elephant_tailor_cover.jpg';
import foxCrowCover from '../../assets/images/fox_crow_cover.jpg';
import dogReflectionCover from '../../assets/images/dog_reflection_cover.jpg';
import monkeyCrocodileCover from '../../assets/images/monkey_crocodile_cover.jpg';
import emperorsClothesCover from '../../assets/images/emperors_clothes_cover.jpg';

const getCoverByTitle = (title) => {
  const t = (title || '').toLowerCase();
  if (t.includes('lost wallet')) return lostWalletCover;
  if (t.includes('tortoise') && t.includes('hare')) return tortoiseHareCover;
  if (t.includes('ஆமையும் முயலும்')) return tortoiseHareCover;
  if (t.includes('panchatantra') || t.includes('पंचतंत्र') || t.includes('ತೆನಾಲಿ') || t.includes('தெனாலிராமன்') || t.includes('tenali')) {
    if (t.includes('monkey') || t.includes('crocodile') || t.includes('croc')) return monkeyCrocodileCover;
    return panchatantraCover;
  }
  if (t.includes('grandma')) return grandmaStoriesCover;
  if (t.includes('woodcutter') || t.includes('ಕಟ್ಟಿಗೆ ಕಡಿಯುವವನು')) return honestWoodcutterCover;
  if (t.includes('elephant') && t.includes('tailor')) return elephantTailorCover;
  if (t.includes('হাতি और दर्जी') || t.includes('हाथी और दर्जी')) return elephantTailorCover;
  if (t.includes('fox') && t.includes('crow')) return foxCrowCover;
  if (t.includes('dog') && t.includes('reflection')) return dogReflectionCover;
  if (t.includes('emperor') && t.includes('clothes')) return emperorsClothesCover;
  return panchatantraCover; // fallback
};

const LANGUAGE_LABELS = {
  en: 'English',
  hi: 'Hindi',
  kn: 'Kannada',
  ta: 'Tamil'
};

// Hardcoded progress percentages for "My Library" to mimic a real reading session
const READ_PROGRESS = {
  'The Tortoise and the Hare': 60,
  'The Honest Woodcutter': 40,
  'The Lost Wallet: A Story About Integrity': 100,
  'Panchatantra Stories': 30,
  'The Fox and the Crow': 70
};

const CHARTS_DATA = [
  {
    id: 'english',
    title: 'English Alphabet Chart',
    subtitle: 'A to Z Alphabet illustration cards',
    desc: 'Learn the English alphabet from A to Z with phonetic emojis and interactive text-to-speech words.',
    flag: '🇬🇧',
    lang: 'en',
    colors: ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFA1F5', '#9F7AEA', '#EC4899', '#06B6D4'],
    items: [
      { letter: 'A', word: 'Apple', emoji: '🍎' },
      { letter: 'B', word: 'Ball', emoji: '⚽' },
      { letter: 'C', word: 'Cat', emoji: '🐱' },
      { letter: 'D', word: 'Dog', emoji: '🐶' },
      { letter: 'E', word: 'Elephant', emoji: '🐘' },
      { letter: 'F', word: 'Fish', emoji: '🐟' },
      { letter: 'G', word: 'Grapes', emoji: '🍇' },
      { letter: 'H', word: 'Hat', emoji: '👒' },
      { letter: 'I', word: 'Ice Cream', emoji: '🍦' },
      { letter: 'J', word: 'Jug', emoji: '🥛' },
      { letter: 'K', word: 'Kite', emoji: '🪁' },
      { letter: 'L', word: 'Lion', emoji: '🦁' },
      { letter: 'M', word: 'Monkey', emoji: '🐒' },
      { letter: 'N', word: 'Nest', emoji: '🪹' },
      { letter: 'O', word: 'Orange', emoji: '🍊' },
      { letter: 'P', word: 'Parrot', emoji: '🦜' },
      { letter: 'Q', word: 'Queen', emoji: '👑' },
      { letter: 'R', word: 'Rabbit', emoji: '🐇' },
      { letter: 'S', word: 'Sun', emoji: '☀️' },
      { letter: 'T', word: 'Train', emoji: '🚆' },
      { letter: 'U', word: 'Umbrella', emoji: '🌂' },
      { letter: 'V', word: 'Van', emoji: '🚐' },
      { letter: 'W', word: 'Watch', emoji: '⌚' },
      { letter: 'X', word: 'Xylophone', emoji: '🎹' },
      { letter: 'Y', word: 'Yak', emoji: '🐂' },
      { letter: 'Z', word: 'Zebra', emoji: '🦓' }
    ]
  },
  {
    id: 'hindi',
    title: 'हिन्दी स्वर माला (Varnamala)',
    subtitle: 'Vowels and Illustrated Word Cards',
    desc: 'Practice Hindi vowels from अ to अः with phonetics, English translation, and interactive audio.',
    flag: '🇮🇳',
    lang: 'hi',
    colors: ['#FF7A00', '#FF4D4D', '#10B981', '#3B82F6', '#9F7AEA', '#EC4899'],
    items: [
      { letter: 'अ', word: 'अनार', translation: 'Pomegranate', emoji: '🍎' },
      { letter: 'आ', word: 'आम', translation: 'Mango', emoji: '🥭' },
      { letter: 'इ', word: 'इमली', translation: 'Tamarind', emoji: '🫘' },
      { letter: 'ई', word: 'ईख', translation: 'Sugarcane', emoji: '🎋' },
      { letter: 'उ', word: 'उल्लू', translation: 'Owl', emoji: '🦉' },
      { letter: 'ऊ', word: 'ऊन', translation: 'Wool', emoji: '🧶' },
      { letter: 'ऋ', word: 'ऋषि', translation: 'Sage', emoji: '🧘' },
      { letter: 'ए', word: 'एड़ी', translation: 'Heel', emoji: '🦶' },
      { letter: 'ऐ', word: 'ऐनक', translation: 'Spectacles', emoji: '👓' },
      { letter: 'ओ', word: 'ओखली', translation: 'Mortar', emoji: '🥣' },
      { letter: 'औ', word: 'औरत', translation: 'Woman', emoji: '👩' },
      { letter: 'अं', word: 'अंगूर', translation: 'Grapes', emoji: '🍇' },
      { letter: 'अः', word: 'खाली', translation: 'Aha', emoji: '😄' }
    ]
  },
  {
    id: 'kannada',
    title: 'ಕನ್ನಡ ವರ್ಣಮಾಲೆ (Varnamala)',
    subtitle: 'Kannada Vowels with Illustrated Words',
    desc: 'Learn Kannada vowels (ಸ್ವರಗಳು) from ಅ to ಅಂ with illustrations and spoken audio recordings.',
    flag: '🇮🇳',
    lang: 'kn',
    colors: ['#FFA1F5', '#3B82F6', '#FF7A00', '#10B981', '#9F7AEA', '#FF6B6B'],
    items: [
      { letter: 'ಅ', word: 'ಅರಸ', translation: 'King', emoji: '👑' },
      { letter: 'ಆ', word: 'ಆಮೆ', translation: 'Turtle', emoji: '🐢' },
      { letter: 'ಇ', word: 'ಇಲಿ', translation: 'Rat', emoji: '🐀' },
      { letter: 'ಈ', word: 'ಈಶ್ವರ', translation: 'Shiva', emoji: '🔱' },
      { letter: 'ಉ', word: 'ಉಡುಪು', translation: 'Dress', emoji: '👗' },
      { letter: 'ಊ', word: 'ಊಟ', translation: 'Meal', emoji: '🍲' },
      { letter: 'ಋ', word: 'ಋಷಿ', translation: 'Sage', emoji: '🧘' },
      { letter: 'ಎ', word: 'ಎಲೆ', translation: 'Leaf', emoji: '🍃' },
      { letter: 'ಏ', word: 'ಏಣಿ', translation: 'Ladder', emoji: '🪜' },
      { letter: 'ಐ', word: 'ಐದು', translation: 'Five', emoji: '🖐️' },
      { letter: 'ಒ', word: 'ಒಂಟೆ', translation: 'Camel', emoji: '🐫' },
      { letter: 'ಓ', word: 'ಓಲೆ', translation: 'Earring', emoji: '👂' },
      { letter: 'ಔ', word: 'ಔಷಧ', translation: 'Medicine', emoji: '🧪' },
      { letter: 'ಅಂ', word: 'ಅಂಗಿ', translation: 'Shirt', emoji: '👕' }
    ]
  },
  {
    id: 'tamil',
    title: 'தமிழ் உயிர் எழுத்துக்கள்',
    subtitle: 'Tamil Vowels with Illustrated Words',
    desc: 'Practice Tamil vowels (உயிர் எழுத்துக்கள்) from அ to ஔ with illustrations and phonetic voices.',
    flag: '🇮🇳',
    lang: 'ta',
    colors: ['#3B82F6', '#6BCB77', '#FF9F43', '#EC4899', '#9F7AEA', '#06B6D4'],
    items: [
      { letter: 'அ', word: 'அணில்', translation: 'Squirrel', emoji: '🐿️' },
      { letter: 'ஆ', word: 'ஆடு', translation: 'Goat', emoji: '🐐' },
      { letter: 'இ', word: 'இலை', translation: 'Leaf', emoji: '🍃' },
      { letter: 'ஈ', word: 'ஈ', translation: 'Housefly', emoji: '🪰' },
      { letter: 'உ', word: 'உரல்', translation: 'Mortar', emoji: '🥣' },
      { letter: 'ஊ', word: 'ஊஞ்சல்', translation: 'Swing', emoji: '🎡' },
      { letter: 'எ', word: 'எலி', translation: 'Rat', emoji: '🐀' },
      { letter: 'ஏ', word: 'ஏணி', translation: 'Ladder', emoji: '🪜' },
      { letter: 'ஐ', word: 'ஐந்து', translation: 'Five', emoji: '🖐️' },
      { letter: 'ஒ', word: 'ஒட்டகம்', translation: 'Camel', emoji: '🐫' },
      { letter: 'ஓ', word: 'ஓடம்', translation: 'Boat', emoji: '⛵' },
      { letter: 'ஔ', word: 'ஔவையார்', translation: 'Poetess', emoji: '👵' }
    ]
  }
];

export default function Library() {
  const { learner, logout, hasFeatureAccess, triggerUpgradeModal } = useLearner();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterLang, setFilterLang] = useState('All');
  const [filterAvail, setFilterAvail] = useState('All');

  // Navigation / Modal View states
  const [selectedBook, setSelectedBook] = useState(null);
  const [readingBook, setReadingBook] = useState(null);
  const [libraryMode, setLibraryMode] = useState('books');
  const [selectedChart, setSelectedChart] = useState(null);

  const handleReadBook = (book, startAudio = false) => {
    if (!book) return;
    const isFree = book.price === 'Free';
    if (!hasFeatureAccess('Pro') && !isFree) {
      triggerUpgradeModal('Pro', `Story: "${book.title}"`, () => {
        setSelectedBook(null);
        setReadingBook(book);
        setCurrentPageIndex(0);
        if (startAudio) {
          setTimeout(() => {
            startReadAloud(getStoryPages(book)[0]);
          }, 300);
        }
      });
      return;
    }

    setSelectedBook(null);
    setReadingBook(book);
    setCurrentPageIndex(0);
    if (startAudio) {
      setTimeout(() => {
        startReadAloud(getStoryPages(book)[0]);
      }, 300);
    }
  };
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const synthRef = useRef(window.speechSynthesis);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  useEffect(() => {
    fetchBooks()
      .then(res => {
        setBooks(res.data || []);
      })
      .catch(err => console.error('Failed to load books:', err))
      .finally(() => setLoading(false));
  }, []);

  // Stop text-to-speech when exiting the reader or changing pages
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [readingBook, currentPageIndex]);

  // Filter book list helper
  const getFilteredBooks = () => {
    return books.filter(book => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = book.title.toLowerCase().includes(query);
        const matchesAuthor = book.author.toLowerCase().includes(query);
        if (!matchesTitle && !matchesAuthor) return false;
      }
      if (filterLevel !== 'All' && !book.level.includes(filterLevel)) {
        return false;
      }
      if (filterType !== 'All' && book.book_type !== filterType) {
        return false;
      }
      if (filterLang !== 'All' && book.language !== filterLang) {
        return false;
      }
      if (filterAvail !== 'All') {
        if (filterAvail === 'Free' && book.price !== 'Free') return false;
        if (filterAvail === 'Available in Library' && book.price !== 'In Library') return false;
        if (filterAvail === 'Audio Support' && !book.audio_available) return false;
      }
      return true;
    });
  };

  // Get recommended books based on current learning target and proficiency
  const getRecommendations = () => {
    if (!learner) return books.filter(b => b.language === 'en');
    const learningTarget = learner.learning_language || 'en';
    const levelStr = learner.level || 'Beginner';

    let matchingLevels = ['Level 2 — Beginner'];
    if (levelStr.toLowerCase() === 'beginner') {
      matchingLevels = ['Level 1 — Early Reader', 'Level 2 — Beginner'];
    } else if (levelStr.toLowerCase() === 'intermediate') {
      matchingLevels = ['Level 2 — Beginner', 'Level 3 — Elementary'];
    } else {
      matchingLevels = ['Level 3 — Elementary', 'Level 4 — Developing Reader'];
    }

    return books.filter(b => b.language === learningTarget && matchingLevels.includes(b.level));
  };

  const filteredList = getFilteredBooks();
  const recommendations = getRecommendations();

  // Reset filters to view all
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterLevel('All');
    setFilterType('All');
    setFilterLang('All');
    setFilterAvail('All');
    setIsSearching(false);
  };

  const handleBookCardClick = (book) => {
    setSelectedBook(book);
  };

  // Helper to render book cover illustration beautifully
  const renderBookCover = (book, customClass = '') => {
    const resolvedSrc = getCoverByTitle(book.title);
    return (
      <img
        src={resolvedSrc}
        alt={book.title}
        className={customClass || styles.bookCoverImage}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={(e) => {
          e.target.src = panchatantraCover;
        }}
      />
    );
  };

  // Get segmented pages of the story
  const getStoryPages = (book) => {
    if (!book || !book.content) return [];
    return book.content.split('\n\n').filter(p => p.trim());
  };

  const currentPages = getStoryPages(readingBook);

  const startReadAloud = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    const langMap = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN' };
    const langTag = langMap[readingBook.language] || 'en-US';
    utterance.lang = langTag;

    // Use populated voices state list
    let currentVoices = voices || [];
    if (currentVoices.length === 0 && window.speechSynthesis) {
      currentVoices = window.speechSynthesis.getVoices() || [];
    }
    
    let voice = currentVoices.find(v => v && v.lang && (
      v.lang.toLowerCase() === langTag.toLowerCase() || 
      v.lang.toLowerCase().startsWith(readingBook.language.toLowerCase())
    ));
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = 0.8; // slower reading speed for children's comprehension

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    } else {
      if (currentPages[currentPageIndex]) {
        startReadAloud(currentPages[currentPageIndex]);
      }
    }
  };

  const speakChartCard = (letter, word, lang) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const langMap = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN' };
    const langTag = langMap[lang] || 'en-US';
    
    let phrase = `${letter} for ${word}`;
    if (lang === 'hi') {
      phrase = `${letter} से ${word}`;
    } else if (lang === 'kn' || lang === 'ta' || lang === 'te') {
      phrase = `${letter} ${word}`;
    }

    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = langTag;

    let currentVoices = voices || [];
    if (currentVoices.length === 0 && window.speechSynthesis) {
      currentVoices = window.speechSynthesis.getVoices() || [];
    }

    const voice = currentVoices.find(v => v && v.lang && (
      v.lang.toLowerCase() === langTag.toLowerCase() || 
      v.lang.toLowerCase().startsWith(lang.toLowerCase())
    ));
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = 0.8;
    synthRef.current.speak(utterance);
  };

  return (
    <div className={styles.pageLayout}>
      <Sidebar onLogout={logout} />
      <main className={styles.mainContent}>
        <Header />

        <AnimatePresence mode="wait">
          {!readingBook ? (
            /* ==========================================
               LIBRARY HOME & CATALOG VIEW
               ========================================== */
            <motion.div
              key="catalog"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {/* Header Hero Title */}
              <div className={styles.headerArea} style={{ backgroundColor: 'var(--color-peach-light)', padding: '24px', borderRadius: 'var(--radius-md)', border: '2.5px solid var(--color-peach)' }}>
                <span className={styles.headerIcon}>📖</span>
                <div className={styles.headerMeta}>
                  <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-orange-dark)' }}>MiGo Digital Library</h2>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-muted)' }}>Ad-free, safe interactive storybooks to accelerate target vocabulary and comprehension</p>
                </div>
              </div>

              {/* Collection Mode Toggles */}
              <div style={{ display: 'flex', gap: '12px', margin: '20px 0 10px 0' }}>
                <button
                  onClick={() => setLibraryMode('books')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '20px',
                    border: '3px solid var(--color-peach)',
                    backgroundColor: libraryMode === 'books' ? 'var(--color-orange)' : '#FFFFFF',
                    color: libraryMode === 'books' ? '#FFFFFF' : 'var(--color-orange-dark)',
                    fontSize: '14px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: libraryMode === 'books' ? 'var(--shadow-soft)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  type="button"
                >
                  📚 Read Storybooks
                </button>
                <button
                  onClick={() => setLibraryMode('charts')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '20px',
                    border: '3px solid var(--color-peach)',
                    backgroundColor: libraryMode === 'charts' ? 'var(--color-orange)' : '#FFFFFF',
                    color: libraryMode === 'charts' ? '#FFFFFF' : 'var(--color-orange-dark)',
                    fontSize: '14px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: libraryMode === 'charts' ? 'var(--shadow-soft)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  type="button"
                >
                  🎨 Interactive Learning Charts
                </button>
              </div>

              {libraryMode === 'books' ? (
                <>
                  {/* Search & Child-friendly Filters */}
              <div className={styles.searchFilterArea} style={{ marginTop: '20px' }}>
                <div className={styles.searchBarWrapper}>
                  <Search size={20} className={styles.searchIcon} style={{ color: 'var(--color-orange)', left: '16px', position: 'absolute' }} />
                  <input
                    type="text"
                    placeholder="Search by book title or author..."
                    className={styles.searchBar}
                    style={{ paddingLeft: '48px', height: '48px', borderRadius: '24px', border: '3px solid var(--color-peach)', fontSize: '15px', fontWeight: 800 }}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearching(!!e.target.value || filterLevel !== 'All' || filterType !== 'All' || filterLang !== 'All' || filterAvail !== 'All');
                    }}
                  />
                  {(isSearching || searchQuery) && (
                    <button
                      onClick={handleResetFilters}
                      className={styles.tabPill}
                      style={{ position: 'absolute', right: '12px', top: '10px', height: '28px', padding: '0 12px', fontSize: '12px' }}
                      type="button"
                    >
                      Clear Search
                    </button>
                  )}
                </div>

                <div className={styles.filterControls} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                  <select
                    className={styles.filterSelect}
                    value={filterLevel}
                    onChange={(e) => {
                      setFilterLevel(e.target.value);
                      setIsSearching(true);
                    }}
                    style={{ borderRadius: '20px', border: '2.5px solid var(--color-peach)' }}
                  >
                    <option value="All">All Levels</option>
                    <option value="Level 1">Level 1 — Early Reader</option>
                    <option value="Level 2">Level 2 — Beginner</option>
                    <option value="Level 3">Level 3 — Elementary</option>
                    <option value="Level 4">Level 4 — Developing Reader</option>
                  </select>

                  <select
                    className={styles.filterSelect}
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value);
                      setIsSearching(true);
                    }}
                    style={{ borderRadius: '20px', border: '2.5px solid var(--color-peach)' }}
                  >
                    <option value="All">All Types</option>
                    <option value="Story">Story</option>
                    <option value="Short Story">Short Story</option>
                    <option value="Graded Reader">Graded Reader</option>
                    <option value="Folk Tale">Folk Tale</option>
                    <option value="Moral Story">Moral Story</option>
                  </select>

                  <select
                    className={styles.filterSelect}
                    value={filterLang}
                    onChange={(e) => {
                      setFilterLang(e.target.value);
                      setIsSearching(true);
                    }}
                    style={{ borderRadius: '20px', border: '2.5px solid var(--color-peach)' }}
                  >
                    <option value="All">All Languages</option>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="kn">Kannada</option>
                    <option value="ta">Tamil</option>
                  </select>

                  <select
                    className={styles.filterSelect}
                    value={filterAvail}
                    onChange={(e) => {
                      setFilterAvail(e.target.value);
                      setIsSearching(true);
                    }}
                    style={{ borderRadius: '20px', border: '2.5px solid var(--color-peach)' }}
                  >
                    <option value="All">All Availability</option>
                    <option value="Free">Free</option>
                    <option value="Available in Library">Available in Library</option>
                    <option value="Audio Support">Audio Support</option>
                  </select>
                </div>
              </div>

              {/* Show Filters Reset Banner if filtering */}
              {(filterLevel !== 'All' || filterType !== 'All' || filterLang !== 'All' || filterAvail !== 'All') && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>Active Filters:</span>
                  {filterLevel !== 'All' && <span className={styles.categoryBadge}>{filterLevel}</span>}
                  {filterType !== 'All' && <span className={styles.categoryBadge}>{filterType}</span>}
                  {filterLang !== 'All' && <span className={styles.categoryBadge}>{LANGUAGE_LABELS[filterLang]}</span>}
                  {filterAvail !== 'All' && <span className={styles.categoryBadge}>{filterAvail}</span>}
                  <button onClick={handleResetFilters} style={{ background: 'none', border: 'none', color: 'var(--color-orange)', fontWeight: 900, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RotateCcw size={14} /> Reset
                  </button>
                </div>
              )}

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <p style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Loading storybook catalog...</p>
                </div>
              ) : isSearching || searchQuery ? (
                /* Search Results Shelf */
                <div className={styles.shelfSection} style={{ marginTop: '30px' }}>
                  <div className={styles.shelfHeader}>
                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-dark)' }}>Search Results ({filteredList.length})</h3>
                  </div>
                  {filteredList.length === 0 ? (
                    <div className={styles.sectionBox} style={{ textAlign: 'center', padding: '40px 20px', border: '3.5px dashed var(--color-peach)' }}>
                      <AlertCircle size={48} color="var(--color-orange)" style={{ margin: '0 auto 12px' }} />
                      <h4 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-dark)' }}>No books match your criteria</h4>
                      <p style={{ color: 'var(--text-muted)', fontWeight: 700, marginTop: '4px' }}>Try switching filters or clearing your search term.</p>
                      <button onClick={handleResetFilters} className={styles.submitBtn} style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '20px' }}>
                        Browse Library Home
                      </button>
                    </div>
                  ) : (
                    <div className={styles.cardsGrid}>
                      {filteredList.map(book => (
                        <div key={book.id} className={styles.bookCard} onClick={() => handleBookCardClick(book)}>
                          <div style={{ height: '170px', overflow: 'hidden', position: 'relative', borderTopLeftRadius: 'var(--radius-sm)', borderTopRightRadius: 'var(--radius-sm)' }}>
                            {renderBookCover(book)}
                            {!hasFeatureAccess('Pro') && book.price !== 'Free' && (
                              <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.65)', padding: '5px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Lock size={12} color="#FFF" />
                              </div>
                            )}
                          </div>
                          <div className={styles.bookBody}>
                            <div className={styles.bookTagRow}>
                              <span className={styles.bookCategoryTag}>{book.book_type}</span>
                              <span className={styles.bookRating}>⭐ {book.rating}</span>
                            </div>
                            <h4 className={styles.bookTitle} style={{ fontSize: '15px', fontWeight: 900, margin: '4px 0 0 0', height: '40px', overflow: 'hidden' }}>{book.title}</h4>
                            <p className={styles.bookAuthor} style={{ margin: '2px 0 10px 0' }}>{book.author}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px dashed var(--color-peach-light)', paddingTop: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)' }}>{book.level.split(' — ')[0]}</span>
                              <span style={{ fontSize: '11px', fontWeight: 900, color: book.price === 'Free' ? 'var(--color-mint)' : 'var(--color-orange-dark)' }}>{book.price === 'Free' ? 'Free' : 'In Library'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Shelves Grid */
                <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  
                  {/* Shelf 1: Recommended For You Carousel */}
                  {recommendations.length > 0 && (
                    <div className={styles.shelfSection} style={{ backgroundColor: '#FFF9F4', padding: '24px', borderRadius: 'var(--radius-md)', border: '2.5px solid var(--color-peach)' }}>
                      <div className={styles.shelfHeader} style={{ marginBottom: '14px' }}>
                        <div>
                          <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-orange-dark)' }}>Recommended for You ➔</h3>
                          <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 800, margin: '4px 0 0 0' }}>
                            Recommended for your current reading level (<strong>{learner?.level || 'Beginner'}</strong>) to build target vocabulary.
                          </p>
                        </div>
                      </div>
                      <div className={styles.shelfScroll} style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {recommendations.map(book => (
                          <div key={book.id} className={styles.bookCard} style={{ flexShrink: 0, width: '180px' }} onClick={() => handleBookCardClick(book)}>
                            <div style={{ height: '150px', overflow: 'hidden', position: 'relative' }}>
                              {renderBookCover(book)}
                              {!hasFeatureAccess('Pro') && book.price !== 'Free' && (
                                <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.65)', padding: '5px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Lock size={12} color="#FFF" />
                                </div>
                              )}
                            </div>
                            <div className={styles.bookBody}>
                              <div className={styles.bookTagRow}>
                                <span className={styles.bookCategoryTag}>{book.book_type}</span>
                                <span className={styles.bookRating}>⭐ {book.rating}</span>
                              </div>
                              <h4 className={styles.bookTitle} style={{ fontSize: '13.5px', fontWeight: 900, margin: '2px 0 0 0', height: '36px', overflow: 'hidden' }}>{book.title}</h4>
                              <p className={styles.bookAuthor} style={{ fontSize: '11px', margin: '0' }}>by {book.author}</p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11px', fontWeight: 900 }}>
                                <span style={{ color: 'var(--text-muted)' }}>{book.level.split(' — ')[0]}</span>
                                <span style={{ color: 'var(--color-mint)' }}>{book.price === 'Free' ? 'Free' : 'In Library'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shelf 2: My Library / Recently Read */}
                  <div className={styles.shelfSection}>
                    <div className={styles.shelfHeader}>
                      <h3 style={{ fontSize: '20px', fontWeight: 900 }}>📚 My Library</h3>
                    </div>
                    <div className={styles.shelfScroll} style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '10px' }}>
                      {books.filter(b => READ_PROGRESS[b.title]).map(book => {
                        const progress = READ_PROGRESS[book.title] || 0;
                        return (
                          <div key={book.id} className={styles.bookCard} style={{ flexShrink: 0, width: '180px' }} onClick={() => handleBookCardClick(book)}>
                            <div style={{ height: '110px', overflow: 'hidden', position: 'relative' }}>
                              {renderBookCover(book)}
                              {!hasFeatureAccess('Pro') && book.price !== 'Free' && (
                                <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.65)', padding: '5px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Lock size={12} color="#FFF" />
                                </div>
                              )}
                            </div>
                            <div className={styles.bookBody} style={{ padding: '12px' }}>
                              <h4 className={styles.bookTitle} style={{ fontSize: '13px', fontWeight: 900, height: '34px', overflow: 'hidden', margin: 0 }}>{book.title}</h4>
                              <div style={{ marginTop: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>
                                  <span>Progress</span>
                                  <span>{progress}%</span>
                                </div>
                                <div style={{ height: '6px', backgroundColor: 'var(--color-peach-light)', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ width: `${progress}%`, height: '100%', backgroundColor: progress === 100 ? 'var(--color-mint)' : 'var(--color-orange)' }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Shelf 3: Early Readers (Level 1) */}
                  <div className={styles.shelfSection}>
                    <div className={styles.shelfHeader}>
                      <h3 style={{ fontSize: '20px', fontWeight: 900 }}>🌱 Early Readers</h3>
                    </div>
                    <div className={styles.shelfScroll} style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '10px' }}>
                      {books.filter(b => b.level.includes('Level 1') && b.language === 'en').map(book => (
                        <div key={book.id} className={styles.bookCard} style={{ flexShrink: 0, width: '180px' }} onClick={() => handleBookCardClick(book)}>
                          <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                            {renderBookCover(book)}
                            {!hasFeatureAccess('Pro') && book.price !== 'Free' && (
                              <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.65)', padding: '5px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Lock size={12} color="#FFF" />
                              </div>
                            )}
                          </div>
                          <div className={styles.bookBody}>
                            <div className={styles.bookTagRow}>
                              <span className={styles.bookCategoryTag}>{book.book_type}</span>
                              <span className={styles.bookRating}>⭐ {book.rating}</span>
                            </div>
                            <h4 className={styles.bookTitle} style={{ fontSize: '13.5px', fontWeight: 900, height: '36px', overflow: 'hidden', margin: '2px 0 0 0' }}>{book.title}</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>
                              <span>{book.pages} pages</span>
                              <span style={{ color: 'var(--color-mint)' }}>{book.price === 'Free' ? 'Free' : 'In Library'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shelf 4: Folk & Moral Stories */}
                  <div className={styles.shelfSection}>
                    <div className={styles.shelfHeader}>
                      <h3 style={{ fontSize: '20px', fontWeight: 900 }}>✨ Folk & Moral Stories</h3>
                    </div>
                    <div className={styles.shelfScroll} style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '10px' }}>
                      {books.filter(b => (b.book_type === 'Folk Tale' || b.book_type === 'Moral Story') && b.language === 'en').map(book => (
                        <div key={book.id} className={styles.bookCard} style={{ flexShrink: 0, width: '180px' }} onClick={() => handleBookCardClick(book)}>
                          <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                            {renderBookCover(book)}
                            {!hasFeatureAccess('Pro') && book.price !== 'Free' && (
                              <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.65)', padding: '5px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Lock size={12} color="#FFF" />
                              </div>
                            )}
                          </div>
                          <div className={styles.bookBody}>
                            <div className={styles.bookTagRow}>
                              <span className={styles.bookCategoryTag}>{book.book_type}</span>
                              <span className={styles.bookRating}>⭐ {book.rating}</span>
                            </div>
                            <h4 className={styles.bookTitle} style={{ fontSize: '13.5px', fontWeight: 900, height: '36px', overflow: 'hidden', margin: '2px 0 0 0' }}>{book.title}</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>
                              <span>{book.pages} pages</span>
                              <span style={{ color: 'var(--color-mint)' }}>{book.price === 'Free' ? 'Free' : 'In Library'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shelf 5: Stories in Indian Languages */}
                  <div className={styles.shelfSection}>
                    <div className={styles.shelfHeader}>
                      <h3 style={{ fontSize: '20px', fontWeight: 900 }}>🇮🇳 Stories in Indian Languages</h3>
                    </div>
                    <div className={styles.shelfScroll} style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '10px' }}>
                      {books.filter(b => b.language === 'hi' || b.language === 'kn' || b.language === 'ta').map(book => (
                        <div key={book.id} className={styles.bookCard} style={{ flexShrink: 0, width: '180px' }} onClick={() => handleBookCardClick(book)}>
                          <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                            {renderBookCover(book)}
                            {!hasFeatureAccess('Pro') && book.price !== 'Free' && (
                              <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.65)', padding: '5px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Lock size={12} color="#FFF" />
                              </div>
                            )}
                          </div>
                          <div className={styles.bookBody}>
                            <div className={styles.bookTagRow}>
                              <span className={styles.bookCategoryTag}>{book.book_type}</span>
                              <span className={styles.bookRating}>⭐ {book.rating}</span>
                            </div>
                            <h4 className={styles.bookTitle} style={{ fontSize: '13.5px', fontWeight: 900, height: '36px', overflow: 'hidden', margin: '2px 0 0 0' }}>{book.title}</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>
                              <span>{LANGUAGE_LABELS[book.language]}</span>
                              <span style={{ color: 'var(--color-mint)' }}>{book.price === 'Free' ? 'Free' : 'In Library'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
                </>
              ) : (
                /* Interactive Learning Charts View */
                <div style={{ marginTop: '30px' }}>
                  <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '15px', marginBottom: '24px', backgroundColor: '#FFFDF9', padding: '16px', borderRadius: '12px', border: '1.5px dashed var(--color-peach)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="var(--color-orange)" />
                    <span>Click on any chart to open its interactive letters, illustration words, and phonetic audio cards. Perfect for starter learners!</span>
                  </p>
                  
                  <div className={styles.cardsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                    {CHARTS_DATA.map((chart) => (
                      <div 
                        key={chart.id} 
                        className={styles.certificateCard} 
                        style={{ cursor: 'pointer', border: '3.5px solid var(--color-peach)', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }} 
                        onClick={() => setSelectedChart(chart)}
                      >
                        <div className={styles.certificateStamp} style={{ fontSize: '32px', margin: '0 auto 12px', width: '70px', height: '70px', borderStyle: 'solid', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {chart.flag}
                        </div>
                        <h4 className={styles.certificateTitle} style={{ fontSize: '18px', fontWeight: 900, marginBottom: '6px' }}>{chart.title}</h4>
                        <p className={styles.certificateSub} style={{ fontSize: '13px', fontWeight: 750, color: 'var(--text-muted)', marginBottom: '12px' }}>{chart.subtitle}</p>
                        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 600, height: '60px', overflow: 'hidden', marginBottom: '16px', lineHeight: 1.4 }}>
                          {chart.desc}
                        </p>
                        <button className={styles.certificateBtn} style={{ marginTop: 'auto', width: '100%', borderRadius: '20px' }} type="button">
                          Open Interactive Chart ➔
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* ==========================================
               CHILD STORYBOOK READER INTERFACE
               ========================================== */
            <motion.div
              key="reader"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.25 }}
              style={{
                backgroundColor: '#FAF7F2',
                borderRadius: 'var(--radius-md)',
                border: '3px solid var(--color-peach)',
                padding: '24px',
                minHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 12px 32px rgba(0,0,0,0.06)'
              }}
            >
              {/* Reader Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px dashed var(--color-peach)', paddingBottom: '16px', marginBottom: '24px' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--color-orange-dark)', textTransform: 'uppercase', tracking: '1px' }}>
                    Reading Fable: {readingBook.book_type}
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-dark)', margin: '2px 0 0 0' }}>{readingBook.title}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Read Aloud Button */}
                  <button
                    onClick={toggleSpeech}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: '2px solid var(--color-peach)',
                      backgroundColor: isSpeaking ? 'var(--color-orange-light)' : '#FFFFFF',
                      color: isSpeaking ? 'var(--color-orange-dark)' : 'var(--text-dark)',
                      fontWeight: 900,
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    <span>{isSpeaking ? 'Pause Voice' : 'Read to Me'}</span>
                  </button>

                  <button
                    onClick={() => setReadingBook(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '2.5px solid var(--color-peach)',
                      backgroundColor: '#FFFFFF',
                      color: 'var(--color-orange-dark)',
                      cursor: 'pointer',
                      fontWeight: 900
                    }}
                    title="Exit Reader"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Reader Book Content Area */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', flex: 1, alignItems: 'center' }} className={styles.readerGridResponsive}>
                {/* Book Cover / Illustration side */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '100%', maxWidth: '280px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 16px 32px rgba(0,0,0,0.12)', border: '6px solid #FFFFFF' }}>
                    {renderBookCover(readingBook, styles.readerImageCover)}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', marginTop: '16px' }}>Illustrated by {readingBook.author}</span>
                </div>

                {/* Big Story text side */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', padding: '10px' }}>
                  <p style={{
                    fontFamily: '"Outfit", "Inter", sans-serif',
                    fontSize: '22px',
                    fontWeight: 700,
                    lineHeight: 1.7,
                    color: '#2C3E50',
                    margin: 0,
                    whiteSpace: 'pre-line',
                    textAlign: 'left'
                  }}>
                    {currentPages[currentPageIndex] || "End of story."}
                  </p>
                </div>
              </div>

              {/* Reader Footer Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2.5px dashed var(--color-peach)', paddingTop: '20px', marginTop: '24px' }}>
                <button
                  onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentPageIndex === 0}
                  className={styles.verifyBtnSecondary}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: '10px 24px', opacity: currentPageIndex === 0 ? 0.4 : 1 }}
                >
                  <ArrowLeft size={18} />
                  <span>Previous</span>
                </button>

                <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text-muted)' }}>
                  Page {currentPageIndex + 1} / {currentPages.length}
                </span>

                <button
                  onClick={() => {
                    if (currentPageIndex < currentPages.length - 1) {
                      setCurrentPageIndex(prev => prev + 1);
                    } else {
                      setReadingBook(null); // Finish reading
                    }
                  }}
                  className={styles.verifyBtn}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: '10px 24px' }}
                >
                  <span>{currentPageIndex === currentPages.length - 1 ? 'Finish Story' : 'Next'}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==========================================
           BOOK DETAILS MODAL (SPLIT LAYOUT)
           ========================================== */}
        {selectedBook && (
          <div className={styles.certModalOverlay} onClick={() => setSelectedBook(null)}>
            <div
              className={styles.certModalContent}
              style={{
                maxWidth: '780px',
                width: '90%',
                padding: '32px',
                textAlign: 'left',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FFFDF9',
                border: '3px solid var(--color-peach)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.certModalClose}
                onClick={() => setSelectedBook(null)}
                style={{ top: '20px', right: '20px' }}
                type="button"
              >
                &times;
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '32px' }} className={styles.detailSplitResponsive}>
                {/* Left Column: Cover & Audio Badge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '100%', maxWidth: '240px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}>
                    {renderBookCover(selectedBook)}
                  </div>
                  
                  {selectedBook.audio_available ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', backgroundColor: 'var(--color-peach-light)', color: 'var(--color-orange-dark)', borderRadius: '20px', fontSize: '12px', fontWeight: 900 }}>
                      <Headphones size={15} />
                      <span>Audio Support Included</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', backgroundColor: '#F0F0F0', color: 'var(--text-muted)', borderRadius: '20px', fontSize: '12px', fontWeight: 900 }}>
                      <VolumeX size={15} />
                      <span>Text Only</span>
                    </div>
                  )}
                </div>

                {/* Right Column: Full Info, Objectives & Read Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--color-orange-dark)', backgroundColor: 'var(--color-peach-light)', padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
                      {selectedBook.book_type}
                    </span>
                    <h3 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-dark)', margin: '8px 0 2px 0' }}>{selectedBook.title}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 800, margin: 0 }}>by {selectedBook.author}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '2.5px dashed var(--color-peach-light)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F1C40F', fontWeight: 800, fontSize: '14px' }}>
                      <Star size={16} fill="#F1C40F" />
                      <span>{selectedBook.rating}</span>
                    </div>
                    <span style={{ color: 'var(--color-peach)' }}>|</span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: 'var(--color-mint)' }}>
                      {selectedBook.price === 'Free' ? 'Free Story' : 'Available in Library'}
                    </span>
                  </div>

                  {/* Metadata Pills */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-dark)', padding: '6px 12px', backgroundColor: 'var(--bg-cream-card)', borderRadius: '6px' }}>
                      📖 {selectedBook.pages} Pages
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-dark)', padding: '6px 12px', backgroundColor: 'var(--bg-cream-card)', borderRadius: '6px' }}>
                      🌐 {LANGUAGE_LABELS[selectedBook.language]}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-dark)', padding: '6px 12px', backgroundColor: 'var(--bg-cream-card)', borderRadius: '6px' }}>
                      ⚡ {selectedBook.level}
                    </span>
                  </div>

                  {/* Why recommended box */}
                  <div style={{ backgroundColor: 'var(--color-peach-light)', borderLeft: '4px solid var(--color-orange)', padding: '12px 16px', borderRadius: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 900, color: 'var(--color-orange-dark)' }}>
                      <Sparkles size={14} />
                      Why this book?
                    </span>
                    <p style={{ fontSize: '13px', color: 'var(--text-dark)', fontWeight: 700, margin: '4px 0 0 0', lineHeight: 1.4 }}>
                      {selectedBook.why_recommended}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '4px' }}>About the Story</h5>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 700, margin: 0, lineHeight: 1.5 }}>
                      {selectedBook.content.substring(0, 180)}...
                    </p>
                  </div>

                  {/* Learning Objectives Benefits */}
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '6px' }}>What your child will learn:</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={14} style={{ color: 'var(--color-orange)' }} />
                        <span>Core Integrity & Values</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={14} style={{ color: 'var(--color-orange)' }} />
                        <span>Moral Reasoning</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={14} style={{ color: 'var(--color-orange)' }} />
                        <span>Fable Vocabulary Builder</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={14} style={{ color: 'var(--color-orange)' }} />
                        <span>Sentence Structure Comprehension</span>
                      </div>
                    </div>
                  </div>

                  {/* Read / Listen Buttons (No pricing / payment terms) */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button
                      className={styles.submitBtn}
                      style={{ flex: 1.2, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      onClick={() => handleReadBook(selectedBook, false)}
                    >
                      {!hasFeatureAccess('Pro') && selectedBook.price !== 'Free' ? (
                        <>
                          <Lock size={16} />
                          <span>Preview Pro to Read</span>
                        </>
                      ) : (
                        <>
                          <Play size={16} fill="#FFFFFF" />
                          <span>Read Story</span>
                        </>
                      )}
                    </button>

                    <button
                      className={styles.verifyBtnSecondary}
                      style={{ flex: 1, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      onClick={() => handleReadBook(selectedBook, true)}
                    >
                      {!hasFeatureAccess('Pro') && selectedBook.price !== 'Free' ? (
                        <>
                          <Lock size={16} />
                          <span>Preview Pro to Listen</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={16} />
                          <span>Listen to Story</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {selectedChart && (
          <div className={styles.certModalOverlay} onClick={() => setSelectedChart(null)}>
            <div 
              className={styles.certModalContent} 
              onClick={(e) => e.stopPropagation()} 
              style={{ 
                maxWidth: '900px', 
                width: '95%', 
                maxHeight: '90vh', 
                overflowY: 'auto',
                border: '6px double var(--color-peach)',
                borderRadius: '24px',
                padding: '30px'
              }}
            >
              <button 
                className={styles.certModalClose} 
                onClick={() => setSelectedChart(null)} 
                type="button"
                style={{ fontSize: '32px', top: '16px', right: '20px' }}
              >
                &times;
              </button>

              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '8px' }}>{selectedChart.flag}</span>
                <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--color-orange-dark)', margin: 0 }}>
                  {selectedChart.title}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontWeight: 800, margin: '8px 0 0 0', fontSize: '14.5px' }}>
                  {selectedChart.subtitle} • Click on any card to hear it read aloud!
                </p>
              </div>

              {/* Grid of Alphabet/Varnamala cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '12px',
                padding: '10px'
              }}>
                {selectedChart.items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => speakChartCard(item.letter, item.word, selectedChart.lang)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '3px solid var(--color-peach-light)',
                      borderRadius: '16px',
                      padding: '18px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: 'var(--shadow-soft)',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.borderColor = 'var(--color-orange)';
                      e.currentTarget.style.backgroundColor = '#FFFDF9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.borderColor = 'var(--color-peach-light)';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                    type="button"
                  >
                    {/* Big colorful letter */}
                    <span style={{
                      fontSize: '38px',
                      fontWeight: 950,
                      color: selectedChart.colors[idx % selectedChart.colors.length],
                      marginBottom: '8px',
                      lineHeight: 1
                    }}>
                      {item.letter}
                    </span>

                    {/* Emoji Illustration */}
                    <span style={{
                      fontSize: '32px',
                      marginBottom: '8px',
                      display: 'block'
                    }} role="img" aria-label={item.word}>
                      {item.emoji}
                    </span>

                    {/* Word label */}
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 850,
                      color: 'var(--text-dark)'
                    }}>
                      {item.word}
                    </span>

                    {/* Phonetic / Translation */}
                    {item.translation && (
                      <span style={{
                        fontSize: '11.5px',
                        fontWeight: 750,
                        color: 'var(--text-muted)',
                        marginTop: '3px',
                        backgroundColor: 'var(--color-peach-light)',
                        padding: '1px 6px',
                        borderRadius: '8px'
                      }}>
                        {item.translation}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
