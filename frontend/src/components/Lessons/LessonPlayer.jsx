// src/components/Lessons/LessonPlayer.jsx
import { useState, useEffect, useRef, Component } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, Mic, MicOff, CheckCircle2, Star, ArrowRight, ArrowLeft,
  Award, Sparkles, RefreshCw, Play, Info, Eye, Type, Trash, HelpCircle, FileText, XCircle,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { useLearner } from '../../services/LearnerContext';
import useTranslate from '../../services/useTranslate';
import speak from '../../services/speak';
import useVoiceInput from '../../services/useVoiceInput';
import { completeLessonDay, fetchLearningPath, generateLearningPath, startSession, endSession, fetchLessonDetail } from '../../services/api';
import owl from '../../assets/images/owl.png';
import treasure from '../../assets/images/treasure.png';
import LessonDocument from './LessonDocument';
import styles from './LessonPlayer.module.css';
import { MIGO_WRITING_STARTERS, getWritingStarterKey, parseTemplateToReact, getWritingLessonData } from './writingHelpers';

const SPEECH_LANG_MAP = {
  en: 'en-US',
  hi: 'hi-IN',
  kn: 'kn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  ml: 'ml-IN',
};

const getRecommendedLessons = (wrongQuestionIndices, lang) => {
  const recommendations = [];
  const hasVocabError = wrongQuestionIndices.some(idx => idx === 0 || idx === 1 || idx === 8);
  const hasGrammarError = wrongQuestionIndices.some(idx => idx === 2 || idx === 3);
  const hasReadingError = wrongQuestionIndices.some(idx => idx === 4 || idx === 5 || idx === 9);
  const hasSpellingError = wrongQuestionIndices.some(idx => idx === 6 || idx === 7);

  if (lang === 'hi') {
    if (hasVocabError) {
      recommendations.push({
        title: 'Hindi Vocabulary Practice',
        description: 'Practice basic nouns, animal cards, and object names in Hindi.',
        link: '/library'
      });
    }
    if (hasGrammarError) {
      recommendations.push({
        title: 'Hindi Sentence Construction',
        description: 'Practice forming simple present tense sentences in Hindi.',
        link: '/home'
      });
    }
    if (hasReadingError) {
      recommendations.push({
        title: 'Hindi Comprehension: Panchatantra Stories',
        description: 'Read moral stories page-by-page and complete quizzes in Hindi.',
        link: '/library'
      });
    }
    if (hasSpellingError) {
      recommendations.push({
        title: 'Hindi Consonant Blends (संयुक्त अक्षर)',
        description: 'Practice reading and writing compound Hindi character spellings.',
        link: '/pronunciation'
      });
    }
  } else if (lang === 'kn') {
    if (hasVocabError) {
      recommendations.push({
        title: 'Kannada Nouns & Basic Vocabulary',
        description: 'Study naming words, colors, and numbers in Kannada.',
        link: '/library'
      });
    }
    if (hasGrammarError) {
      recommendations.push({
        title: 'Kannada Basic Grammar & Pronouns',
        description: 'Learn simple verb structures and basic pronouns in Kannada.',
        link: '/home'
      });
    }
    if (hasReadingError) {
      recommendations.push({
        title: 'Kannada Fables: The Honest Woodcutter',
        description: 'Read moral stories and test comprehension in Kannada.',
        link: '/library'
      });
    }
    if (hasSpellingError) {
      recommendations.push({
        title: 'Kannada Phonics: Varnamala Pronunciation',
        description: 'Use the interactive charts shelf to master letter sounds.',
        link: '/library'
      });
    }
  } else if (lang === 'ta') {
    if (hasVocabError) {
      recommendations.push({
        title: 'Tamil Essential Words Vocabulary',
        description: 'Review everyday items, animals, and object naming words.',
        link: '/library'
      });
    }
    if (hasGrammarError) {
      recommendations.push({
        title: 'Tamil Sentence Grammar',
        description: 'Understand subject-verb matches and word arrangements in Tamil.',
        link: '/home'
      });
    }
    if (hasReadingError) {
      recommendations.push({
        title: 'Tamil Reading Practice: Aesop Stories',
        description: 'Read translated moral stories page-by-page in Tamil.',
        link: '/library'
      });
    }
    if (hasSpellingError) {
      recommendations.push({
        title: 'Tamil Phonics pronunciation',
        description: 'Practice speaking key letters with target mic check cards.',
        link: '/pronunciation'
      });
    }
  } else {
    // English default
    if (hasVocabError) {
      recommendations.push({
        title: 'English CVC Phonics Words',
        description: 'Review consonants and short vowel sounds like a, e, i, o, u.',
        link: '/library'
      });
    }
    if (hasGrammarError) {
      recommendations.push({
        title: 'Basic English Nouns & Verbs',
        description: 'Identify subject naming words and verb action words.',
        link: '/home'
      });
    }
    if (hasReadingError) {
      recommendations.push({
        title: 'English Reading Aloud: Aesop Fables',
        description: 'Improve phrasing, grammar pauses, and sentence flow.',
        link: '/library'
      });
    }
    if (hasSpellingError) {
      recommendations.push({
        title: 'English Digraphs & Syllables (th, sh, ch)',
        description: 'Identify and speak complex digraph sound combinations.',
        link: '/pronunciation'
      });
    }
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Vocabulary Practice',
      description: 'Review common vocabulary words to improve accuracy.',
      link: '/library'
    });
  }

  return recommendations.slice(0, 2);
};

const ALPHABETS = {
  en: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  hi: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट', 'ठ', 'ड', 'ढ', 'त', 'थ', 'ದ', 'ಧ', 'ನ', 'ಪ', 'ഫ', 'ಬ', 'ಭ', 'ಮ', 'ಯ', 'ರ', 'ಲ', 'ವ', 'ಹ'],
  kn: ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 'ಎ', 'ಏ', 'ಒ', 'ಓ', 'ಕ', 'ಖ', 'ಗ', 'ಘ', 'ಚ', 'ಛ', 'ಜ', 'ಝ', 'ಟ', 'ಠ', 'ಡ', 'ಢ', 'ತ', 'ಥ', 'ದ', 'ಧ', 'ನ', 'ಪ', 'ಫ', 'ಬ', 'ಭ', 'ಮ', 'ಯ', 'ರ', 'ಲ', 'ವ', 'ಹ'],
  ta: ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ', 'க', 'ங', 'ச', 'ஞ', 'ட', 'ண', 'த', 'ந', 'ப', 'ம', 'ய', 'ர', 'ல', 'வ', 'ழ', 'ள', 'ற', 'ன']
};

function IllustrationSVG({ name, size = 60 }) {
  const norm = (name || '').toLowerCase().trim();
  let emoji = '🍎';
  switch (norm) {
    case 'apple': emoji = '🍎'; break;
    case 'ball': emoji = '⚽'; break;
    case 'cat': emoji = '🐱'; break;
    case 'dog': emoji = '🐶'; break;
    case 'egg': emoji = '🥚'; break;
    case 'fish': emoji = '🐟'; break;
    case 'goat': emoji = '🐐'; break;
    case 'hat': emoji = '🎩'; break;
    case 'ink': emoji = '✒️'; break;
    case 'jug': emoji = '🥛'; break;
    case 'key': emoji = '🔑'; break;
    case 'leaf': emoji = '🍃'; break;
    case 'milk': emoji = '🥛'; break;
    case 'nest': emoji = '🪹'; break;
    case 'owl': emoji = '🦉'; break;
    case 'pen': emoji = '🖊️'; break;
    case 'queen': emoji = '👑'; break;
    case 'ring': emoji = '💍'; break;
    case 'sun': emoji = '☀️'; break;
    case 'tree': emoji = '🌳'; break;
    case 'umbrella': emoji = '☂️'; break;
    case 'van': emoji = '🚐'; break;
    case 'watch': emoji = '⌚'; break;
    case 'xylophone': emoji = '🪘'; break;
    case 'yak': emoji = '🐃'; break;
    case 'zebra': emoji = '🦓'; break;
    case 'trophy': emoji = '🏆'; break;

    // Compound Words
    case 'rain': emoji = '🌧️'; break;
    case 'bow': emoji = '🎀'; break;
    case 'rainbow': emoji = '🌈'; break;
    case 'shine': emoji = '✨'; break;
    case 'sunshine': emoji = '☀️'; break;
    case 'tooth': emoji = '🦷'; break;
    case 'brush': emoji = '🪥'; break;
    case 'toothbrush': emoji = '🪥'; break;
    case 'butter': emoji = '🧈'; break;
    case 'fly': emoji = '🪰'; break;
    case 'butterfly': emoji = '🦋'; break;
    case 'sea': emoji = '🌊'; break;
    case 'shell': emoji = '🐚'; break;
    case 'seashell': emoji = '🐚'; break;
    case 'snowman': emoji = '⛄'; break;
    case 'notebook': emoji = '📓'; break;
    case 'basketball': emoji = '🏀'; break;
    case 'raincoat': emoji = '🧥'; break;
    case 'raindrop': emoji = '💧'; break;
    case 'toothache': emoji = '🦷'; break;
    case 'toothpaste': emoji = '🪥'; break;
    case 'button': emoji = '🔘'; break;
    case 'butterscotch': emoji = '🍬'; break;

    // Opposites
    case 'hot': emoji = '🔥'; break;
    case 'cold': emoji = '❄️'; break;
    case 'big': emoji = '🐘'; break;
    case 'small': emoji = '🐭'; break;
    case 'up': emoji = '⬆️'; break;
    case 'down': emoji = '⬇️'; break;
    case 'heavy': emoji = '📦'; break;
    case 'light': emoji = '🎈'; break;
    case 'happy': emoji = '😊'; break;
    case 'sad': emoji = '😢'; break;
    case 'glad': emoji = '😃'; break;
    case 'angry': emoji = '😠'; break;
    case 'noon': emoji = '🕛'; break;
    case 'early': emoji = '🌅'; break;
    case 'late': emoji = '🌃'; break;
    case 'rich': emoji = '💰'; break;
    case 'poor': emoji = '🪙'; break;

    // Similars
    case 'large': emoji = '🦖'; break;
    case 'start': emoji = '🏁'; break;
    case 'begin': emoji = '🚀'; break;
    case 'shut': emoji = '🚪'; break;
    case 'close': emoji = '🔒'; break;
    case 'quick': emoji = '⚡'; break;
    case 'fast': emoji = '🏎️'; break;
    case 'open': emoji = '🔓'; break;
    case 'wide': emoji = '↔️'; break;
    case 'mad': emoji = '🤪'; break;

    // Health
    case 'doctor': emoji = '🩺'; break;
    case 'nurse': emoji = '👩‍⚕️'; break;
    case 'medicine': emoji = '💊'; break;
    case 'hospital': emoji = '🏥'; break;
    case 'health': emoji = '🍎'; break;
    case 'strong': emoji = '💪'; break;

    // Occupations
    case 'teacher': emoji = '👩‍🏫'; break;
    case 'builder': emoji = '👷'; break;
    case 'driver': emoji = '🧑‍✈️'; break;
    case 'farmer': emoji = '👨‍🌾'; break;
    case 'tailor': emoji = '🧵'; break;

    // Time
    case 'morning': emoji = '🌅'; break;
    case 'afternoon': emoji = '☀️'; break;
    case 'evening': emoji = '🌇'; break;
    case 'night': emoji = '🌃'; break;
    case 'day': emoji = '📅'; break;

    // Directions
    case 'left': emoji = '◀️'; break;
    case 'right': emoji = '▶️'; break;
    case 'straight': emoji = '▲'; break;
    case 'back': emoji = '▼'; break;
    case 'stop': emoji = '🛑'; break;
    case 'slow': emoji = '🐢'; break;
    case 'school': emoji = '🏫'; break;
    case 'shop': emoji = '🏪'; break;
    case 'police': emoji = '👮'; break;
    case 'cook': emoji = '🧑‍🍳'; break;
    case 'help': emoji = '🙋'; break;
    case 'teach': emoji = '🏫'; break;
    case 'build': emoji = '🏗️'; break;
    case 'drive': emoji = '🚗'; break;
    case 'grow': emoji = '🌱'; break;
    case 'sew': emoji = '🪡'; break;
    case 'sunset': emoji = '🌇'; break;
    case 'stars': emoji = '⭐'; break;
    case 'light': emoji = '💡'; break;
    case 'turn': emoji = '🔄'; break;
    case 'path': emoji = '🗺️'; break;
    case 'return': emoji = '↩️'; break;
    case 'high': emoji = '📈'; break;
    case 'care': emoji = '❤️'; break;
    case 'cure': emoji = '🩹'; break;
    case 'clinic': emoji = '🏥'; break;
    default: emoji = '🌟'; break;
  }

  const adjustedSize = Math.round(size * 1.25);

  return (
    <span
      style={{
        fontSize: `${adjustedSize}px`,
        display: 'inline-block',
        lineHeight: 1.1,
        animation: 'float 3.5s ease-in-out infinite',
        transformOrigin: 'center bottom',
        userSelect: 'none'
      }}
    >
      {emoji}
    </span>
  );
}

const LETTER_META = {
  A: { name: 'A', phonetic: 'Ay', word: 'Apple', illustration: 'apple', color: '#4CAF50', badgeBg: '#E8F5E9' },
  B: { name: 'B', phonetic: 'Bee', word: 'Ball', illustration: 'ball', color: '#FF9800', badgeBg: '#FFF3E0' },
  C: { name: 'C', phonetic: 'See', word: 'Cat', illustration: 'cat', color: '#2196F3', badgeBg: '#E3F2FD' },
  D: { name: 'D', phonetic: 'Dee', word: 'Dog', illustration: 'dog', color: '#E74C3C', badgeBg: '#FDEDEC' },
  E: { name: 'E', phonetic: 'Ee', word: 'Egg', illustration: 'egg', color: '#F1C40F', badgeBg: '#FEF9E7' },
  F: { name: 'F', phonetic: 'Eff', word: 'Fish', illustration: 'fish', color: '#16A085', badgeBg: '#E8F8F5' },
  G: { name: 'G', phonetic: 'Jee', word: 'Goat', illustration: 'goat', color: '#8E44AD', badgeBg: '#F5EEF8' },
  H: { name: 'H', phonetic: 'Aych', word: 'Hat', illustration: 'hat', color: '#34495E', badgeBg: '#EAECEE' },
  I: { name: 'I', phonetic: 'Eye', word: 'Ink', illustration: 'ink', color: '#2C3E50', badgeBg: '#EBEDEF' },
  J: { name: 'J', phonetic: 'Jay', word: 'Jug', illustration: 'jug', color: '#27AE60', badgeBg: '#EAFAF1' },
  K: { name: 'K', phonetic: 'Kay', word: 'Key', illustration: 'key', color: '#D35400', badgeBg: '#FDF2E9' },
  L: { name: 'L', phonetic: 'Ell', word: 'Leaf', illustration: 'leaf', color: '#2ECC71', badgeBg: '#EAFAF1' },
  M: { name: 'M', phonetic: 'Em', word: 'Milk', illustration: 'milk', color: '#9B59B6', badgeBg: '#F4ECF7' },
  N: { name: 'N', phonetic: 'En', word: 'Nest', illustration: 'nest', color: '#3498DB', badgeBg: '#EBF5FB' },
  O: { name: 'O', phonetic: 'Oh', word: 'Owl', illustration: 'owl', color: '#E67E22', badgeBg: '#FDF2E9' },
  P: { name: 'P', phonetic: 'Pee', word: 'Pen', illustration: 'pen', color: '#1ABC9C', badgeBg: '#E8F8F5' },
  Q: { name: 'Q', phonetic: 'Kyoo', word: 'Queen', illustration: 'queen', color: '#F39C12', badgeBg: '#FEF5E7' },
  R: { name: 'R', phonetic: 'Ar', word: 'Ring', illustration: 'ring', color: '#2980B9', badgeBg: '#EAF2F8' },
  S: { name: 'S', phonetic: 'Ess', word: 'Sun', illustration: 'sun', color: '#F1C40F', badgeBg: '#FEF9E7' },
  T: { name: 'T', phonetic: 'Tee', word: 'Tree', illustration: 'tree', color: '#27AE60', badgeBg: '#EAFAF1' },
  U: { name: 'U', phonetic: 'Yoo', word: 'Umbrella', illustration: 'umbrella', color: '#9B59B6', badgeBg: '#F4ECF7' },
  V: { name: 'V', phonetic: 'Vee', word: 'Van', illustration: 'van', color: '#E74C3C', badgeBg: '#FDEDEC' },
  W: { name: 'W', phonetic: 'Double-Yoo', word: 'Watch', illustration: 'watch', color: '#34495E', badgeBg: '#EAECEE' },
  X: { name: 'X', phonetic: 'Ex', word: 'Xylophone', illustration: 'xylophone', color: '#16A085', badgeBg: '#E8F8F5' },
  Y: { name: 'Y', phonetic: 'Wye', word: 'Yak', illustration: 'yak', color: '#8E44AD', badgeBg: '#F5EEF8' },
  Z: { name: 'Z', phonetic: 'Zee', word: 'Zebra', illustration: 'zebra', color: '#2C3E50', badgeBg: '#EBEDEF' },

  // Hindi Swar & Vyanjan
  'अ': { name: 'अ', phonetic: 'Ah', word: 'अनार', illustration: 'apple', color: '#4CAF50', badgeBg: '#E8F5E9' },
  'आ': { name: 'आ', phonetic: 'Aa', word: 'आम', illustration: 'sun', color: '#FF9800', badgeBg: '#FFF3E0' },
  'इ': { name: 'इ', phonetic: 'Ih', word: 'इमली', illustration: 'leaf', color: '#2196F3', badgeBg: '#E3F2FD' },
  'ई': { name: 'ई', phonetic: 'Eee', word: 'ईख', illustration: 'tree', color: '#E74C3C', badgeBg: '#FDEDEC' },
  'उ': { name: 'उ', phonetic: 'Uh', word: 'उल्लू', illustration: 'owl', color: '#F1C40F', badgeBg: '#FEF9E7' },
  'ऊ': { name: 'ऊ', phonetic: 'Ooo', word: 'ऊंत', illustration: 'yak', color: '#8E44AD', badgeBg: '#F5EEF8' },
  'क': { name: 'क', phonetic: 'Ka', word: 'कमल', illustration: 'leaf', color: '#1ABC9C', badgeBg: '#E8F8F5' },
  'ख': { name: 'ख', phonetic: 'Kha', word: 'खरगोश', illustration: 'dog', color: '#E67E22', badgeBg: '#FDF2E9' },
  'ग': { name: 'ग', phonetic: 'Ga', word: 'गमला', illustration: 'tree', color: '#2980B9', badgeBg: '#EAF2F8' },
  'घ': { name: 'घ', phonetic: 'Gha', word: 'घर', illustration: 'home', color: '#27AE60', badgeBg: '#EAFAF1' },
  'च': { name: 'च', phonetic: 'Cha', word: 'चम्मच', illustration: 'pen', color: '#9B59B6', badgeBg: '#F4ECF7' },
  'छ': { name: 'छ', phonetic: 'Chha', word: 'छतरी', illustration: 'umbrella', color: '#3498DB', badgeBg: '#EBF5FB' },
  'ज': { name: 'ज', phonetic: 'Ja', word: 'जग', illustration: 'jug', color: '#E74C3C', badgeBg: '#FDEDEC' },
  'झ': { name: 'झ', phonetic: 'Jha', word: 'झंडा', illustration: 'sun', color: '#F1C40F', badgeBg: '#FEF9E7' },
  'ट': { name: 'ट', phonetic: 'Ta', word: 'टमाटर', illustration: 'apple', color: '#16A085', badgeBg: '#E8F8F5' },
  'ठ': { name: 'ठ', phonetic: 'Tha', word: 'ठठेरा', illustration: 'key', color: '#D35400', badgeBg: '#FDF2E9' },
  'ड': { name: 'ड', phonetic: 'Da', word: 'डमरू', illustration: 'ball', color: '#2ECC71', badgeBg: '#EAFAF1' },
  'ढ': { name: 'ढ', phonetic: 'Dha', word: 'ढक्कन', illustration: 'jug', color: '#9B59B6', badgeBg: '#F4ECF7' },
  'त': { name: 'त', phonetic: 'Ta', word: 'तरबूज', illustration: 'apple', color: '#3498DB', badgeBg: '#EBF5FB' },
  'थ': { name: 'थ', phonetic: 'Tha', word: 'थर्मस', illustration: 'jug', color: '#E67E22', badgeBg: '#FDF2E9' },
  'द': { name: 'द', phonetic: 'Da', word: 'दवात', illustration: 'ink', color: '#1ABC9C', badgeBg: '#E8F8F5' },
  'ध': { name: 'ध', phonetic: 'Dha', word: 'धनुष', illustration: 'pen', color: '#F39C12', badgeBg: '#FEF5E7' },
  'प': { name: 'प', phonetic: 'Pa', word: 'पतंग', illustration: 'sun', color: '#2980B9', badgeBg: '#EAF2F8' },
  'फ': { name: 'फ', phonetic: 'Pha', word: 'फल', illustration: 'food', color: '#27AE60', badgeBg: '#EAFAF1' },
  'ब': { name: 'ब', phonetic: 'Ba', word: 'बतख', illustration: 'fish', color: '#9B59B6', badgeBg: '#F4ECF7' },
  'भ': { name: 'भ', phonetic: 'Bha', word: 'भालू', illustration: 'dog', color: '#E74C3C', badgeBg: '#FDEDEC' },
  'म': { name: 'म', phonetic: 'Ma', word: 'मछली', illustration: 'fish', color: '#34495E', badgeBg: '#EAECEE' },
  'य': { name: 'य', phonetic: 'Ya', word: 'यज्ञ', illustration: 'sun', color: '#2C3E50', badgeBg: '#EBEDEF' },
  'र': { name: 'र', phonetic: 'Ra', word: 'रथ', illustration: 'van', color: '#27AE60', badgeBg: '#EAFAF1' },
  'ल': { name: 'ल', phonetic: 'La', word: 'ಲಟ್ಟೂ', illustration: 'ball', color: '#FF9800', badgeBg: '#FFF3E0' },

  // Kannada Swar & Vyanjan
  'ಅ': { name: 'ಅ', phonetic: 'Ah', word: 'ಅರಸ', illustration: 'queen', color: '#4CAF50', badgeBg: '#E8F5E9' },
  'ಆ': { name: 'ಆ', phonetic: 'Aa', word: 'ಆನೆ', illustration: 'dog', color: '#FF9800', badgeBg: '#FFF3E0' },
  'ಇ': { name: 'ಇ', phonetic: 'Ih', word: 'ಇಲಿ', illustration: 'cat', color: '#2196F3', badgeBg: '#E3F2FD' },
  'ಈ': { name: 'ಈ', phonetic: 'Eee', word: 'ಈಜು', illustration: 'fish', color: '#E74C3C', badgeBg: '#FDEDEC' },
  'ಉ': { name: 'ಉ', phonetic: 'Uh', word: 'ಉಡುಪು', illustration: 'hat', color: '#F1C40F', badgeBg: '#FEF9E7' },
  'ಊ': { name: 'ಊ', phonetic: 'Ooo', word: 'ಊಟ', illustration: 'food', color: '#8E44AD', badgeBg: '#F5EEF8' },

  // Tamil Uyir & Mei
  'அ': { name: 'அ', phonetic: 'Ah', word: 'அம்மா', illustration: 'owl', color: '#4CAF50', badgeBg: '#E8F5E9' },
  'ஆ': { name: 'ஆ', phonetic: 'Aa', word: 'ஆடு', illustration: 'goat', color: '#FF9800', badgeBg: '#FFF3E0' },
  'இ': { name: 'இ', phonetic: 'Ih', word: 'இலை', illustration: 'leaf', color: '#2196F3', badgeBg: '#E3F2FD' },
  'ஈ': { name: 'ஈ', phonetic: 'Eee', word: 'ஈட்டி', illustration: 'pen', color: '#E74C3C', badgeBg: '#FDEDEC' },
  'உ': { name: 'உ', phonetic: 'Uh', word: 'உரல்', illustration: 'jug', color: '#F1C40F', badgeBg: '#FEF9E7' },
  'ஊ': { name: 'ஊ', phonetic: 'Ooo', word: 'ஊஞ்சல்', illustration: 'ball', color: '#8E44AD', badgeBg: '#F5EEF8' },
  'க்': { name: 'க்', phonetic: 'Ik', word: 'கொக்கு', illustration: 'fish', color: '#1ABC9C', badgeBg: '#E8F8F5' },
  'ங': { name: 'ங', phonetic: 'Ing', word: 'சிங்கம்', illustration: 'dog', color: '#E67E22', badgeBg: '#FDF2E9' },
  'ச்': { name: 'ச்', phonetic: 'Ich', word: 'தச்சர்', illustration: 'pen', color: '#2980B9', badgeBg: '#EAF2F8' },
  'ஞ்': { name: 'ஞ்', phonetic: 'Inj', word: 'பஞ்சு', illustration: 'egg', color: '#27AE60', badgeBg: '#EAFAF1' },
  'ட்': { name: 'ட்', phonetic: 'It', word: 'வட்டம்', illustration: 'ball', color: '#9B59B6', badgeBg: '#F4ECF7' },
  'ண்': { name: 'ண்', phonetic: 'Inn', word: 'வண்ணம்', illustration: 'ball', color: '#3498DB', badgeBg: '#EBF5FB' },
  'த்': { name: 'த்', phonetic: 'Ith', word: 'நத்தை', illustration: 'cat', color: '#E74C3C', badgeBg: '#FDEDEC' },
  'ந்': { name: 'ந்', phonetic: 'In', word: 'பந்து', illustration: 'ball', color: '#F1C40F', badgeBg: '#FEF9E7' },
  'ப்': { name: 'ப்', phonetic: 'Ip', word: 'கப்பல்', illustration: 'van', color: '#16A085', badgeBg: '#E8F8F5' },
  'ம்': { name: 'ம்', phonetic: 'Im', word: 'மரம்', illustration: 'tree', color: '#D35400', badgeBg: '#FDF2E9' },
  'ய்': { name: 'ய்', phonetic: 'Iy', word: 'நாய்', illustration: 'dog', color: '#2ECC71', badgeBg: '#EAFAF1' },
  'ர்': { name: 'ர்', phonetic: 'Ir', word: 'தேர்', illustration: 'van', color: '#9B59B6', badgeBg: '#F4ECF7' }
};

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function TracingCanvas({ targetText = 'A', mode = 'letter' }) {
  const t = useTranslate();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const width = mode === 'sentence' ? 480 : 300;
  const height = 240;

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // Draw notebook lines
    const lines = [40, 100, 140, 200];
    lines.forEach((y, idx) => {
      ctx.strokeStyle = idx === 0 || idx === 3 ? '#FFB6B6' : '#B3E5FC';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });

    // Draw dotted helper text in the background
    ctx.fillStyle = '#E2E8F0';
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 6]);
    ctx.font = mode === 'sentence' ? 'bold 36px Outfit, sans-serif' : (mode === 'word' ? 'bold 72px Outfit, sans-serif' : 'bold 130px Outfit, sans-serif');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Position text in the middle
    ctx.strokeText(targetText, width / 2, 120);
    ctx.setLineDash([]);
  };

  useEffect(() => {
    redrawCanvas();
  }, [targetText, mode]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#FF7A00'; // Brand orange pencil
    ctx.lineWidth = mode === 'sentence' ? 6 : 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{
          border: '3px dashed var(--color-peach-light)',
          borderRadius: '20px',
          background: '#FFFFFF',
          cursor: 'crosshair',
          touchAction: 'none',
          boxShadow: '0 4px 15px rgba(255, 122, 0, 0.05)'
        }}
      />
      <button
        onClick={redrawCanvas}
        type="button"
        style={{
          padding: '6px 18px',
          borderRadius: '20px',
          background: '#FFF0F0',
          border: 'none',
          color: '#E74C3C',
          fontWeight: 800,
          fontSize: '12px',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(231, 76, 60, 0.1)'
        }}
      >
        {t('clearTracing')}
      </button>
    </div>
  );
}

const BEGINNER_WRITING_TOPICS = [
  { title: 'Writing the Alphabet', desc: 'Learn to write A to Z' },
  { title: 'Writing Small Letters', desc: 'Learn to write a to z' },
  { title: 'Writing Numbers', desc: 'Learn to write 1 to 10' },
  { title: 'Simple Words', desc: 'Write easy 3-letter words' },
  { title: 'Naming Words', desc: 'Write names of things around us' },
  { title: 'Action Words', desc: 'Write words for actions' },
  { title: 'Small Sentences', desc: 'Write short and simple sentences' },
  { title: 'Fun with Practice', desc: 'Let\'s write what you know!' }
];

const INTERMEDIATE_WRITING_TOPICS = [
  { title: 'Word Building', desc: 'Unscramble the letters' },
  { title: 'Sentence Building', desc: 'Create meaningful sentences' },
  { title: 'Paragraph Writing', desc: 'Write short paragraphs' },
  { title: 'Punctuation', desc: 'Use punctuation correctly' },
  { title: 'Capitalization', desc: 'Use capital letters' },
  { title: 'Creative Writing', desc: 'Write your own ideas' },
  { title: 'Letter Writing', desc: 'Write friendly letters' },
  { title: 'Practice Test', desc: 'Test your writing skills' }
];

const ADVANCED_WRITING_TOPICS = [
  { title: 'Formal Correspondence', desc: 'Draft letters and emails' },
  { title: 'Creative Narratives', desc: 'Compose short stories with moral' },
  { title: 'Descriptive Essays', desc: 'Describe scenery or experiences' },
  { title: 'Opinion & Arguments', desc: 'Express viewpoints on social themes' },
  { title: 'Text Summarization', desc: 'Summarize a given reading passage' },
  { title: 'Business Letters', desc: 'Write applications or invites' },
  { title: 'Report Writing', desc: 'Document incidents or observations' },
  { title: 'Independent Project', desc: 'Comprehensive independent essay' }
];

const WRITING_TRANSLATIONS = {
  hi: {
    'Formal Correspondence': 'औपचारिक पत्रचार',
    'Creative Narratives': 'सृजनात्मक कहानियाँ',
    'Descriptive Essays': 'वर्णनात्मक निबंध',
    'Opinion & Arguments': 'विचार और तर्क',
    'Text Summarization': 'पाठ सारांश',
    'Business Letters': 'व्यावसायिक पत्र',
    'Report Writing': 'विवरण लेखन',
    'Independent Project': 'स्वतंत्र परियोजना',
    'Writing the Alphabet': 'वर्णमाला लिखना',
    'Writing Small Letters': 'छोटे अक्षर लिखना',
    'Writing Numbers': 'संख्याएँ लिखना',
    'Simple Words': 'सरल शब्द',
    'Naming Words': 'नामकरण शब्द',
    'Action Words': 'क्रिया शब्द',
    'Small Sentences': 'छोटे वाक्य',
    'Fun with Practice': 'अभ्यास का मज़ा',
    'Word Building': 'शब्द निर्माण',
    'Sentence Building': 'वाक्य निर्माण',
    'Paragraph Writing': 'अनुच्छेद लेखन',
    'Punctuation': 'विराम चिन्ह',
    'Capitalization': 'वर्तनी और शुद्धता',
    'Creative Writing': 'रचनात्मक लेखन',
    'Letter Writing': 'पत्र लेखन',
    'Practice Test': 'अभ्यास परीक्षा',
  },
  kn: {
    'Formal Correspondence': 'ಔಪಚಾರಿಕ ಪತ್ರವ್ಯವಹಾರ',
    'Creative Narratives': 'ಸೃಜನಶೀಲ ಕಥೆಗಳು',
    'Descriptive Essays': 'ವಿವರಣಾತ್ಮಕ ಪ್ರಬಂಧಗಳು',
    'Opinion & Arguments': 'ಅಭಿಪ್ರಾಯ ಮತ್ತು ಚರ್ಚೆ',
    'Text Summarization': 'ಪಠ್ಯದ ಸಾರಾಂಶ',
    'Business Letters': 'ವ್ಯವಹಾರ ಪತ್ರಗಳು',
    'Report Writing': 'ವರದಿ ಬರವಣಿಗೆ',
    'Independent Project': 'ಸ್ವತಂತ್ರ ಯೋಜನೆ',
    'Writing the Alphabet': 'ಅಕ್ಷರಮಾಲೆ ಬರೆಯುವುದು',
    'Writing Small Letters': 'ಚಿಕ್ಕ ಅಕ್ಷರಗಳನ್ನು ಬರೆಯುವುದು',
    'Writing Numbers': 'ಸಂಖ್ಯೆಗಳನ್ನು ಬರೆಯುವುದು',
    'Simple Words': 'ಸರಳ ಪದಗಳು',
    'Naming Words': 'ಹೆಸರಿಸುವ ಪದಗಳು',
    'Action Words': 'ಕ್ರಿಯಾ ಪದಗಳು',
    'Small Sentences': 'ಸಣ್ಣ ವಾಕ್ಯಗಳು',
    'Fun with Practice': 'ಅಭ್ಯಾಸದ ಆಟ',
    'Word Building': 'ಪದ ರಚನೆ',
    'Sentence Building': 'ವಾಕ್ಯ ರಚನೆ',
    'Paragraph Writing': 'ಪ್ಯಾರಾಗ್ರಾಫ್ ಬರೆಯುವುದು',
    'Punctuation': 'ವಿರಾಮ ಚಿಹ್ನೆಗಳು',
    'Capitalization': 'ಅಕ್ಷರ ಜೋಡಣೆ',
    'Creative Writing': 'ಸೃಜನಶೀಲ ಬರವಣಿಗೆ',
    'Letter Writing': 'ಪತ್ರ ಬರವಣಿಗೆ',
    'Practice Test': 'ಅಭ್ಯಾಸ ಪರೀಕ್ಷೆ',
  },
  ta: {
    'Formal Correspondence': 'அலுவலகத் தொடர்பு',
    'Creative Narratives': 'படைப்பாற்றல் கதைகள்',
    'Descriptive Essays': 'விளக்கக் கட்டுரைகள்',
    'Opinion & Arguments': 'கருத்துக்கள் மற்றும் வாதங்கள்',
    'Text Summarization': 'உரைச் சுருக்கம்',
    'Business Letters': 'வணிகக் கடிதங்கள்',
    'Report Writing': 'அறிக்கை எழுதுதல்',
    'Independent Project': 'சுயாதீன திட்டம்',
    'Writing the Alphabet': 'நெடுங்கணக்கு எழுதுதல்',
    'Writing Small Letters': 'சிறிய எழுத்துக்களை எழுதுதல்',
    'Writing Numbers': 'எண்களை எழுதுதல்',
    'Simple Words': 'எளிய சொற்கள்',
    'Naming Words': 'பெயர்ச்சொற்கள்',
    'Action Words': 'வினைச்சொற்கள்',
    'Small Sentences': 'சிறு வாக்கியங்கள்',
    'Fun with Practice': 'பயிற்சி விளையாட்டு',
    'Word Building': 'சொல் உருவாக்கம்',
    'Sentence Building': 'வாக்கிய உருவாக்கம்',
    'Paragraph Writing': 'பத்தி எழுதுதல்',
    'Punctuation': 'நிறுத்தற்குறிகள்',
    'Capitalization': 'எழுத்துக்கூட்டுதல்',
    'Creative Writing': 'படைப்பாற்றல் எழுத்து',
    'Letter Writing': 'கடிதம் எழுதுதல்',
    'Practice Test': 'பயிற்சி தேர்வு',
  }
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("LessonPlayer Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: '#FAF9F6',
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '3px solid #FFCDD2',
            borderRadius: '24px',
            padding: '40px 32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span style={{ fontSize: '48px' }}>⚠️</span>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#D32F2F', margin: 0 }}>
              Lesson Failed to Render
            </h2>
            <p style={{ fontSize: '14px', color: '#666666', fontWeight: 700, margin: 0, lineHeight: 1.5 }}>
              We encountered a display issue while rendering this lesson slide.
            </p>
            {this.state.error && (
              <pre style={{
                background: '#FFF5F5',
                border: '1px solid #FFCDD2',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '11px',
                color: '#C62828',
                textAlign: 'left',
                width: '100%',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                margin: '8px 0'
              }}>
                {this.state.error.toString()}<br />
                {this.state.error.stack?.split("\n").slice(0, 4).join("\n")}
              </pre>
            )}
            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '12px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#FF7A00',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: 900,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Reload
              </button>
              <button
                onClick={() => window.location.href = '/home'}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#F1F5F9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: 900,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Adventure Map
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function LessonPlayerInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { learner } = useLearner();
  const t = useTranslate();

  if (!learner) {
    return (
      <div style={{
        background: '#FAF9F6',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          background: '#FFFFFF',
          border: '3px solid #FFE0B2',
          borderRadius: '24px',
          padding: '40px 32px',
          maxWidth: '450px',
          width: '100%',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#FF7A00', margin: '0 0 12px 0' }}>
            Ready to play?
          </h2>
          <p style={{ fontSize: '15px', color: '#4A4A4A', fontWeight: 700, margin: '0 0 24px 0', lineHeight: 1.5 }}>
            Please select a learner profile or register a new one to access the lesson player!
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #FF7A00, #E06B00)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '16px',
              fontWeight: 900,
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(255, 122, 0, 0.2)'
            }}
          >
            Go to Welcome
          </button>
        </div>
      </div>
    );
  }

  const [currentEntry, setCurrentEntry] = useState(location.state?.entry);
  const [learningPath, setLearningPath] = useState(location.state?.path || []);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let active = true;

    const loadLesson = async () => {
      if (!learner) return;
      setLoading(true);
      setErrorMsg('');

      try {
        const queryParams = new URLSearchParams(location.search);
        const lessonId = queryParams.get('id') || queryParams.get('lessonId');

        if (!lessonId) {
          // Fallback: load learning path to match the available day
          const pathRes = await fetchLearningPath(learner.learner_id);
          const freshPath = pathRes.data || [];
          const nextAvailable = freshPath.find(node => node.status === 'available') || freshPath[0];
          
          if (nextAvailable) {
            const nextId = nextAvailable.lesson_detail?.lesson_id || nextAvailable.lesson_id;
            if (active) {
              navigate(`/lesson-player?id=${nextId}`, { replace: true, state: { entry: nextAvailable, path: freshPath } });
            }
          } else {
            if (active) {
              navigate(`/lesson-player?id=BEG-EN-001`, { replace: true });
            }
          }
          return;
        }

        // Check if current entry matches lessonId
        const stateLessonId = currentEntry?.lesson_detail?.lesson_id || currentEntry?.lesson_id;
        if (currentEntry && stateLessonId === lessonId && learningPath && learningPath.length > 0) {
          if (active) {
            setLoading(false);
          }
          return;
        }

        // Fetch learning path
        const pathRes = await fetchLearningPath(learner.learner_id);
        const freshPath = pathRes.data || [];

        let matchingEntry = freshPath.find(node => 
          (node.lesson_detail?.lesson_id === lessonId) || 
          (node.lesson_id === lessonId)
        );

        if (matchingEntry) {
          if (active) {
            setCurrentEntry(matchingEntry);
            setLearningPath(freshPath);
            setLoading(false);
          }
        } else {
          // Fetch direct lesson detail from backend
          const lessonRes = await fetchLessonDetail(lessonId);
          const lessonObj = lessonRes.data;
          if (lessonObj) {
            if (active) {
              const mockEntry = {
                id: -1,
                day_number: 1,
                status: 'available',
                lesson_detail: lessonObj
              };
              setCurrentEntry(mockEntry);
              setLearningPath(freshPath);
              setLoading(false);
            }
          } else {
            throw new Error("Lesson not found");
          }
        }
      } catch (err) {
        console.error("Failed to load lesson:", err);
        if (active) {
          setErrorMsg(err.response?.data?.error || "We encountered an issue loading this lesson. Please check your network connection.");
          setLoading(false);
        }
      }
    };

    loadLesson();

    return () => {
      active = false;
    };
  }, [location.search, learner]);

  const lesson = currentEntry?.lesson_detail || (currentEntry?.lesson_id ? currentEntry : null) || {
    lesson_id: 'BEG-EN-001',
    title: 'Tap Letters: Apple',
    difficulty: 'beginner',
    lesson_type: 'tap_letters',
    audio_text: 'Tap the Apple to hear its sound.',
    image_emoji: '🍎',
    activities_data: [
      { type: 'explore_prompt', instruction: 'Explore the letters soundboard', term: 'Apple', emoji: '🍎', phonetic: 'A' },
      { type: 'practice_mic', voice_target: 'A' },
      { type: 'tap_grid', items: [{ label: 'Apple', emoji: '🍎', sound: 'Apple' }] }
    ],
    quiz_data: {
      recognition: [{ question: 'Tap the letter B', options: ['A', 'B', 'D'], correct: 'B' }],
      understanding: [{ question: 'Which picture starts with C?', options: ['🐱 Cat', '🍎 Apple', '⚽ Ball'], correct: '🐱 Cat' }],
      application: [{ question: 'Tap Apple', options: ['Apple', 'Water', 'Doctor'], correct: 'Apple' }]
    }
  };

  const lessonNumber = currentEntry?.day_number || 1;
  const preferredLanguage = lesson.language || learner?.learning_language || 'en';
  const speechLang = SPEECH_LANG_MAP[preferredLanguage] || 'en-US';
  const knownLanguage = learner?.known_language || 'en';
  const knownSpeechLang = SPEECH_LANG_MAP[knownLanguage] || 'en-US';

  // 5 strict steps:
  // 0: Explore (Alphabet soundboard or target prompter)
  // 1: Practice (Tracing or Voice microphone repetition)
  // 2: Game (Memory flip cards, unscramble, connect pairs)
  // 3: Short Quiz (Exactly 3 questions)
  // 4: Reward / Certificate
  const [stage, setStage] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(0.95);

  // Animated Hand Pointer Guide State
  const [showHandPointer, setShowHandPointer] = useState(true);

  // Tracing Canvas Refs
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Voice Speaking states
  const [voiceSuccess, setVoiceSuccess] = useState(false);
  const [userSpokenText, setUserSpokenText] = useState('');
  const [completing, setCompleting] = useState(false);

  // Game Engine Specific States
  const [leftMatchItems, setLeftMatchItems] = useState([]);
  const [rightMatchItems, setRightMatchItems] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [completedMatches, setCompletedMatches] = useState({});
  const [matchSuccess, setMatchSuccess] = useState(false);

  const [targetWord, setTargetWord] = useState('');
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [builtSpelling, setBuiltSpelling] = useState([]);

  const [memoryCards, setMemoryCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCardKeys, setMatchedCardKeys] = useState([]);

  // Quiz states (Exactly 3 questions randomly selected from the pool)
  const [activeQuizQuestions, setActiveQuizQuestions] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFailed, setQuizFailed] = useState(false);

  const [unscrambleAnswers, setUnscrambleAnswers] = useState({});
  const [unscrambleChecked, setUnscrambleChecked] = useState(false);
  const [unscrambleIsCorrect, setUnscrambleIsCorrect] = useState(false);

  const [activeStoryTab, setActiveStoryTab] = useState('');
  const [storyAnswers, setStoryAnswers] = useState({});
  const [storyChecked, setStoryChecked] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatSelectedOption, setChatSelectedOption] = useState(null);

  const [essayText, setEssayText] = useState('');
  const [essaySubmitted, setEssaySubmitted] = useState(false);

  const [sentenceAnswer, setSentenceAnswer] = useState([]);
  const [sentenceChecked, setSentenceChecked] = useState(false);
  const [sentenceCorrect, setSentenceCorrect] = useState(false);

  const [paragraphText, setParagraphText] = useState('');
  const [paragraphSubmitted, setParagraphSubmitted] = useState(false);

  const [assessmentAnswers, setAssessmentAnswers] = useState(Array(10).fill(null));
  const [assessmentFinished, setAssessmentFinished] = useState(false);
  const [assessmentTimeLeft, setAssessmentTimeLeft] = useState(900);

  const [letterTo, setLetterTo] = useState('');
  const [letterSubject, setLetterSubject] = useState('');
  const [letterBody, setLetterBody] = useState('');
  const [writingStep, setWritingStep] = useState(1);
  const [writingAttempts, setWritingAttempts] = useState(0);
  const [reviewAnswer, setReviewAnswer] = useState(null);
  const [reviewAnswerChecked, setReviewAnswerChecked] = useState(false);
  const [guidedCompiledText, setGuidedCompiledText] = useState('');
  const [feedbackEvaluation, setFeedbackEvaluation] = useState(null);
  const [wizardOptionSelections, setWizardOptionSelections] = useState({});

  const [showQuiz, setShowQuiz] = useState(false);
  const [incorrectQuizGuesses, setIncorrectQuizGuesses] = useState({});
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const [alphabetAnswer, setAlphabetAnswer] = useState(null);
  const [alphabetAnswerCorrect, setAlphabetAnswerCorrect] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [jumbledSelectedIndices, setJumbledSelectedIndices] = useState([]);
  const [jumbledPoolIndices, setJumbledPoolIndices] = useState([]);
  const [jumbledInitialPool, setJumbledInitialPool] = useState([]);

  // Guided Writing System missing state variables
  const [activeBlankIdx, setActiveBlankIdx] = useState(null);
  const [activeLetterBlankIdx, setActiveLetterBlankIdx] = useState(null);
  const [filledBlanks, setFilledBlanks] = useState({});
  const [customBlankInput, setCustomBlankInput] = useState('');
  const [letterBlanks, setLetterBlanks] = useState({});
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [wizardAnswers, setWizardAnswers] = useState([]);
  const [wizardStep, setWizardStep] = useState(0);
  const [letterSubmitted, setLetterSubmitted] = useState(false);

  const exploreData = (lesson.activities && lesson.activities.length > 0) ? lesson.activities[0] : (lesson.activities_data?.[0] || {});
  const practiceData = (lesson.activities && lesson.activities.length > 1) ? lesson.activities[1] : (lesson.activities_data?.[1] || {});
  const gameData = (lesson.mini_game && Object.keys(lesson.mini_game).length > 0) ? lesson.mini_game : (lesson.activities_data?.[2] || {});
  const isAlphabetLesson = (exploreData?.type === 'audio_match') || (lesson?.difficulty === 'intermediate') || (lesson?.difficulty === 'advanced') || (lesson?.skill === 'writing');

  const groupLetters = exploreData?.options || ['A', 'B', 'C'];
  const slides = [];

  if (isAlphabetLesson) {
    if (lesson?.difficulty === 'intermediate' || lesson?.difficulty === 'advanced' || lesson?.skill === 'writing') {
      const rawActivities = lesson.activities || [];
      rawActivities.forEach((act) => {
        if (act.type === 'paragraph_writing') {
          slides.push({
            type: 'learn_concept',
            title: act.title || 'Learn Concept',
            subtitle: act.subtitle || 'How to Write',
            concept_title: act.topic || 'Paragraph Composition',
            concept_text: act.instruction || 'Learn how to structure your paragraph.',
            visual: '📝',
            example_heading: 'Example Structure:',
            example_text: preferredLanguage === 'kn'
              ? 'ಪ್ರಸ್ತಾವನೆ -> ಮುಖ್ಯ ವಿವರಣೆ -> ತೀರ್ಮಾನ (ಕನಿಷ್ಠ 15 ಪದಗಳು).'
              : preferredLanguage === 'hi'
              ? 'प्रस्तावना -> मुख्य विवरण -> निष्कर्ष (कम से कम 15 शब्द).'
              : preferredLanguage === 'ta'
              ? 'அறிமுகம் -> முக்கிய விளக்கம் -> முடிவுரை (குறைந்தது 15 சொற்கள்).'
              : 'Introduction -> Main Details -> Conclusion (Write at least 15 words).'
          });
        } else if (act.type === 'letter_drafting') {
          slides.push({
            type: 'learn_concept',
            title: act.title || 'Learn Concept',
            subtitle: act.subtitle || 'Letter/Email Drafting',
            concept_title: act.title || 'How to draft a letter',
            concept_text: act.instruction || 'Learn the key elements of writing a letter.',
            visual: '✉️',
            example_heading: 'Key Elements of a Letter:',
            example_text: preferredLanguage === 'kn'
              ? '1. ವಿಳಾಸ/ಸ್ವೀಕೃತಿದಾರ (To)\n2. ವಿಷಯ (Subject)\n3. ಗೌರವ ಸೂಚನೆ (Salutation)\n4. ಪತ್ರದ ಒಡಲು (Body of letter)\n5. ಮುಕ್ತಾಯ (Closing signature)'
              : preferredLanguage === 'hi'
              ? '1. पाने वाले का पता (To)\n2. पत्र का विषय (Subject)\n3. आदरणीय संबोधन (Salutation)\n4. मुख्य संदेश (Body of letter)\n5. समापन (Closing signature)'
              : preferredLanguage === 'ta'
              ? '1. பெறுநர் முகவரி (To)\n2. கடிதப் பொருள் (Subject)\n3. வாழ்த்துரை (Salutation)\n4. கடிதத்தின் உள்ளடக்கம் (Body of letter)\n5. முடிவுரை (Closing signature)'
              : '1. Recipient Address (To)\n2. Subject Line (Subject)\n3. Salutation (e.g. Dear Sir/Madam)\n4. Body paragraphs explaining the message\n5. Closing and Signature'
          });
        }
        slides.push(act);
      });
    } else {
      // 1. Welcome Slide
      slides.push({
        type: 'welcome',
        title: `Meet the Letters ${groupLetters.slice(0, -1).join(', ')} & ${groupLetters[groupLetters.length - 1]}`,
        subtitle: `Welcome! Today you'll learn your first ${groupLetters.length === 3 ? 'three' : groupLetters.length} letters.`,
        objectives: groupLetters.map(letter => `Recognise ${letter}`).concat('Identify them by sound')
      });

      // 2. Learn Slides
      groupLetters.forEach((letter) => {
        const meta = LETTER_META[letter] || { name: letter, phonetic: letter, word: letter, illustration: 'default', color: '#8E44AD', badgeBg: '#F5EEF8' };
        slides.push({
          type: 'learn_letter',
          letter: letter,
          meta: meta
        });
      });

      // 3. Audio check checkups
      groupLetters.forEach((letter, qIdx) => {
        slides.push({
          type: 'practice_audio',
          questionNumber: qIdx + 1,
          questionText: 'Tap the letter you hear.',
          target: letter,
          options: groupLetters,
          hint: `Listen closely: ${letter}`
        });
      });

      // 4. Missing Letter checkups
      groupLetters.forEach((letter, qIdx) => {
        const otherLetters = [...groupLetters];
        const targetPos = otherLetters.indexOf(letter);
        const displaySequence = otherLetters.map((l, lIdx) => lIdx === targetPos ? '__' : l).join(' ');
        slides.push({
          type: 'practice_missing',
          questionNumber: groupLetters.length + qIdx + 1,
          questionText: 'What is the missing letter?',
          displaySequence: displaySequence,
          target: letter,
          options: [letter, groupLetters[(targetPos + 1) % groupLetters.length], 'Z'].sort(() => Math.random() - 0.5),
          hint: `Sequence is ${otherLetters.join(', ')}`
        });
      });

      // 5. Graduation Slide
      slides.push({
        type: 'graduation',
        title: 'Great job!',
        subtitle: 'You learned:',
        letters: groupLetters
      });
    }
  } else {
    const rawActivities = lesson.activities || lesson.activities_data || [];
    rawActivities.forEach((act) => {
      slides.push(act);
    });
  }

  // Generate 3 unique questions testing different skills from pool
  const generateActiveQuiz = () => {
    const data = (lesson.quiz_bank && lesson.quiz_bank.length > 0) ? lesson.quiz_bank : (lesson.quiz_data || {});
    let selected = [];
    if (Array.isArray(data)) {
      selected = data;
    } else if (data.recognition && data.understanding && data.application) {
      const rec = shuffle(data.recognition)[0];
      const und = shuffle(data.understanding)[0];
      const app = shuffle(data.application)[0];
      if (rec) selected.push(rec);
      if (und) selected.push(und);
      if (app) selected.push(app);
    }
    
    if (selected.length === 0) {
      selected = [
        { question: 'Identify the letter', options: ['A', 'B', 'C'], correct: 'A' },
        { question: 'Match the card', options: ['Apple', 'Water', 'Doctor'], correct: 'Apple' },
        { question: 'Speak word', options: ['Apple', 'Ball'], correct: 'Apple' }
      ];
    }
    setActiveQuizQuestions(selected);
  };

  // Generate quiz questions on load and reset states
  useEffect(() => {
    resetPlayerStates();
    generateActiveQuiz();
    setAssessmentTimeLeft(900);
  }, [lesson]);

  useEffect(() => {
    if (isAlphabetLesson && slides[slideIndex]?.type === 'write_sentence') {
      const targetStr = slides[slideIndex].target || '';
      const words = targetStr.trim().split(/\s+/).filter(Boolean);
      const indices = words.map((_, idx) => idx);
      
      // Shuffle indices
      const shuffled = [...indices];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      setJumbledPoolIndices(shuffled);
      setJumbledInitialPool(shuffled);
      setJumbledSelectedIndices([]);
    }
  }, [slideIndex, lesson, isAlphabetLesson]);

  useEffect(() => {
    const currentSlide = slides[slideIndex];
    if (!currentSlide) return;

    setWritingStep(1);
    setWritingAttempts(0);
    setReviewAnswer(null);
    setReviewAnswerChecked(false);
    setGuidedCompiledText('');
    setFeedbackEvaluation(null);
    setWizardOptionSelections({});

    const lang = preferredLanguage || 'en';
    const starters = MIGO_WRITING_STARTERS[lang] || MIGO_WRITING_STARTERS['en'];

    if (currentSlide.type === 'paragraph_writing') {
      const topicKey = getWritingStarterKey(currentSlide.topic);
      const data = starters[topicKey] || starters['default'];
      
      const initialFilled = {};
      data.blanks.forEach((b, idx) => {
        initialFilled[idx] = `[${b.placeholder}]`;
      });
      setFilledBlanks(initialFilled);
      setActiveBlankIdx(null);
      setCustomBlankInput('');

      // Compile initial template text
      const parts = data.template.split(/(\[[^\]]+\])/);
      let counter = 0;
      const initialText = parts.map(part => {
        if (part.startsWith('[') && part.endsWith(']')) {
          return initialFilled[counter++];
        }
        return part;
      }).join('');
      setParagraphText(initialText);
      setParagraphSubmitted(false);
    } else if (currentSlide.type === 'letter_drafting') {
      const toVal = starters.letter.to;
      const subVal = starters.letter.subject;
      setLetterTo(toVal);
      setLetterSubject(subVal);

      const initialFilled = {};
      starters.letter.blanks.forEach((b, idx) => {
        initialFilled[idx] = `[${b.placeholder}]`;
      });
      setLetterBlanks(initialFilled);
      setActiveLetterBlankIdx(null);
      setCustomBlankInput('');

      // Compile initial template text
      const parts = starters.letter.body.split(/(\[[^\]]+\])/);
      let counter = 0;
      const initialText = parts.map(part => {
        if (part.startsWith('[') && part.endsWith(']')) {
          return initialFilled[counter++];
        }
        return part;
      }).join('');
      setLetterBody(initialText);
      setLetterSubmitted(false);
      setWritingStep(1);
    }
  }, [slideIndex, lesson]);

  useEffect(() => {
    if (!lesson.lesson_id || !lesson.lesson_id.includes('-ASSESS-') || assessmentFinished) return;
    const interval = setInterval(() => {
      setAssessmentTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setAssessmentFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lesson, assessmentFinished]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Speech triggers on loading stage
  useEffect(() => {
    setShowHandPointer(true);
    setVoiceSuccess(false);

    if (isAlphabetLesson) {
      if (stage === 0) {
        speak(exploreData.question || 'Tap the letter you hear', speechLang, audioSpeed);
      } else if (stage === 1) {
        speak(practiceData.question || 'Find the missing letter', speechLang, audioSpeed);
      }
    } else {
      if (stage === 0) {
        const welcome = exploreData.instruction || 'Let\'s explore this target character!';
        speak(welcome, speechLang, audioSpeed);
      } else if (stage === 1) {
        const prInst = practiceData.instruction || 'Practice pronunciation check!';
        speak(prInst, speechLang, audioSpeed);
      } else if (stage === 2) {
        const gmInst = gameData.instruction || 'Let\'s play a quick interactive game!';
        speak(gmInst, speechLang, audioSpeed);

        // Setup games
      if (gameData.type === 'match_pairs') {
        const pairs = gameData.pairs || [];
        setLeftMatchItems(shuffle(pairs.map(p => ({ id: p.id, text: p.left }))));
        setRightMatchItems(shuffle(pairs.map(p => ({ id: p.id, text: p.right }))));
        setCompletedMatches({});
        setMatchSuccess(false);
      }
      if (gameData.type === 'unscramble') {
        setTargetWord(gameData.word || '');
        setShuffledLetters(gameData.letters || []);
        setBuiltSpelling([]);
        setMatchSuccess(false);
      }
      if (gameData.type === 'memory_cards') {
        const cards = gameData.cards || [];
        setMemoryCards(shuffle(cards.map(c => ({ ...c, isFlipped: false }))));
        setFlippedCards([]);
        setMatchedCardKeys([]);
        setMatchSuccess(false);
      }
    } else if (stage === 3) {
      speak(t('quizCheckupIntro'), knownSpeechLang, audioSpeed);
    }
  }
}, [lesson, stage]);

  const handleVoiceResult = (transcript) => {
    setUserSpokenText(transcript);
    const activeSlide = slides[slideIndex] || {};
    const target = (activeSlide.voice_target || practiceData.voice_target || 'Apple').toLowerCase().trim();
    const spoken = transcript.toLowerCase().trim();

    if (spoken.includes(target)) {
      setVoiceSuccess(true);
      speak(t('excellentFeedback'), knownSpeechLang, audioSpeed);
    } else {
      speak(t('tryAgainFeedback'), knownSpeechLang, audioSpeed);
    }
  };

  const { startListening, listening } = useVoiceInput(handleVoiceResult, speechLang);

  // Tracing drawing helpers
  const startDrawing = (e) => {
    setShowHandPointer(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#FF7A00';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Drag matches columns checkup
  const selectLeftItem = (leftId) => {
    setShowHandPointer(false);
    if (completedMatches[leftId]) return;
    setSelectedLeft(leftId);

    if (selectedRight) {
      evaluateMatch(leftId, selectedRight);
    }
  };

  const selectRightItem = (rightId) => {
    setShowHandPointer(false);
    if (Object.values(completedMatches).includes(rightId)) return;
    setSelectedRight(rightId);

    if (selectedLeft) {
      evaluateMatch(selectedLeft, rightId);
    }
  };

  const evaluateMatch = (leftId, rightId) => {
    if (leftId === rightId) {
      const updated = { ...completedMatches, [leftId]: rightId };
      setCompletedMatches(updated);
      speak(t('matchConnectedFeedback'), knownSpeechLang, audioSpeed);
      setSelectedLeft(null);
      setSelectedRight(null);

      if (Object.keys(updated).length === leftMatchItems.length) {
        setMatchSuccess(true);
        speak(t('allMatchesFoundFeedback'), knownSpeechLang, audioSpeed);
      }
    } else {
      speak(t('tryAgainFeedback'), knownSpeechLang, audioSpeed);
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const handleLetterTap = (letter, index) => {
    setShowHandPointer(false);
    const updatedSpelling = [...builtSpelling, letter];
    setBuiltSpelling(updatedSpelling);
    speak(letter, speechLang, audioSpeed);

    const updatedLetters = [...shuffledLetters];
    updatedLetters.splice(index, 1);
    setShuffledLetters(updatedLetters);

    if (updatedSpelling.join('').toLowerCase() === targetWord.toLowerCase()) {
      setMatchSuccess(true);
      speak(t('excellentFeedback'), knownSpeechLang, audioSpeed);
      setTimeout(() => speak(targetWord, speechLang, audioSpeed), 800);
    } else if (updatedSpelling.length >= targetWord.length) {
      speak(t('tryAgainFeedback'), knownSpeechLang, audioSpeed);
      setBuiltSpelling([]);
      setShuffledLetters(gameData.letters || []);
    }
  };

  const handleCardFlip = (card, index) => {
    setShowHandPointer(false);
    if (flippedCards.length >= 2 || matchedCardKeys.includes(card.match_key) || flippedCards.some(fc => fc.id === card.id)) {
      return;
    }

    speak(card.label, speechLang, audioSpeed);
    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      if (newFlipped[0].match_key === newFlipped[1].match_key) {
        setMatchedCardKeys([...matchedCardKeys, newFlipped[0].match_key]);
        setFlippedCards([]);
        speak(t('matchConnectedFeedback'), knownSpeechLang, audioSpeed);
        if (matchedCardKeys.length + 1 === memoryCards.length / 2) {
          setMatchSuccess(true);
          speak(t('excellentFeedback'), knownSpeechLang, audioSpeed);
        }
      } else {
        setTimeout(() => {
          setFlippedCards([]);
          speak(t('tryAgainFeedback'), knownSpeechLang, audioSpeed);
        }, 1200);
      }
    }
  };

  const handleTokenClick = (itemId, letter) => {
    const currentAns = unscrambleAnswers[itemId] || [];
    setUnscrambleAnswers({
      ...unscrambleAnswers,
      [itemId]: [...currentAns, letter]
    });
  };

  const handleAnswerLetterClick = (itemId, ansIdx) => {
    const currentAns = unscrambleAnswers[itemId] || [];
    const newAns = currentAns.filter((_, idx) => idx !== ansIdx);
    setUnscrambleAnswers({
      ...unscrambleAnswers,
      [itemId]: newAns
    });
  };

  const clearUnscrambleRow = (itemId) => {
    setUnscrambleAnswers({
      ...unscrambleAnswers,
      [itemId]: []
    });
    setUnscrambleChecked(false);
    setUnscrambleIsCorrect(false);
  };

  const checkUnscrambleAnswers = (items) => {
    let allCorrect = true;
    items.forEach((item) => {
      const userWord = (unscrambleAnswers[item.id] || []).join('').toLowerCase().trim();
      const target = item.target.toLowerCase().trim();
      if (userWord !== target) {
        allCorrect = false;
      }
    });
    setUnscrambleChecked(true);
    setUnscrambleIsCorrect(allCorrect);
    if (allCorrect) {
      speak(t('excellentUnscrambleFeedback'), knownSpeechLang, audioSpeed);
    } else {
      speak(t('unscrambleIncorrectFeedback'), knownSpeechLang, audioSpeed);
    }
  };

  const handleHuntTap = (letter) => {
    setShowHandPointer(false);
    speak(letter, speechLang, audioSpeed);
    if (letter === gameData.target) {
      setMatchSuccess(true);
      speak(t('excellentFeedback'), knownSpeechLang, audioSpeed);
    } else {
      speak(t('tryAgainFeedback'), knownSpeechLang, audioSpeed);
    }
  };

  const handleQuizAnswer = (option) => {
    const q = activeQuizQuestions[currentQuizIndex];
    const correct = q?.correct || (q && q.options && q.correct_index !== undefined ? q.options[q.correct_index] : 'A');

    if (option === correct) {
      setSelectedQuizOption(option);
      const wasAlreadyGuessedWrong = (incorrectQuizGuesses[currentQuizIndex] || []).length > 0;
      if (!wasAlreadyGuessedWrong) {
        setQuizScore((prev) => prev + 1);
      }
      speak(t('correctFeedback'), knownSpeechLang, audioSpeed);
    } else {
      const currentWrong = incorrectQuizGuesses[currentQuizIndex] || [];
      if (!currentWrong.includes(option)) {
        setIncorrectQuizGuesses({
          ...incorrectQuizGuesses,
          [currentQuizIndex]: [...currentWrong, option]
        });
      }
      speak(t('incorrectAiTip') + (q?.explanation || t('tryAgainFeedback')), knownSpeechLang, audioSpeed);
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedQuizOption(null);
    if (currentQuizIndex < (activeQuizQuestions.length - 1)) {
      setCurrentQuizIndex((prev) => prev + 1);
    } else {
      const passThreshold = activeQuizQuestions.length >= 3 ? 2 : activeQuizQuestions.length;
      const passed = quizScore >= passThreshold;
      if (passed) {
        handleFinishQuest();
      } else {
        setQuizFailed(true);
      }
    }
  };

  const restartQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedQuizOption(null);
    setQuizScore(0);
    setQuizFailed(false);
    setIncorrectQuizGuesses({});
    generateActiveQuiz();
  };

  const handleFinishQuest = async () => {
    setCompleting(true);
    try {
      if (learner && lessonNumber) {
        await completeLessonDay(learner.learner_id, lessonNumber);
        await endSession(learner.learner_id).catch(() => {});
        await startSession(learner.learner_id).catch(() => {});
      }
      setLessonCompleted(true);
      setStage(isAlphabetLesson ? 2 : 4);
    } catch (err) {
      console.error('Failed to complete lesson:', err);
      setLessonCompleted(true);
      setStage(isAlphabetLesson ? 2 : 4);
    } finally {
      setCompleting(false);
    }
  };

  const resetPlayerStates = () => {
    setStage(0);
    setSlideIndex(0);
    setVoiceSuccess(false);
    setUserSpokenText('');
    setCompletedMatches({});
    setMatchSuccess(false);
    setCurrentQuizIndex(0);
    setSelectedQuizOption(null);
    setQuizScore(0);
    setQuizFailed(false);
    setAlphabetAnswer(null);
    setAlphabetAnswerCorrect(false);
    
    setShowQuiz(false);
    setLessonCompleted(false);
    setIncorrectQuizGuesses({});
    setActiveStoryTab('');
    setStoryAnswers({});
    setStoryChecked(false);
    setChatMessages([]);
    setChatSelectedOption(null);
    setEssayText('');
    setEssaySubmitted(false);
    setSentenceAnswer([]);
    setSentenceChecked(false);
    setSentenceCorrect(false);
    setParagraphText('');
    setParagraphSubmitted(false);
    setAssessmentAnswers(Array(10).fill(null));
    setAssessmentFinished(false);
    setLetterTo('');
    setLetterSubject('');
    setLetterBody('');
    setLetterSubmitted(false);
  };

  const handlePlayNextLesson = async () => {
    if (!learner) return;

    setCompleting(true);
    try {
      const pathRes = await fetchLearningPath(learner.learner_id);
      let freshPath = pathRes.data || [];

      let nextEntryNode = freshPath.find((node) => node.day_number === lessonNumber + 1);

      if (!nextEntryNode) {
        await generateLearningPath(learner.learner_id);
        const updatedPath = await fetchLearningPath(learner.learner_id);
        freshPath = updatedPath.data || [];
        nextEntryNode = freshPath.find((node) => node.day_number === lessonNumber + 1);
      }

      if (nextEntryNode) {
        resetPlayerStates();
        const nextId = nextEntryNode.lesson_detail?.lesson_id || nextEntryNode.lesson_id;
        navigate(`/lesson-player?id=${nextId}`, {
          state: { entry: nextEntryNode, path: freshPath }
        });
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error('Play next lesson failed:', err);
      navigate('/home');
    } finally {
      setCompleting(false);
    }
  };

  const handleCompleteAndPlayNext = async () => {
    setCompleting(true);
    try {
      if (learner && lessonNumber) {
        await completeLessonDay(learner.learner_id, lessonNumber);
        await endSession(learner.learner_id).catch(() => {});
        await startSession(learner.learner_id).catch(() => {});
      }
      
      const pathRes = await fetchLearningPath(learner.learner_id);
      let freshPath = pathRes.data || [];
      let nextEntryNode = freshPath.find((node) => node.day_number === lessonNumber + 1);

      if (!nextEntryNode) {
        await generateLearningPath(learner.learner_id);
        const updatedPath = await fetchLearningPath(learner.learner_id);
        freshPath = updatedPath.data || [];
        nextEntryNode = freshPath.find((node) => node.day_number === lessonNumber + 1);
      }

      if (nextEntryNode) {
        resetPlayerStates();
        const nextId = nextEntryNode.lesson_detail?.lesson_id || nextEntryNode.lesson_id;
        navigate(`/lesson-player?id=${nextId}`, {
          state: { entry: nextEntryNode, path: freshPath }
        });
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error('Failed to complete and play next lesson:', err);
      navigate('/home');
    } finally {
      setCompleting(false);
    }
  };

  if (lesson.lesson_id && lesson.lesson_id.includes('-ASSESS-')) {
    const qList = activeQuizQuestions || [];
    const passingScore = lesson.difficulty === 'beginner' ? 7 : 8;
    
    // Calculate score
    const correctCount = assessmentAnswers.reduce((count, ans, qIdx) => {
      const q = qList[qIdx];
      if (q && ans !== null && ans === q.correct_index) {
        return count + 1;
      }
      return count;
    }, 0);

    const isPassed = correctCount >= passingScore;

    const handleFinishAssessment = async () => {
      try {
        if (learner && lessonNumber) {
          await completeLessonDay(learner.learner_id, lessonNumber);
          await endSession(learner.learner_id).catch(() => {});
          await startSession(learner.learner_id).catch(() => {});
        }
        navigate('/home');
      } catch (err) {
        console.error('Failed to complete assessment:', err);
        navigate('/home');
      }
    };

    if (assessmentFinished) {
      // Find indices of questions answered incorrectly
      const wrongIndices = [];
      qList.forEach((q, idx) => {
        const ans = assessmentAnswers[idx];
        if (q && (ans === null || ans !== q.correct_index)) {
          wrongIndices.push(idx);
        }
      });

      const handleRetakeAssessment = () => {
        setAssessmentAnswers(Array(10).fill(null));
        setAssessmentFinished(false);
        setCurrentQuizIndex(0);
        setAssessmentTimeLeft(900);
      };

      const handleExitWithoutPassing = () => {
        navigate('/home');
      };

      const recLessons = getRecommendedLessons(wrongIndices, learner?.learning_language || 'en');

      return (
        <div className={styles.container} style={{ background: '#FFFDF9', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px' }}>
          <div style={{ maxWidth: '1100px', width: '100%' }}>
            
            {/* Assessment Result Banner */}
            <div style={{ 
              background: isPassed ? 'linear-gradient(135deg, #FFF0DB, #FFE2BC)' : 'linear-gradient(135deg, #FFEBEE, #FFCDD2)', 
              border: `2.5px solid ${isPassed ? 'var(--color-orange)' : '#D32F2F'}`, 
              borderRadius: '24px', 
              padding: '24px 32px', 
              marginBottom: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              boxShadow: '0 8px 30px rgba(0,0,0,0.05)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ fontSize: '48px' }}>{isPassed ? '🎉' : '💪'}</span>
                <div style={{ textAlign: 'left' }}>
                  <h1 style={{ fontSize: '28px', fontWeight: 900, color: isPassed ? 'var(--color-orange-dark)' : '#C62828', margin: 0 }}>
                    {isPassed ? `${lesson.title} Passed!` : `${lesson.title} - Keep Practicing!`}
                  </h1>
                  <p style={{ fontSize: '15px', color: 'var(--text-dark)', margin: '4px 0 0 0', fontWeight: 700 }}>
                    {isPassed 
                      ? `Excellent work, ${learner?.name || 'Literacy Graduate'}! You completed the final checkpoint.`
                      : `Don't worry, ${learner?.name || 'Student'}! Every attempt is a step closer to success.`}
                  </p>
                </div>
              </div>
              <div style={{ fontSize: '32px' }}>{isPassed ? '🏆' : '📚'}</div>
            </div>

            {/* Main results columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              
              {/* Left Column: Scores & Mascot */}
              <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '28px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-peach-light)', paddingBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 900, color: 'var(--color-orange-dark)', textTransform: 'uppercase', margin: 0 }}>Your Final Score</h3>
                    <h2 style={{ fontSize: '44px', fontWeight: 950, color: isPassed ? '#2E7D32' : '#C62828', margin: '4px 0 0 0' }}>
                      {correctCount} / 10
                    </h2>
                  </div>
                  <div style={{ padding: '8px 16px', borderRadius: '12px', background: isPassed ? '#E8F5E9' : '#FFEBEE', color: isPassed ? '#2E7D32' : '#C62828', fontWeight: 900, fontSize: '14px', border: '1.5px solid' }}>
                    {isPassed ? 'PASSED 🎓' : 'TRY AGAIN 💪'}
                  </div>
                </div>

                {/* Mascot owl advice */}
                <div style={{ display: 'flex', gap: '16px', background: 'var(--color-cream-bg)', padding: '16px', borderRadius: '16px', border: '1.5px solid var(--color-peach-light)', alignItems: 'center' }}>
                  <span style={{ fontSize: '40px' }}>🦉</span>
                  <div>
                    <p style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-dark)', margin: 0, lineHeight: '1.5' }}>
                      {isPassed 
                        ? '"Excellent work! You are one step closer to becoming a master learner. Go ahead and start the next level!"'
                        : '"You did your best! Don\'t give up. Review the questions you missed and recommendations below, then try again to unlock the next level!"'}
                    </p>
                  </div>
                </div>

                {/* Topic Breakdown */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '12px', textTransform: 'uppercase' }}>Performance by Topic</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { topic: 'Vocabulary', score: correctCount * 10, count: correctCount },
                      { topic: 'Grammar & Writing', score: 80, count: 8 },
                      { topic: 'Reading Comprehension', score: 70, count: 7 },
                      { topic: 'Punctuation & Spelling', score: 90, count: 9 }
                    ].map((item, index) => (
                      <div key={index}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 805, color: 'var(--text-dark)', marginBottom: '4px' }}>
                          <span>{item.topic}</span>
                          <span>{item.score}% ({item.count}/10)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${item.score}%`, height: '100%', background: item.score >= 80 ? '#4CAF50' : '#FF9800', borderRadius: '4px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* You Earned */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <div style={{ background: '#FFF9F2', border: '1.5px dashed var(--color-peach)', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
                    <span style={{ fontSize: '20px' }}>✨</span>
                    <h5 style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: 900, color: 'var(--color-orange-dark)' }}>+{isPassed ? 250 : 50} XP</h5>
                  </div>
                  <div style={{ background: '#FFF9F2', border: '1.5px dashed var(--color-peach)', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
                    <span style={{ fontSize: '20px' }}>🔥</span>
                    <h5 style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: 900, color: 'var(--color-orange-dark)' }}>{isPassed ? '8 Day Streak' : 'Keep it up!'}</h5>
                  </div>
                </div>
              </div>

              {/* Right Column: Graduation Certificate OR Locked Warning */}
              {isPassed ? (
                /* PASSED VIEW: Graduation Certificate Box */
                <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px', background: '#FFFFFF' }}>
                  
                  {/* Visual Certificate Frame */}
                  <div style={{ width: '100%', border: '8px double var(--color-orange)', borderRadius: '16px', padding: '20px', background: '#FFFDF9', position: 'relative', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <div style={{ textAlign: 'center', border: '2px solid var(--color-peach)', padding: '16px', background: '#FFFFFF', borderRadius: '8px' }}>
                      <span style={{ fontSize: '20px', display: 'block', marginBottom: '8px' }}>🦉 MiGo Buddy</span>
                      <h3 style={{ fontSize: '20px', fontWeight: 950, color: 'var(--color-orange-dark)', margin: '0 0 8px 0', letterSpacing: '1px' }}>
                        CERTIFICATE OF ACHIEVEMENT
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>This is proudly presented to:</p>
                      <h2 style={{ fontSize: '24px', fontWeight: 950, color: 'var(--text-dark)', textDecoration: 'underline', textDecorationColor: 'var(--color-orange)', textUnderlineOffset: '6px', margin: '0 0 16px 0' }}>
                        {learner?.name || 'Literacy Graduate'}
                      </h2>
                      <p style={{ fontSize: '12px', color: 'var(--text-dark)', lineHeight: '1.6', margin: '0 0 16px 0', fontWeight: 800 }}>
                        for successfully completing the <strong style={{ color: 'var(--color-orange-dark)' }}>{lesson.difficulty.toUpperCase()} LEVEL</strong> final assessment, demonstrating great dedication and knowledge.
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--text-muted)', marginTop: '20px', fontWeight: 700 }}>
                        <div>
                          <div style={{ borderBottom: '1px solid #CBD5E1', width: '80px', paddingBottom: '4px', marginBottom: '4px' }}>05th August 2026</div>
                          <span>Date</span>
                        </div>
                        <div style={{ fontSize: '28px' }}>🏅</div>
                        <div>
                          <div style={{ borderBottom: '1px solid #CBD5E1', width: '80px', paddingBottom: '4px', marginBottom: '4px', fontFamily: 'cursive', color: 'var(--color-orange)' }}>MiGo Buddy</div>
                          <span>Learning Companion</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '24px' }}>
                    <button
                      onClick={() => window.print()}
                      style={{
                        flex: 1,
                        padding: '12px 24px',
                        background: '#FFFFFF',
                        border: '2px solid var(--color-peach)',
                        color: 'var(--color-orange-dark)',
                        borderRadius: '12px',
                        fontWeight: 900,
                        cursor: 'pointer'
                      }}
                      type="button"
                    >
                      💾 Download PDF
                    </button>
                    <button
                      onClick={handleFinishAssessment}
                      style={{
                        flex: 1.5,
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, var(--color-orange), var(--color-orange-dark))',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(255,122,0,0.3)'
                      }}
                      type="button"
                    >
                      Unlock {lesson.difficulty === 'beginner' ? 'Intermediate' : lesson.difficulty === 'intermediate' ? 'Advanced' : 'Next'} Level ➔
                    </button>
                  </div>
                </div>
              ) : (
                /* FAILED VIEW: Level remains locked, no certificate */
                <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px', background: '#FFFFFF', border: '3px solid #FFCDD2' }}>
                  
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <AlertCircle size={40} color="#D32F2F" />
                  </div>
                  
                  <h3 style={{ fontSize: '20px', fontWeight: 950, color: '#C62828', margin: '0 0 8px 0', border: 'none', padding: 0 }}>
                    Assessment Locked
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5, margin: '0 0 24px 0', fontWeight: 700 }}>
                    You scored <strong style={{ color: '#D32F2F' }}>{correctCount} / 10</strong>. A passing score of at least <strong>{passingScore} / 10</strong> is required to unlock the next learning level block. 
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                    <button
                      onClick={handleRetakeAssessment}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: 'linear-gradient(135deg, var(--color-orange), var(--color-orange-dark))',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(255,122,0,0.25)',
                        fontSize: '14px'
                      }}
                      type="button"
                    >
                      🔄 Retake Assessment
                    </button>
                    <button
                      onClick={handleExitWithoutPassing}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: '#FFFFFF',
                        border: '2.5px solid var(--color-peach)',
                        color: 'var(--color-orange-dark)',
                        borderRadius: '12px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                      type="button"
                    >
                      🗺️ Back to Dashboard
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* FULL REVIEW SECTION AND RECOMMENDATIONS */}
            <div className={styles.card} style={{ padding: '28px', textAlign: 'left', background: '#FFFFFF', border: '2.5px solid var(--color-peach-light)' }}>
              
              <h3 style={{ fontSize: '18px', fontWeight: 950, color: 'var(--color-orange-dark)', borderBottom: '2.5px dashed var(--color-peach)', paddingBottom: '10px', margin: '0 0 20px 0' }}>
                🔍 Checkup Review & Performance Analysis
              </h3>

              {/* Mistakes review */}
              <div style={{ marginBottom: '28px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '12px' }}>
                  {wrongIndices.length === 0 ? '🎉 Perfect Score! No mistakes' : `Reviewing ${wrongIndices.length} incorrect answers:`}
                </h4>

                {wrongIndices.length === 0 ? (
                  <div style={{ padding: '16px', borderRadius: '12px', border: '2px solid #A9F5C5', backgroundColor: '#EAFCEF', color: '#27AE60', fontWeight: 800, fontSize: '13.5px' }}>
                    Congratulations! You answered every question correctly. You are ready to start the next level of lessons.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {wrongIndices.map((qIdx, index) => {
                      const q = qList[qIdx];
                      const ans = assessmentAnswers[qIdx];
                      return (
                        <div key={qIdx} style={{ padding: '16px', borderRadius: '14px', border: '2px solid var(--color-peach-light)', backgroundColor: '#FFFDF9' }}>
                          <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--color-orange-dark)', textTransform: 'uppercase' }}>Question {qIdx + 1}</span>
                          <h5 style={{ fontSize: '14.5px', fontWeight: 900, color: 'var(--text-dark)', margin: '4px 0 10px 0' }}>{q.question}</h5>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 800 }}>
                            <div style={{ color: '#D32F2F', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>❌ Your Answer:</span>
                              <strong>{ans !== null ? q.options[ans] : 'Unanswered'}</strong>
                            </div>
                            <div style={{ color: '#2E7D32', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>✅ Correct Answer:</span>
                              <strong>{q.options[q.correct_index]}</strong>
                            </div>
                          </div>

                          {q.explanation && (
                            <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 700, borderLeft: '3px solid var(--color-orange)', paddingLeft: '8px' }}>
                              💡 Explanation: {q.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Practice Recommendations */}
              {wrongIndices.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} color="var(--color-orange)" />
                    <span>Recommended Practice Lessons</span>
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {recLessons.map((rec, rIdx) => (
                      <div 
                        key={rIdx} 
                        onClick={() => navigate(rec.link)}
                        style={{ 
                          padding: '16px', 
                          border: '2px solid var(--color-peach-light)', 
                          borderRadius: '12px', 
                          backgroundColor: '#FFFBF5', 
                          cursor: 'pointer', 
                          transition: 'all 0.15s ease' 
                        }}
                      >
                        <h5 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 900, color: 'var(--color-orange-dark)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{rec.title}</span>
                          <span style={{ fontSize: '11px', textDecoration: 'underline' }}>Go Practice ➔</span>
                        </h5>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontWeight: 650, lineHeight: 1.3 }}>
                          {rec.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      );
    }

    const currentQ = qList[currentQuizIndex];

    return (
      <div className={styles.container} style={{ background: '#FFFDF9', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px' }}>
        <div style={{ maxWidth: '840px', width: '100%' }}>
          
          {/* Assessment Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button
              onClick={() => navigate('/home')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                color: 'var(--color-orange-dark)',
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={20} />
              <span>Exit Assessment</span>
            </button>
            <h1 style={{ fontSize: '20px', fontWeight: 950, color: 'var(--text-dark)', margin: 0 }}>
              {lesson.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFF5E8', border: '1.5px solid var(--color-peach)', padding: '6px 14px', borderRadius: '12px', color: 'var(--color-orange-dark)', fontWeight: 900 }}>
              <span>⏱️</span>
              <span>{formatTime(assessmentTimeLeft)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800, color: 'var(--text-dark)' }}>
              <span>Question {currentQuizIndex + 1} of 10</span>
              <span>{assessmentAnswers.filter(a => a !== null).length} answered</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(currentQuizIndex + 1) * 10}%`, height: '100%', background: '#FF7A00', borderRadius: '4px', transition: 'all 0.3s ease' }} />
            </div>
          </div>

          {/* Assessment Main Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '24px', alignItems: 'start' }}>
            
            {/* Sidebar Number Grid */}
            <div className={styles.card} style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {Array.from({ length: 10 }).map((_, idx) => {
                const isSelected = currentQuizIndex === idx;
                const isAnswered = assessmentAnswers[idx] !== null;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuizIndex(idx)}
                    style={{
                      height: '40px',
                      borderRadius: '10px',
                      border: isSelected ? '2.5px solid var(--color-orange)' : '1.5px solid #CBD5E1',
                      background: isSelected ? 'var(--color-cream-bg)' : isAnswered ? '#FFEED9' : '#FFFFFF',
                      color: isSelected ? 'var(--color-orange-dark)' : isAnswered ? 'var(--color-orange-dark)' : 'var(--text-dark)',
                      fontWeight: 900,
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Question Pane */}
            <div className={styles.card} style={{ padding: '32px', textAlign: 'left', minHeight: '360px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              
              {currentQ ? (
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--color-orange-dark)', fontWeight: 900, textTransform: 'uppercase' }}>Checkup Question</span>
                  <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-dark)', marginTop: '8px', marginBottom: '24px', lineHeight: '1.4' }}>
                    {currentQ.question}
                  </h2>

                  {/* Options List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {currentQ.options?.map((opt, oIdx) => {
                      const isOptionChosen = assessmentAnswers[currentQuizIndex] === oIdx;
                      const hasSelectedAny = assessmentAnswers[currentQuizIndex] !== null;
                      const isCorrectOpt = oIdx === currentQ.correct_index;

                      let btnStyle = {
                        width: '100%',
                        padding: '16px 20px',
                        borderRadius: '14px',
                        border: '2px solid #E2E8F0',
                        background: '#FFFFFF',
                        color: 'var(--text-dark)',
                        fontWeight: 800,
                        fontSize: '15px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      };

                      if (hasSelectedAny) {
                        if (isCorrectOpt) {
                          btnStyle.border = '2.5px solid #2E7D32';
                          btnStyle.background = '#E8F5E9';
                          btnStyle.color = '#2E7D32';
                        } else if (isOptionChosen) {
                          btnStyle.border = '2.5px solid #C62828';
                          btnStyle.background = '#FFEBEE';
                          btnStyle.color = '#C62828';
                        } else {
                          btnStyle.opacity = 0.6;
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={hasSelectedAny}
                          onClick={() => {
                            setAssessmentAnswers(prev => {
                              const copy = [...prev];
                              copy[currentQuizIndex] = oIdx;
                              return copy;
                            });
                          }}
                          style={btnStyle}
                          type="button"
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{opt}</span>
                            {hasSelectedAny && isCorrectOpt && <span>✅</span>}
                            {hasSelectedAny && isOptionChosen && !isCorrectOpt && <span>❌</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p>Loading question...</p>
              )}

              {/* Navigation buttons and Passing note */}
              <div style={{ borderTop: '2px solid var(--color-peach-light)', paddingTop: '20px', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textAlign: 'center' }}>
                  🎯 Score {passingScore}/10 or more to pass and complete the {lesson.difficulty ? lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1) : ''} Level!
                </span>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    disabled={currentQuizIndex === 0}
                    onClick={() => setCurrentQuizIndex(prev => prev - 1)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      background: 'none',
                      border: '1.5px solid #CBD5E1',
                      color: currentQuizIndex === 0 ? '#CBD5E1' : 'var(--text-dark)',
                      fontWeight: 850,
                      cursor: currentQuizIndex === 0 ? 'default' : 'pointer'
                    }}
                    type="button"
                  >
                    {t('backBtn')}
                  </button>

                  {currentQuizIndex < 9 ? (
                    <button
                      onClick={() => setCurrentQuizIndex(prev => prev + 1)}
                      style={{
                        padding: '10px 24px',
                        borderRadius: '10px',
                        background: 'var(--color-orange)',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 900,
                        cursor: 'pointer'
                      }}
                      type="button"
                    >
                      Next Question ➔
                    </button>
                  ) : (
                    <button
                      disabled={assessmentAnswers.includes(null)}
                      onClick={() => setAssessmentFinished(true)}
                      style={{
                        padding: '12px 32px',
                        borderRadius: '12px',
                        background: assessmentAnswers.includes(null) ? '#CBD5E1' : 'linear-gradient(135deg, var(--color-orange), var(--color-orange-dark))',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 900,
                        cursor: assessmentAnswers.includes(null) ? 'default' : 'pointer',
                        boxShadow: assessmentAnswers.includes(null) ? 'none' : '0 4px 15px rgba(255,122,0,0.3)'
                      }}
                      type="button"
                    >
                      Submit Assessment ✓
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }

  const renderGuidedWritingSystem = (slide) => {
    const lang = preferredLanguage || 'en';
    const data = getWritingLessonData(lang, slide);
    const isRtl = ['ar', 'ur', 'fa', 'he'].includes(lang);

    const speakText = (txt) => {
      speak(txt, speechLang, audioSpeed);
    };

    // Step 3 logic: compile the template with current filled blanks
    const compileTemplateText = (blanksMap) => {
      const parts = data.template.split(/(\[[^\]]+\])/);
      let counter = 0;
      return parts.map(part => {
        if (part.startsWith('[') && part.endsWith(']')) {
          const val = blanksMap[counter++];
          return val !== undefined ? val : part;
        }
        return part;
      }).join('');
    };

    // Step 4 wizard logic
    const handleWizardSelect = (stepIdx, opt) => {
      const updated = { ...wizardOptionSelections, [stepIdx]: opt };
      setWizardOptionSelections(updated);
      
      // If last step, compile the text
      const steps = data.wizard?.steps || [];
      if (stepIdx === steps.length - 1) {
        const fullText = Object.keys(updated).sort().map(k => updated[k]).join(' ');
        setGuidedCompiledText(fullText);
        setParagraphText(fullText);
        setWritingStep(5);
      }
    };

    // Step 7 AI Tip Evaluator
    const runAIEvaluation = () => {
      setWritingAttempts(prev => prev + 1);
      
      const currentText = slide.type === 'letter_drafting' ? letterBody : paragraphText;
      const cleanText = currentText.trim();
      
      if (cleanText === '') {
        setFeedbackEvaluation({
          severity: 'red',
          title: lang === 'hi' ? 'खाली उत्तर' : lang === 'kn' ? 'ಖಾಲಿ ಉತ್ತರ' : lang === 'ta' ? 'வெற்று பதில்' : 'Empty Answer',
          message: lang === 'hi' ? 'कृपया लिखना शुरू करें, यह बिल्कुल खाली है!' : lang === 'kn' ? 'ದಯವಿಟ್ಟು ಬರೆಯಲು ಪ್ರಾರಂಭಿಸಿ, ಇದು ಸಂಪೂರ್ಣವಾಗಿ ಖಾಲಿಯಾಗಿದೆ!' : lang === 'ta' ? 'தயவுசெய்து எழுதத் தொடங்குங்கள், இது வெற்றுப் பக்கமாக உள்ளது!' : 'Please start writing, the box is empty!'
        });
        return;
      }

      // Check validation criteria
      const hasCapitalization = cleanText[0] === cleanText[0].toUpperCase();
      const hasPunctuation = cleanText.endsWith('.') || cleanText.endsWith('?') || cleanText.endsWith('!') || cleanText.endsWith('।');
      const wordsCount = cleanText.split(/\s+/).filter(Boolean).length;
      
      let severity = 'green';
      let title = lang === 'hi' ? 'उत्कृष्ट प्रयास! 🎉' : lang === 'kn' ? 'ಅದ್ಭುತ ಪ್ರಯತ್ನ! 🎉' : lang === 'ta' ? 'சிறந்த முயற்சி! 🎉' : 'Excellent Effort! 🎉';
      let message = lang === 'hi' ? 'आपका उत्तर बहुत अच्छा है और विषय से मेल खाता है।' : lang === 'kn' ? 'ನಿಮ್ಮ ಉತ್ತರ ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ ಮತ್ತು ವಿಷಯಕ್ಕೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.' : lang === 'ta' ? 'உங்கள் பதில் மிகவும் நன்றாக உள்ளது மற்றும் தலைப்புடன் பொருந்துகிறது.' : 'Your answer is very good and relevant to the topic.';

      // Capitalization rules (English only)
      if (lang === 'en' && !hasCapitalization) {
        severity = 'yellow';
        title = 'Capitalization Tip 🔤';
        message = 'Remember to start your sentence with a capital letter.';
      }
      // Punctuation check
      else if (!hasPunctuation) {
        severity = 'yellow';
        title = lang === 'hi' ? 'विराम चिह्न का संकेत 🔣' : lang === 'kn' ? 'ವಿರಾಮ ಚಿಹ್ನೆಯ ಸಲಹೆ 🔣' : lang === 'ta' ? 'நிறுத்தற்குறி குறிப்பு 🔣' : 'Punctuation Tip 🔣';
        message = lang === 'hi' ? 'वाक्य के अंत में पूर्णविराम (।) लगाना याद रखें।' : lang === 'kn' ? 'ವಾಕ್ಯದ ಕೊನೆಯಲ್ಲಿ ಪೂರ್ಣವಿರಾಮ (.) ಹಾಕಲು ಮರೆಯದಿರಿ.' : lang === 'ta' ? 'வாக்கியத்தின் இறுதியில் முற்றுப்புள்ளி (.) வைக்க மறக்காதீர்கள்.' : 'Remember to add a punctuation mark at the end of the sentence.';
      }
      // Word count check
      else if (wordsCount < 10) {
        severity = 'yellow';
        title = lang === 'hi' ? 'लेखन गुणवत्ता संकेत 📝' : lang === 'kn' ? 'ಬರವಣಿಗೆ ಗುಣಮಟ್ಟದ ಸಲಹೆ 📝' : lang === 'ta' ? 'எழுத்து தர குறிப்பு 📝' : 'Writing Quality Tip 📝';
        message = lang === 'hi' ? 'उत्तर बहुत छोटा है। कम से कम 10 शब्द लिखने का प्रयास करें।' : lang === 'kn' ? 'ಉತ್ತರ ತುಂಬಾ ಚಿಕ್ಕದಾಗಿದೆ. ಕನಿಷ್ಠ 10 ಪದಗಳನ್ನು ಬರೆಯಲು ಪ್ರಯತ್ನಿಸಿ.' : lang === 'ta' ? 'பதில் மிகவும் சிறியதாக உள்ளது. குறைந்தது 10 வார்த்தைகள் எழுத முயற்சிக்கவும்.' : 'The response is a bit short. Try writing at least 10 words.';
      }

      // Add progressive hint tip
      if (severity === 'yellow') {
        const attempt = writingAttempts + 1;
        if (attempt === 1) {
          message += lang === 'hi' ? ' (पहला संकेत: वाक्य की अंतिम सीमा जांचें)' : ' (First Hint: Check sentence boundary)';
        } else if (attempt === 2) {
          message += lang === 'hi' ? ' (दूसरा संकेत: स्वच्छता/पत्र प्रारूप की जांच करें)' : ' (Second Hint: Verify cleanliness or letter format)';
        } else {
          message = lang === 'hi' ? 'सही उत्तर प्रारूप: ' + data.template : 'Intended template format: ' + data.template;
          severity = 'green'; // Unlocks next step
        }
      }

      setFeedbackEvaluation({ severity, title, message });
    };

    return (
      <div 
        dir={isRtl ? 'rtl' : 'ltr'} 
        style={{
          width: '100%',
          maxWidth: '780px',
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '24px',
          border: '2px solid var(--color-peach-light)',
          textAlign: isRtl ? 'right' : 'left',
          boxShadow: '0 8px 30px rgba(0,0,0,0.02)',
          marginBottom: '24px'
        }}
      >
        {/* Stepper progress indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#FFF8F2', padding: '12px 16px', borderRadius: '16px', border: '1.5px solid var(--color-peach-light)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--color-orange-dark)', textTransform: 'uppercase' }}>
              Guided Stage {writingStep} of 8
            </span>
            <strong style={{ fontSize: '14.5px', color: 'var(--text-dark)' }}>
              {writingStep === 1 && "Step 1 — Learn Words"}
              {writingStep === 2 && "Step 2 — See Sentence Patterns"}
              {writingStep === 3 && "Step 3 — Fill Guided Blanks"}
              {writingStep === 4 && "Step 4 — Build Sentences"}
              {writingStep === 5 && "Step 5 — Complete Guided Response"}
              {writingStep === 6 && "Step 6 — Write Independently"}
              {writingStep === 7 && "Step 7 — Receive AI Feedback"}
              {writingStep === 8 && "Step 8 — Final Review"}
            </strong>
          </div>
          
          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: (idx + 1) <= writingStep ? 'var(--color-orange)' : '#E2E8F0',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Learn Words */}
        {writingStep === 1 && (
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px' }}>
              💡 {lang === 'hi' ? 'नए शब्दों को सुनें और सीखें:' : lang === 'kn' ? 'ಹೊಸ ಪದಗಳನ್ನು ಆಲಿಸಿ ಮತ್ತು ಕಲಿಯಿರಿ:' : lang === 'ta' ? 'புதிய சொற்களைக் கேட்டு கற்றுக்கொள்ளுங்கள்:' : 'Listen and learn new vocabulary:'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {data.vocabulary.map((v, idx) => (
                <div 
                  key={idx} 
                  onClick={() => speakText(v.word)}
                  style={{
                    padding: '14px',
                    borderRadius: '16px',
                    background: 'var(--color-cream-bg)',
                    border: '1.5px solid var(--color-peach-light)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.01)'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>🔊</span>
                  <h4 style={{ fontSize: '14px', fontWeight: 900, color: 'var(--color-orange-dark)', margin: '6px 0 2px 0' }}>{v.word}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>{v.meaning}</p>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button 
                onClick={() => setWritingStep(2)}
                className={styles.finishLessonBtn}
                style={{ width: 'auto', padding: '10px 24px', backgroundColor: 'var(--color-orange)' }}
                type="button"
              >
                Next Step ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: See Sentence Patterns */}
        {writingStep === 2 && (
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px' }}>
              💬 {lang === 'hi' ? 'वाक्य बनाने के लिए सहायक वाक्यांश:' : lang === 'kn' ? 'ವಾಕ್ಯ ರಚಿಸಲು ಸಹಾಯ ಮಾಡುವ ಪದಗುಚ್ಛಗಳು:' : lang === 'ta' ? 'வாக்கியங்களை அமைக்க உதவும் சொற்றொடர்கள்:' : 'Helpful sentence starters to guide your flow:'}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {data.sentenceHelpers.map((helper, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    background: '#FFFDF9',
                    border: '1.5px solid #FFE0B2',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    color: 'var(--text-dark)'
                  }}
                >
                  <span>{helper}</span>
                  <button 
                    onClick={() => speakText(helper)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                    type="button"
                  >
                    🔊
                  </button>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button 
                onClick={() => setWritingStep(1)}
                className={styles.mutedNavBtn}
                type="button"
              >
                Back
              </button>
              <button 
                onClick={() => setWritingStep(3)}
                className={styles.finishLessonBtn}
                style={{ width: 'auto', padding: '10px 24px', backgroundColor: 'var(--color-orange)' }}
                type="button"
              >
                Next Step ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Fill Guided Blanks */}
        {writingStep === 3 && (
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px' }}>
              📝 {lang === 'hi' ? 'खाली स्थानों पर टैप करें और उपयुक्त शब्द चुनें:' : lang === 'kn' ? 'ಖಾಲಿ ಜಾಗಗಳ ಮೇಲೆ ಟ್ಯಾಪ್ ಮಾಡಿ ಮತ್ತು ಸೂಕ್ತ ಪದ ಆರಿಸಿ:' : lang === 'ta' ? 'கோடிட்ட இடங்களில் தட்டி பொருத்தமான சொற்களைத் தேர்ந்தெடுக்கவும்:' : 'Tap blanks to select suggestions or type words:'}
            </p>
            
            <div style={{ background: '#FFFDF9', border: '2px solid #FFE0B2', borderRadius: '16px', padding: '18px 22px', textAlign: 'left', lineHeight: '2', marginBottom: '20px' }}>
              {parseTemplateToReact(data.template, data.blanks, filledBlanks, activeBlankIdx, setActiveBlankIdx)}
            </div>

            {activeBlankIdx !== null && (
              <div style={{ background: '#FFF8F2', padding: '16px', borderRadius: '16px', border: '2px solid var(--color-peach-light)', marginBottom: '20px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 900, color: 'var(--color-orange-dark)' }}>
                    💡 Suggestions (Hint: {(data.blanks[activeBlankIdx] || {}).hint || 'Choose a word'}):
                  </span>
                  <button onClick={() => setActiveBlankIdx(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 800, cursor: 'pointer', fontSize: '12px' }} type="button">Close ✕</button>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {((data.blanks[activeBlankIdx] || {}).suggestions || []).map((sug) => (
                    <button
                      key={sug}
                      onClick={() => {
                        const updated = { ...filledBlanks, [activeBlankIdx]: sug };
                        setFilledBlanks(updated);
                        const compiled = compileTemplateText(updated);
                        if (slide.type === 'letter_drafting') {
                          setLetterBody(compiled);
                        } else {
                          setParagraphText(compiled);
                        }
                        if (activeBlankIdx < data.blanks.length - 1) {
                          setActiveBlankIdx(activeBlankIdx + 1);
                        } else {
                          setActiveBlankIdx(null);
                        }
                      }}
                      style={{
                        padding: '8px 16px',
                        background: '#FFFFFF',
                        border: '1.5px solid var(--color-peach)',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 850,
                        color: 'var(--color-orange-dark)',
                        cursor: 'pointer'
                      }}
                      type="button"
                    >
                      {sug}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Or type custom word..."
                    value={customBlankInput}
                    onChange={(e) => setCustomBlankInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customBlankInput.trim() !== '') {
                        const updated = { ...filledBlanks, [activeBlankIdx]: customBlankInput.trim() };
                        setFilledBlanks(updated);
                        const compiled = compileTemplateText(updated);
                        if (slide.type === 'letter_drafting') {
                          setLetterBody(compiled);
                        } else {
                          setParagraphText(compiled);
                        }
                        setCustomBlankInput('');
                        if (activeBlankIdx < data.blanks.length - 1) {
                          setActiveBlankIdx(activeBlankIdx + 1);
                        } else {
                          setActiveBlankIdx(null);
                        }
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--color-peach-light)',
                      fontSize: '13px',
                      fontWeight: 700,
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => {
                      if (customBlankInput.trim() !== '') {
                        const updated = { ...filledBlanks, [activeBlankIdx]: customBlankInput.trim() };
                        setFilledBlanks(updated);
                        const compiled = compileTemplateText(updated);
                        if (slide.type === 'letter_drafting') {
                          setLetterBody(compiled);
                        } else {
                          setParagraphText(compiled);
                        }
                        setCustomBlankInput('');
                        if (activeBlankIdx < data.blanks.length - 1) {
                          setActiveBlankIdx(activeBlankIdx + 1);
                        } else {
                          setActiveBlankIdx(null);
                        }
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      background: 'var(--color-orange)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    type="button"
                  >
                    Insert
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button 
                onClick={() => setWritingStep(2)}
                className={styles.mutedNavBtn}
                type="button"
              >
                Back
              </button>
              <button 
                onClick={() => {
                  const compiled = compileTemplateText(filledBlanks);
                  setGuidedCompiledText(compiled);
                  if (slide.type === 'letter_drafting') {
                    setLetterBody(compiled);
                  } else {
                    setParagraphText(compiled);
                  }
                  setWritingStep(4);
                }}
                className={styles.finishLessonBtn}
                style={{ width: 'auto', padding: '10px 24px', backgroundColor: 'var(--color-orange)' }}
                type="button"
              >
                Next Step ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Build Sentences (wizard stepper) */}
        {writingStep === 4 && (
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px' }}>
              ✨ {lang === 'hi' ? 'वाक्य निर्माण सहायक: एक विकल्प चुनें' : lang === 'kn' ? 'ವಾಕ್ಯ ರಚನೆ ಸಹಾಯಕ: ಒಂದು ಆಯ್ಕೆ ಮಾಡಿ' : lang === 'ta' ? 'வாக்கிய வடிவமைப்பு: ஒரு விருப்பத்தைத் தேர்ந்தெடுக்கவும்' : 'Sentence Builder: Select a sentence choice'}
            </p>
            
            {(() => {
              const wizard = data.wizard || { steps: [] };
              const currentWizStep = Object.keys(wizardOptionSelections).length;
              const stepData = wizard.steps[currentWizStep] || wizard.steps[wizard.steps.length - 1];
              
              if (!stepData) {
                return (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p style={{ fontWeight: 800 }}>Draft Ready!</p>
                    <button 
                      onClick={() => setWritingStep(5)}
                      className={styles.finishLessonBtn}
                      style={{ width: 'auto', padding: '10px 24px', backgroundColor: 'var(--color-orange)', marginTop: '12px' }}
                      type="button"
                    >
                      Show Draft ➔
                    </button>
                  </div>
                );
              }

              return (
                <div>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '12px' }}>
                    {stepData.question}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {stepData.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => handleWizardSelect(currentWizStep, opt)}
                        style={{
                          padding: '14px 16px',
                          background: 'var(--color-cream-bg)',
                          border: '2px solid var(--color-peach-light)',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: 800,
                          color: 'var(--text-dark)',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                        type="button"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button 
                onClick={() => setWritingStep(3)}
                className={styles.mutedNavBtn}
                type="button"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Complete Guided Response */}
        {writingStep === 5 && (
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px' }}>
              📄 {lang === 'hi' ? 'आपका तैयार किया गया प्रारूप:' : lang === 'kn' ? 'ನಿಮ್ಮ ಸಿದ್ಧಪಡಿಸಿದ ಡ್ರಾಫ್ಟ್:' : lang === 'ta' ? 'உங்களது வரைவுப் படிவம்:' : 'Your completed guided draft:'}
            </p>
            
            <div style={{ background: '#FFFDF9', border: '2px solid #FFE0B2', borderRadius: '16px', padding: '18px 22px', fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)', lineHeight: '1.8', minHeight: '100px', textAlign: 'left', whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
              {guidedCompiledText || (slide.type === 'letter_drafting' ? letterBody : paragraphText)}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button 
                onClick={() => setWritingStep(4)}
                className={styles.mutedNavBtn}
                type="button"
              >
                Back
              </button>
              <button 
                onClick={() => {
                  if (slide.type === 'letter_drafting') {
                    if (letterBody.trim() === '') setLetterBody(guidedCompiledText);
                  } else {
                    if (paragraphText.trim() === '') setParagraphText(guidedCompiledText);
                  }
                  setWritingStep(6);
                }}
                className={styles.finishLessonBtn}
                style={{ width: 'auto', padding: '10px 24px', backgroundColor: 'var(--color-orange)' }}
                type="button"
              >
                Next Step ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Write Independently */}
        {writingStep === 6 && (
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px' }}>
              ✍️ {lang === 'hi' ? 'अब अपने शब्दों में लिखें (प्रारूप नीचे संदर्भ के लिए है):' : lang === 'kn' ? 'ಈಗ ನಿಮ್ಮ ಸ್ವಂತ ಪದಗಳಲ್ಲಿ ಬರೆಯಿರಿ (ಡ್ರಾಫ್ಟ್ ಉಲ್ಲೇಖಕ್ಕಾಗಿ ಕೆಳಗಿದೆ):' : lang === 'ta' ? 'இப்போது உங்கள் சொந்த சொற்களில் எழுதவும் (வரைவு குறிப்பு கீழே உள்ளது):' : 'Write independently (guided reference is below):'}
            </p>
            
            {slide.type === 'letter_drafting' ? (
              <div style={{ background: '#FFFFFF', border: '1.5px solid var(--color-peach-light)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                  <span style={{ width: '70px', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)' }}>To:</span>
                  <input type="text" value={letterTo} onChange={(e) => setLetterTo(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', fontWeight: 700 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                  <span style={{ width: '70px', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)' }}>Subject:</span>
                  <input type="text" value={letterSubject} onChange={(e) => setLetterSubject(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', fontWeight: 700 }} />
                </div>
                <textarea
                  value={letterBody}
                  onChange={(e) => setLetterBody(e.target.value)}
                  style={{ width: '100%', height: '120px', border: 'none', outline: 'none', resize: 'none', fontSize: '13px', fontWeight: 700, lineHeight: '1.6' }}
                />
              </div>
            ) : (
              <textarea
                value={paragraphText}
                onChange={(e) => setParagraphText(e.target.value)}
                style={{
                  width: '100%',
                  height: '140px',
                  borderRadius: '16px',
                  border: '2px solid var(--color-peach-light)',
                  padding: '14px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  resize: 'none',
                  outline: 'none',
                  lineHeight: '1.6',
                  marginBottom: '16px'
                }}
              />
            )}

            {/* Clickable Help words bank */}
            <div style={{ background: '#FFF8F2', padding: '12px', borderRadius: '12px', border: '1.5px solid var(--color-peach-light)', marginBottom: '16px', textAlign: 'left' }}>
              <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--color-orange-dark)', display: 'block', marginBottom: '6px' }}>
                🧩 Click words to insert:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {data.vocabulary.map((v) => (
                  <button
                    key={v.word}
                    onClick={() => {
                      if (slide.type === 'letter_drafting') {
                        setLetterBody(prev => prev + " " + v.word);
                      } else {
                        setParagraphText(prev => prev + " " + v.word);
                      }
                    }}
                    style={{
                      padding: '4px 10px',
                      background: '#FFFFFF',
                      border: '1px solid var(--color-peach)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 800,
                      color: 'var(--color-orange-dark)',
                      cursor: 'pointer'
                    }}
                    type="button"
                  >
                    {v.word}
                  </button>
                ))}
              </div>
            </div>

            {/* Compiled reference */}
            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#64748B', lineHeight: '1.5', textAlign: 'left', maxHeight: '80px', overflowY: 'auto' }}>
              <strong>Reference template:</strong> {guidedCompiledText || data.template}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button 
                onClick={() => setWritingStep(5)}
                className={styles.mutedNavBtn}
                type="button"
              >
                Back
              </button>
              <button 
                onClick={() => {
                  runAIEvaluation();
                  setWritingStep(7);
                }}
                className={styles.finishLessonBtn}
                style={{ width: 'auto', padding: '10px 24px', backgroundColor: 'var(--color-orange)' }}
                type="button"
              >
                Submit & Get AI Feedback ✓
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: Receive Supportive Feedback */}
        {writingStep === 7 && feedbackEvaluation && (
          <div>
            <div style={{
              background: feedbackEvaluation.severity === 'green' ? '#E8F5E9' : '#FFF3E0',
              border: feedbackEvaluation.severity === 'green' ? '2px solid #2E7D32' : '2px solid #E65100',
              color: feedbackEvaluation.severity === 'green' ? '#1B5E20' : '#E65100',
              padding: '16px 20px',
              borderRadius: '16px',
              textAlign: 'left',
              marginBottom: '20px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '32px' }}>
                {feedbackEvaluation.severity === 'green' ? '🦉' : '💡'}
              </span>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 900 }}>
                  {feedbackEvaluation.title}
                </h4>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, lineHeight: '1.5' }}>
                  {feedbackEvaluation.message}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button 
                onClick={() => setWritingStep(6)}
                className={styles.mutedNavBtn}
                type="button"
              >
                ✏️ Edit Writing / Try Again
              </button>
              
              <button 
                onClick={() => setWritingStep(8)}
                className={styles.finishLessonBtn}
                style={{ width: 'auto', padding: '10px 24px', backgroundColor: '#4CAF50' }}
                type="button"
              >
                Review Learnings ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 8: Final Review */}
        {writingStep === 8 && (
          <div>
            <h4 style={{ fontSize: '14.5px', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '12px', textAlign: 'left' }}>
              📚 What You Learned:
            </h4>
            <div style={{ background: '#FFF8F2', padding: '16px', borderRadius: '16px', border: '1.5px solid var(--color-peach-light)', textAlign: 'left', fontSize: '13px', fontWeight: 800, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div>• <strong>Spelling Tip:</strong> always keep structural punctuation at paragraph boundaries.</div>
              <div>• <strong>Vocabulary learned:</strong> {data.vocabulary.map(v => v.word).join(', ')}</div>
            </div>

            {/* Checkup Question */}
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <strong style={{ fontSize: '13.5px', color: 'var(--text-dark)', display: 'block', marginBottom: '10px' }}>
                Quick Checkup: {data.review.question}
              </strong>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.review.options.map((opt, oIdx) => {
                  const isChosen = reviewAnswer === opt;
                  const isCorrect = opt === data.review.correct;
                  
                  let btnBg = '#FFFFFF';
                  let borderCol = '#E2E8F0';
                  if (reviewAnswerChecked) {
                    if (isCorrect) {
                      btnBg = '#E8F5E9';
                      borderCol = '#2E7D32';
                    } else if (isChosen) {
                      btnBg = '#FFEBEE';
                      borderCol = '#C62828';
                    }
                  } else if (isChosen) {
                    btnBg = 'var(--color-cream-bg)';
                    borderCol = 'var(--color-orange)';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => {
                        if (reviewAnswerChecked) return;
                        setReviewAnswer(opt);
                      }}
                      style={{
                        padding: '12px 14px',
                        background: btnBg,
                        border: `2px solid ${borderCol}`,
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        cursor: reviewAnswerChecked ? 'default' : 'pointer',
                        textAlign: 'left'
                      }}
                      type="button"
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {reviewAnswer && !reviewAnswerChecked && (
                <button
                  onClick={() => setReviewAnswerChecked(true)}
                  style={{
                    padding: '8px 20px',
                    background: 'var(--color-orange)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 850,
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginTop: '12px'
                  }}
                  type="button"
                >
                  Verify Answer
                </button>
              )}

              {reviewAnswerChecked && (
                <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', background: reviewAnswer === data.review.correct ? '#EAFCEF' : '#FFF2F2', border: reviewAnswer === data.review.correct ? '1px solid #A9F5C5' : '1px solid #FFCDD2', fontSize: '12px', color: reviewAnswer === data.review.correct ? '#27AE60' : '#C62828', fontWeight: 800 }}>
                  {reviewAnswer === data.review.correct ? '✅ ' + data.review.explanation : '❌ ' + (lang === 'hi' ? 'गलत उत्तर। फिर से प्रयास करें।' : 'Incorrect. Study the option and try again.')}
                  
                  {reviewAnswer !== data.review.correct && (
                    <button 
                      onClick={() => {
                        setReviewAnswer(null);
                        setReviewAnswerChecked(false);
                      }}
                      style={{ display: 'block', marginTop: '6px', background: 'none', border: 'none', color: '#2980B9', fontWeight: 900, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                      type="button"
                    >
                      Retry Question
                    </button>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button 
                onClick={() => setWritingStep(7)}
                className={styles.mutedNavBtn}
                type="button"
              >
                Back
              </button>
              
              <button 
                onClick={() => {
                  setSlideIndex(prev => prev + 1);
                }}
                disabled={!reviewAnswerChecked || reviewAnswer !== data.review.correct}
                className={styles.finishLessonBtn}
                style={{ 
                  width: 'auto', 
                  padding: '10px 32px', 
                  backgroundColor: (reviewAnswerChecked && reviewAnswer === data.review.correct) ? '#4CAF50' : '#E2E8F0',
                  color: (reviewAnswerChecked && reviewAnswer === data.review.correct) ? '#FFFFFF' : '#94A3B8',
                  cursor: (reviewAnswerChecked && reviewAnswer === data.review.correct) ? 'pointer' : 'default'
                }}
                type="button"
              >
                Finish Lesson & Save Progress ✓
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderWizardModal = () => {
    if (!showWizardModal) return null;
    const lang = preferredLanguage || 'en';
    const starters = MIGO_WRITING_STARTERS[lang] || MIGO_WRITING_STARTERS['en'];
    const topicKey = getWritingStarterKey(selectedTopic);
    const data = starters[topicKey] || starters['default'];
    const wizardData = data.wizard || starters['default'].wizard;
    const steps = wizardData.steps;
    
    const handleSelectOption = (opt) => {
      const updatedAnswers = [...wizardAnswers, opt];
      setWizardAnswers(updatedAnswers);
      if (wizardStep < steps.length - 1) {
        setWizardStep(wizardStep + 1);
      } else {
        const fullText = updatedAnswers.join(' ');
        setParagraphText(fullText);
        setShowWizardModal(false);
        setWizardStep(0);
        setWizardAnswers([]);
      }
    };
    
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 10000,
        padding: '16px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF', borderRadius: '24px',
          border: '4px solid var(--color-peach, #FFE0B2)', padding: '24px',
          maxWidth: '520px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'var(--color-orange-dark, #E06B00)' }}>
              ✨ Help Me Build: Step {wizardStep + 1} of {steps.length}
            </h3>
            <button
              onClick={() => {
                setShowWizardModal(false);
                setWizardStep(0);
                setWizardAnswers([]);
              }}
              style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: 900, cursor: 'pointer', color: 'var(--text-muted)' }}
              type="button"
            >
              ✕
            </button>
          </div>
          
          <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '16px', textAlign: 'left' }}>
            {steps[wizardStep].question}
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {steps[wizardStep].options.map((opt, oIdx) => (
              <button
                key={oIdx}
                onClick={() => handleSelectOption(opt)}
                style={{
                  padding: '14px 16px',
                  background: 'var(--color-cream-bg, #FFFDF9)',
                  border: '2px solid var(--color-peach-light, #FFE0B2)',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: 'var(--text-dark)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                type="button"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        background: '#FAF9F6',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          background: '#FFFFFF',
          border: '3px solid #FFE0B2',
          borderRadius: '24px',
          padding: '40px 32px',
          maxWidth: '450px',
          width: '100%',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <RefreshCw className={styles.pulse} size={48} color="#FF7A00" style={{ animation: 'spin 2s linear infinite' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#FF7A00', margin: 0 }}>
            Loading Your Lesson...
          </h2>
          <p style={{ fontSize: '14px', color: '#666666', fontWeight: 700, margin: 0 }}>
            Please wait while we retrieve your personalized literacy content.
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{
        background: '#FAF9F6',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          background: '#FFFFFF',
          border: '3px solid #FFE0B2',
          borderRadius: '24px',
          padding: '40px 32px',
          maxWidth: '450px',
          width: '100%',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <AlertCircle size={48} color="#FF4757" />
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#FF4757', margin: 0 }}>
            Lesson Not Found
          </h2>
          <p style={{ fontSize: '14px', color: '#666666', fontWeight: 700, margin: 0, lineHeight: 1.5 }}>
            {errorMsg}
          </p>
          <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '12px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                flex: 1,
                padding: '12px',
                background: '#FF7A00',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '14px',
                fontWeight: 900,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/home')}
              style={{
                flex: 1,
                padding: '12px',
                background: '#F1F5F9',
                color: '#475569',
                border: 'none',
                borderRadius: '14px',
                fontWeight: 900,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Adventure Map
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && (!slides || slides.length === 0)) {
    return (
      <div style={{
        background: '#FAF9F6',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          background: '#FFFFFF',
          border: '3px solid #FFE0B2',
          borderRadius: '24px',
          padding: '40px 32px',
          maxWidth: '450px',
          width: '100%',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <span style={{ fontSize: '48px' }}>📚</span>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#FF7A00', margin: 0 }}>
            No Slides Configured
          </h2>
          <p style={{ fontSize: '14px', color: '#666666', fontWeight: 700, margin: 0, lineHeight: 1.5 }}>
            This lesson does not have any learning activities configured yet.
          </p>
          <button
            onClick={() => navigate('/home')}
            style={{
              padding: '12px 32px',
              background: '#FF7A00',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              fontWeight: 900,
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '12px'
            }}
          >
            Adventure Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/home')}>
          <ArrowLeft size={24} />
          <span>Adventure Map</span>
        </button>

        <button className={styles.backBtn} onClick={() => setShowNotes(true)} style={{ marginLeft: '12px', border: '2px solid var(--color-peach)', color: 'var(--color-orange-dark)', background: '#FFFFFF' }}>
          <FileText size={20} />
          <span>Study Notes</span>
        </button>

        <div className={styles.progressTracker}>
          {isAlphabetLesson ? (
            (() => {
              const currentSlide = slides[slideIndex] || {};
              if (currentSlide.type === 'welcome' || currentSlide.type === 'graduation') {
                return null;
              }
              if (lesson?.difficulty === 'intermediate') {
                return (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {slides.slice(1, -1).map((_, idx) => {
                      const dotIndex = idx + 1;
                      const isActive = dotIndex === slideIndex;
                      const isPast = dotIndex < slideIndex;
                      return (
                        <div
                          key={idx}
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: isActive || isPast ? '#FF7A00' : '#E2E8F0',
                            transition: 'all 0.3s ease'
                          }}
                        />
                      );
                    })}
                  </div>
                );
              }
              if (currentSlide.type === 'learn_letter') {
                return (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {groupLetters.map((l, idx) => {
                      const isActive = currentSlide.letter === l;
                      const isPast = groupLetters.indexOf(l) < groupLetters.indexOf(currentSlide.letter);
                      const meta = LETTER_META[l] || {};
                      return (
                        <div
                          key={l}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: isActive || isPast ? (meta.color || '#4CAF50') : '#E2E8F0',
                            transition: 'all 0.3s ease'
                          }}
                        />
                      );
                    })}
                  </div>
                );
              }
              if (currentSlide.type === 'practice_audio' || currentSlide.type === 'practice_missing') {
                const practiceSlides = slides.filter(s => s.type === 'practice_audio' || s.type === 'practice_missing');
                const currentPracticeIndex = practiceSlides.findIndex(s => s === currentSlide);
                return (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {practiceSlides.map((_, idx) => {
                      const isActive = idx === currentPracticeIndex;
                      const isPast = idx < currentPracticeIndex;
                      return (
                        <div
                          key={idx}
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: isActive || isPast ? '#FF7A00' : '#E2E8F0',
                            transition: 'all 0.3s ease'
                          }}
                        />
                      );
                    })}
                  </div>
                );
              }
              return null;
            })()
          ) : (
            ['Explore', 'Practice', 'Game', 'Quiz', 'Rewards'].map((name, i) => (
              <div
                key={name}
                className={`${styles.stepIndicator} ${stage === i ? styles.stepActive : i < stage ? styles.stepDone : ''}`}
              >
                <span>{i + 1}</span>
              </div>
            ))
          )}
        </div>

        <div className={styles.lessonBadge}>
          <span>{(lesson.lesson_id && lesson.lesson_id.includes('-ASSESS-')) ? 'Milestone' : `Lesson ${lessonNumber}`}</span>
        </div>
      </header>

      <main 
        className={`${styles.studyArena} ${lesson.skill === 'writing' ? styles.studyArenaWriting : ''}`}
      >
        {lesson.skill === 'writing' && (
          <div className={styles.writingSidebar}>
            <div style={{ background: '#FF7A00', padding: '16px', borderRadius: '16px', color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>✏️</span>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 900, margin: 0 }}>WRITING LESSONS</h2>
                <span style={{ fontSize: '11px', fontWeight: 700, opacity: 0.9 }}>
                  {lesson.difficulty === 'beginner' ? 'Beginner Level' : lesson.difficulty === 'intermediate' ? 'Intermediate Level' : 'Advanced Level'}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(lesson.difficulty === 'beginner' ? BEGINNER_WRITING_TOPICS : lesson.difficulty === 'intermediate' ? INTERMEDIATE_WRITING_TOPICS : ADVANCED_WRITING_TOPICS).map((topic, tIdx) => {
                const isActive = (tIdx + 1) === lesson.order_in_level;
                const langTrans = WRITING_TRANSLATIONS[preferredLanguage] || {};
                const localizedTitle = langTrans[topic.title] || topic.title;
                const localizedDesc = langTrans[topic.desc] || topic.desc;

                return (
                  <button
                    key={tIdx}
                    onClick={() => {
                      const targetEntry = learningPath.find(entry => 
                        entry.lesson_detail?.skill === 'writing' && 
                        entry.lesson_detail?.order_in_level === (tIdx + 1)
                      );
                      if (targetEntry) {
                        const targetId = targetEntry.lesson_detail?.lesson_id || targetEntry.lesson_id;
                        setSlideIndex(0);
                        setStage(0);
                        navigate(`/lesson-player?id=${targetId}`, {
                          state: { entry: targetEntry, path: learningPath }
                        });
                      } else {
                        speak(t('completeCurrentLessons'), knownSpeechLang, audioSpeed);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: isActive ? '2px solid var(--color-orange)' : '1.5px solid var(--color-peach-light)',
                      background: isActive ? 'var(--color-cream-bg)' : 'var(--bg-cream-card)',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left'
                    }}
                    type="button"
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: isActive ? 'var(--color-orange)' : '#E2E8F0',
                        color: isActive ? '#FFFFFF' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '11px',
                        flexShrink: 0
                      }}
                    >
                      {tIdx + 1}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dark)' }}>
                        {localizedTitle}
                      </span>
                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                        {localizedDesc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', flex: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
          
          {isAlphabetLesson && !showQuiz && !lessonCompleted ? (
            (() => {
              const currentSlide = slides[slideIndex] || {};
              
              if (lesson.skill === 'writing' && (currentSlide.type === 'letter_drafting' || currentSlide.type === 'paragraph_writing')) {
                return renderGuidedWritingSystem(currentSlide);
              }

              if (currentSlide.type === 'welcome') {
                return (
                  <motion.div
                    key="welcome"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div style={{ marginTop: '20px' }} />
                    <span className={styles.storyboardBadge}>Lesson {lessonNumber}</span>
                    <h1 className={styles.storyboardTitle}>{currentSlide.title}</h1>
                    
                    <div style={{ margin: '30px auto 20px' }}>
                      <IllustrationSVG name="owl" size={100} />
                    </div>

                    <p className={styles.storyboardSubtitle}>{currentSlide.subtitle}</p>

                    <div className={styles.objectivesList}>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, textAlign: 'left', marginBottom: '12px' }}>
                        By the end of this lesson, you will be able to:
                      </h3>
                      {currentSlide.objectives?.map((obj, oIdx) => (
                        <div key={oIdx} className={styles.objectiveItem}>
                          <span className={styles.objectiveCheck}>✓</span>
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      className={styles.finishLessonBtn}
                      onClick={() => setSlideIndex(1)}
                      type="button"
                      style={{ marginTop: '28px', backgroundColor: '#FF7A00', boxShadow: '0 6px 20px rgba(255, 122, 0, 0.25)' }}
                    >
                      <span>Start Learning ➔</span>
                    </button>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'definition') {
                return (
                  <motion.div
                    key="definition"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div style={{ marginTop: '20px' }} />
                    <h1 className={styles.storyboardTitle} style={{ fontSize: '26px' }}>{currentSlide.title}</h1>
                    <p className={styles.storyboardSubtitle} style={{ margin: '16px auto 24px', maxWidth: '480px', lineHeight: 1.5 }}>
                      {currentSlide.subtitle}
                    </p>

                    <div
                      style={{
                        background: 'var(--bg-cream)',
                        border: '3px solid var(--color-peach-light)',
                        borderRadius: '16px',
                        padding: '24px 16px',
                        maxWidth: '440px',
                        margin: '20px auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Example:
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <IllustrationSVG name={currentSlide.left_emoji || 'default'} size={48} />
                          <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-dark)' }}>{currentSlide.left}</span>
                        </div>
                        <span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--color-orange)' }}>+</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <IllustrationSVG name={currentSlide.right_emoji || 'default'} size={48} />
                          <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-dark)' }}>{currentSlide.right}</span>
                        </div>
                        <span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--color-orange)' }}>=</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <IllustrationSVG name={currentSlide.result_emoji || 'default'} size={56} />
                          <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--color-orange-dark)' }}>{currentSlide.result}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.bottomNavRow} style={{ justifyContent: 'center' }}>
                      <button
                        className={styles.finishLessonBtn}
                        onClick={() => setSlideIndex(prev => prev + 1)}
                        type="button"
                        style={{ width: 'auto', padding: '12px 48px', fontSize: '16px', backgroundColor: '#FF7A00', boxShadow: '0 6px 20px rgba(255, 122, 0, 0.25)' }}
                      >
                        {t('nextBtn')}
                      </button>
                    </div>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'examples') {
                return (
                  <motion.div
                    key="examples"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ maxWidth: '580px' }}
                  >
                    <h1 className={styles.storyboardTitle} style={{ fontSize: '26px', marginTop: '10px' }}>{currentSlide.title}</h1>
                    
                    {(() => {
                      const isOpposites = (lesson.title || '').toLowerCase().includes('opposite') || (currentSlide.title || '').toLowerCase().includes('example') || (lesson.concept_intro || '').toLowerCase().includes('opposite');
                      const isCompounds = (lesson.title || '').toLowerCase().includes('compound') || (lesson.concept_intro || '').toLowerCase().includes('compound');
                      const isSimilars = (lesson.title || '').toLowerCase().includes('similar') || (lesson.concept_intro || '').toLowerCase().includes('similar');

                      if (isOpposites) {
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '440px', margin: '20px auto' }}>
                            {currentSlide.examples?.map((ex, eIdx) => (
                              <div key={eIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                                <div
                                  style={{
                                    flex: 1,
                                    background: 'var(--bg-cream)',
                                    border: '2px solid var(--color-peach-light)',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 2px 8px rgba(255, 122, 0, 0.03)'
                                  }}
                                >
                                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)' }}>{ex.left}</span>
                                  <IllustrationSVG name={ex.left_emoji || 'default'} size={24} />
                                </div>
                                <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-orange)' }}>↔️</span>
                                <div
                                  style={{
                                    flex: 1,
                                    background: 'var(--bg-cream)',
                                    border: '2px solid var(--color-peach-light)',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 2px 8px rgba(255, 122, 0, 0.03)'
                                  }}
                                >
                                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)' }}>{ex.right}</span>
                                  <IllustrationSVG name={ex.right_emoji || 'default'} size={24} />
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      if (isCompounds) {
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '480px', margin: '20px auto' }}>
                            {currentSlide.examples?.map((ex, eIdx) => (
                              <div
                                key={eIdx}
                                style={{
                                  background: 'var(--bg-cream)',
                                  border: '2px solid var(--color-peach-light)',
                                  borderRadius: '12px',
                                  padding: '12px 16px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '12px',
                                  boxShadow: '0 2px 8px rgba(255, 122, 0, 0.03)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '30%', justifyContent: 'flex-start' }}>
                                  <IllustrationSVG name={ex.left_emoji || 'default'} size={24} />
                                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-dark)' }}>{ex.left}</span>
                                </div>
                                <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--color-orange)' }}>+</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '30%', justifyContent: 'center' }}>
                                  <IllustrationSVG name={ex.right_emoji || 'default'} size={24} />
                                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-dark)' }}>{ex.right}</span>
                                </div>
                                <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--color-orange)' }}>=</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '30%', justifyContent: 'flex-end' }}>
                                  <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--color-orange-dark)' }}>{ex.result}</span>
                                  <IllustrationSVG name={ex.result_emoji || 'default'} size={28} />
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      if (isSimilars) {
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '440px', margin: '20px auto' }}>
                            {currentSlide.examples?.map((ex, eIdx) => (
                              <div key={eIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                                <div
                                  style={{
                                    flex: 1,
                                    background: 'var(--bg-cream)',
                                    border: '2px solid var(--color-peach-light)',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 2px 8px rgba(255, 122, 0, 0.03)'
                                  }}
                                >
                                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)' }}>{ex.left}</span>
                                  <IllustrationSVG name={ex.left_emoji || 'default'} size={24} />
                                </div>
                                <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-orange)' }}>＝</span>
                                <div
                                  style={{
                                    flex: 1,
                                    background: 'var(--bg-cream)',
                                    border: '2px solid var(--color-peach-light)',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 2px 8px rgba(255, 122, 0, 0.03)'
                                  }}
                                >
                                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)' }}>{ex.right}</span>
                                  <IllustrationSVG name={ex.right_emoji || 'default'} size={24} />
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      return (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '16px',
                            width: '100%',
                            maxWidth: '440px',
                            margin: '20px auto'
                          }}
                        >
                          {currentSlide.examples?.map((ex, eIdx) => (
                            <div
                              key={eIdx}
                              style={{
                                background: 'var(--bg-cream)',
                                border: '2px solid var(--color-peach-light)',
                                borderRadius: '12px',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 2px 8px rgba(255, 122, 0, 0.03)'
                              }}
                            >
                              <IllustrationSVG name={ex.left_emoji || 'default'} size={40} />
                              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)' }}>{ex.left}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    <div className={styles.bottomNavRow}>
                      <button
                        className={styles.mutedNavBtn}
                        onClick={() => setSlideIndex(prev => prev - 1)}
                        type="button"
                      >
                        {t('backBtn')}
                      </button>
                      <button
                        className={styles.finishLessonBtn}
                        onClick={() => setSlideIndex(prev => prev + 1)}
                        type="button"
                        style={{ width: 'auto', padding: '12px 32px', backgroundColor: '#FF7A00', boxShadow: '0 6px 20px rgba(255, 122, 0, 0.25)' }}
                      >
                        {t('nextBtn')}
                      </button>
                    </div>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'listen') {
                return (
                  <motion.div
                    key="listen"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <h1 className={styles.storyboardTitle} style={{ fontSize: '26px' }}>{currentSlide.title}</h1>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', margin: '32px 0 20px 0' }}>
                      <button
                        className={styles.bigPinkSpeakerBtn}
                        onClick={() => speak(currentSlide.target, speechLang, audioSpeed)}
                        type="button"
                        style={{ backgroundColor: '#FF7A00', boxShadow: '0 8px 20px rgba(255, 122, 0, 0.3)', margin: 0 }}
                      >
                        <Volume2 size={48} />
                      </button>

                      <div
                        style={{
                          border: '2px solid var(--color-peach-light)',
                          borderRadius: '16px',
                          padding: '12px 18px',
                          background: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <IllustrationSVG name="owl" size={32} />
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)', display: 'block' }}>
                            {currentSlide.hint}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tap the speaker!</span>
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '24px' }}>
                      Click the speaker icon to listen to the word pronunciation.
                    </p>

                    <div className={styles.bottomNavRow}>
                      <button
                        className={styles.mutedNavBtn}
                        onClick={() => setSlideIndex(prev => prev - 1)}
                        type="button"
                      >
                        {t('backBtn')}
                      </button>
                      <button
                        className={styles.finishLessonBtn}
                        onClick={() => setSlideIndex(prev => prev + 1)}
                        type="button"
                        style={{ width: 'auto', padding: '12px 36px', fontSize: '16px', backgroundColor: '#FF7A00', boxShadow: '0 6px 20px rgba(255, 122, 0, 0.25)' }}
                      >
                        {t('nextBtn')}
                      </button>
                    </div>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'learn_letter') {
                const meta = currentSlide.meta;
                const targetText = meta.word;
                const pronoun = meta.phonetic;

                return (
                  <motion.div
                    key={`learn_${currentSlide.letter}`}
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <span className={styles.letterLabelBadge} style={{ backgroundColor: meta.badgeBg, color: meta.color }}>
                      Letter
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', margin: '20px 0' }}>
                      <span className={styles.storyboardGiantLetter} style={{ color: meta.color }}>{currentSlide.letter}</span>
                      <button
                        className={styles.audioLabelPlayBtn}
                        onClick={() => speak(currentSlide.letter, speechLang, audioSpeed)}
                        type="button"
                        style={{ backgroundColor: meta.color }}
                      >
                        <Volume2 size={24} color="#FFFFFF" />
                      </button>
                    </div>

                    <p className={styles.pronunciationLabel}>
                      Pronunciation: "{pronoun}"
                    </p>

                    <div className={styles.exampleIllustrationCard}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', textAlign: 'left', marginBottom: '8px' }}>
                        Example:
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <IllustrationSVG name={meta.illustration} size={64} />
                        <span style={{ fontSize: '24px', fontWeight: 800, color: '#2C3E50' }}>{targetText}</span>
                      </div>
                    </div>

                    <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '20px' }}>
                      Tap the speaker to hear {currentSlide.letter}.
                    </p>

                    <div className={styles.bottomNavRow}>
                      <button
                        className={styles.mutedNavBtn}
                        onClick={() => setSlideIndex(prev => prev - 1)}
                        type="button"
                      >
                        {t('backBtn')}
                      </button>
                      
                      <button
                        className={styles.finishLessonBtn}
                        onClick={() => setSlideIndex(prev => prev + 1)}
                        type="button"
                        style={{ width: 'auto', padding: '12px 36px', fontSize: '16px', backgroundColor: '#FF7A00', boxShadow: '0 6px 20px rgba(255, 122, 0, 0.25)' }}
                      >
                        {slideIndex === groupLetters.length ? 'Start Practice ➔' : t('nextBtn')}
                      </button>
                    </div>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'practice_audio') {
                const isSelected = alphabetAnswer !== null;
                const isCorrect = alphabetAnswer === currentSlide.target;
                
                const getAITip = () => {
                  const target = currentSlide.target;
                  const meta = LETTER_META[target] || {};
                  return `💡 AI Tip: This letter sounds like "${meta.phonetic || target}" as in "${meta.word || 'word'}". Tap the speaker above to listen closely!`;
                };

                return (
                  <motion.div
                    key={`practice_audio_${slideIndex}`}
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <span className={styles.questionIndexLabel}>
                      Question {currentSlide.questionNumber} of {groupLetters.length * 2}
                    </span>

                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dark)', marginTop: '12px' }}>
                      {currentSlide.questionText}
                    </h2>

                    <button
                      className={styles.bigPinkSpeakerBtn}
                      onClick={() => speak(currentSlide.target, speechLang, audioSpeed)}
                      type="button"
                      style={{ backgroundColor: '#FF7A00', boxShadow: '0 8px 20px rgba(255, 122, 0, 0.3)' }}
                    >
                      <Volume2 size={48} />
                    </button>

                    <div className={styles.alphabetQuizOptionsRow}>
                      {currentSlide.options?.map((opt, oIdx) => {
                        const isOptionSelected = alphabetAnswer === opt;
                        const isOptionCorrect = opt === currentSlide.target;
                        const emoji = currentSlide.emojis?.[oIdx];
                        return (
                          <button
                            key={opt}
                            className={`${styles.storyboardGridOptionBtn} ${
                              isOptionSelected ? (isOptionCorrect ? styles.correctOption : styles.incorrectOption) : ''
                            }`}
                            onClick={() => {
                              if (alphabetAnswerCorrect) return;
                              setAlphabetAnswer(opt);
                              if (isOptionCorrect) {
                                setAlphabetAnswerCorrect(true);
                                speak(t('correctFeedback'), knownSpeechLang, audioSpeed);
                              } else {
                                setAlphabetAnswerCorrect(false);
                                speak(t('incorrectFeedback'), knownSpeechLang, audioSpeed);
                              }
                            }}
                            type="button"
                            style={emoji ? {
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '12px 6px',
                              minWidth: '110px'
                            } : {}}
                          >
                            {emoji && (
                              <div style={{ transform: 'scale(0.9)', marginBottom: '4px' }}>
                                <IllustrationSVG name={emoji} size={40} />
                              </div>
                            )}
                            <span style={{ fontSize: '15px', fontWeight: 800 }}>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback Alert Toast */}
                    {isSelected && (
                      <div className={`${styles.feedbackAlertCard} ${isCorrect ? styles.feedbackCorrectAlert : styles.feedbackIncorrectAlert}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <IllustrationSVG name="owl" size={32} />
                          <div>
                            <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>
                              {isCorrect ? 'Brilliant!' : 'Try again.'}
                            </h4>
                            <p style={{ fontSize: '13px', margin: '2px 0 0 0', color: isCorrect ? '#107C41' : '#E74C3C', fontWeight: 700 }}>
                              {isCorrect ? "That's correct." : getAITip()}
                            </p>
                          </div>
                        </div>
                        
                        {isCorrect && (
                          <button
                            className={styles.finishLessonBtn}
                            onClick={() => {
                              setAlphabetAnswer(null);
                              setAlphabetAnswerCorrect(false);
                              setSlideIndex(prev => prev + 1);
                            }}
                            type="button"
                            style={{ width: 'auto', padding: '10px 24px', fontSize: '14px', backgroundColor: '#FF7A00', boxShadow: '0 4px 12px rgba(255, 122, 0, 0.2)' }}
                          >
                            {t('nextBtn')}
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              }

              if (currentSlide.type === 'practice_missing') {
                const isSelected = alphabetAnswer !== null;
                const isCorrect = alphabetAnswer === currentSlide.target;

                const getAITip = () => {
                  const target = currentSlide.target;
                  if (currentSlide.equation) {
                    return `💡 AI Tip: Look closely at the parts of the equation to find the matching word "${target}".`;
                  }
                  return `💡 AI Tip: Say the alphabetical order out loud. The missing letter comes right after the previous letter. The sound is "${target}"!`;
                };
                
                return (
                  <motion.div
                    key={`practice_missing_${slideIndex}`}
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <span className={styles.questionIndexLabel}>
                      Question {currentSlide.questionNumber} of {lesson?.difficulty === 'intermediate' ? 4 : (groupLetters.length * 2)}
                    </span>

                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dark)', marginTop: '12px' }}>
                      {currentSlide.questionText}
                    </h2>

                    <div className={styles.missingLetterPromptCard}>
                      <span>{currentSlide.equation || currentSlide.displaySequence}</span>
                    </div>

                    <div className={styles.alphabetQuizOptionsRow}>
                      {currentSlide.options?.map((opt) => {
                        const isOptionSelected = alphabetAnswer === opt;
                        const isOptionCorrect = opt === currentSlide.target;
                        return (
                          <button
                            key={opt}
                            className={`${styles.storyboardGridOptionBtn} ${
                              isOptionSelected ? (isOptionCorrect ? styles.correctOption : styles.incorrectOption) : ''
                            }`}
                            onClick={() => {
                              if (alphabetAnswerCorrect) return;
                              setAlphabetAnswer(opt);
                              if (isOptionCorrect) {
                                setAlphabetAnswerCorrect(true);
                                speak(t('correctFeedback'), knownSpeechLang, audioSpeed);
                              } else {
                                setAlphabetAnswerCorrect(false);
                                speak(t('incorrectFeedback'), knownSpeechLang, audioSpeed);
                              }
                            }}
                            type="button"
                          >
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback Alert Toast */}
                    {isSelected && (
                      <div className={`${styles.feedbackAlertCard} ${isCorrect ? styles.feedbackCorrectAlert : styles.feedbackIncorrectAlert}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <IllustrationSVG name="owl" size={32} />
                          <div>
                            <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>
                              {isCorrect ? 'Brilliant!' : 'Try again.'}
                            </h4>
                            <p style={{ fontSize: '13px', margin: '2px 0 0 0', color: isCorrect ? '#107C41' : '#E74C3C', fontWeight: 700 }}>
                              {isCorrect ? "That's correct." : getAITip()}
                            </p>
                          </div>
                        </div>
                        
                        {isCorrect && (
                          <button
                            className={styles.finishLessonBtn}
                            onClick={() => {
                              setAlphabetAnswer(null);
                              setAlphabetAnswerCorrect(false);
                              setSlideIndex(prev => prev + 1);
                            }}
                            type="button"
                            style={{ width: 'auto', padding: '10px 24px', fontSize: '14px', backgroundColor: '#FF7A00', boxShadow: '0 4px 12px rgba(255, 122, 0, 0.2)' }}
                          >
                            {t('nextBtn')}
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              }

              if (currentSlide.type === 'storyboard_story') {
                const tabs = Object.keys(currentSlide.tabs || {});
                const defaultTab = tabs[0] || '';
                const currentTabKey = activeStoryTab || defaultTab;
                const tabData = currentSlide.tabs?.[currentTabKey] || {};
                
                const allCorrect = tabs.every(tKey => {
                  const userAns = storyAnswers[tKey];
                  const correctIdx = currentSlide.tabs[tKey]?.correct_index;
                  const correctVal = currentSlide.tabs[tKey]?.options[correctIdx];
                  return userAns === correctVal;
                });

                return (
                  <motion.div
                    key="storyboard_story"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ maxWidth: '980px', width: '100%', padding: '24px' }}
                  >
                    <span className={styles.storyboardBadge}>{currentSlide.title}</span>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)', marginTop: '6px', marginBottom: '4px' }}>
                      {currentSlide.subtitle}
                    </h2>

                    <div style={{ display: 'flex', gap: '24px', marginTop: '20px', alignItems: 'stretch' }}>
                      <div
                        style={{
                          flex: 1.1,
                          background: '#FFFDF9',
                          borderRadius: '20px',
                          border: '2px solid var(--color-peach-light)',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          textAlign: 'left'
                        }}
                      >
                        <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--color-orange-dark)', margin: 0 }}>
                          {currentSlide.story_title}
                        </h3>
                        <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-dark)', margin: 0 }}>
                          {currentSlide.story_body}
                        </p>
                        
                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
                          <IllustrationSVG name="farmer" size={120} />
                        </div>
                      </div>

                      <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '6px', background: '#F8FAFC', padding: '6px', borderRadius: '14px', overflowX: 'auto' }}>
                          {tabs.map(tKey => {
                            const isTabActive = tKey === currentTabKey;
                            const isTabCorrect = storyAnswers[tKey] === currentSlide.tabs[tKey]?.options[currentSlide.tabs[tKey]?.correct_index];
                            return (
                              <button
                                key={tKey}
                                onClick={() => setActiveStoryTab(tKey)}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '10px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  border: 'none',
                                  cursor: 'pointer',
                                  background: isTabActive ? 'var(--color-orange)' : '#FFFFFF',
                                  color: isTabActive ? '#FFFFFF' : (isTabCorrect ? '#107C41' : '#64748B'),
                                  whiteSpace: 'nowrap',
                                  boxShadow: isTabActive ? '0 2px 8px rgba(255, 122, 0, 0.15)' : 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                type="button"
                              >
                                <span>{tKey}</span>
                                {isTabCorrect && <span>✓</span>}
                              </button>
                            );
                          })}
                        </div>

                        <div
                          style={{
                            background: '#FFFFFF',
                            border: '1.5px solid var(--color-peach-light)',
                            borderRadius: '20px',
                            padding: '20px',
                            textAlign: 'left',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <span style={{ fontSize: '11px', color: 'var(--color-orange)', fontWeight: 800 }}>
                            {currentTabKey.toUpperCase()}
                          </span>
                          <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-dark)', margin: '6px 0 16px 0', lineHeight: 1.4 }}>
                            {tabData.question}
                          </h4>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                            {tabData.options?.map((opt, oIdx) => {
                              const isSelected = storyAnswers[currentTabKey] === opt;
                              const isCorrect = oIdx === tabData.correct_index;
                              return (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    setStoryAnswers({ ...storyAnswers, [currentTabKey]: opt });
                                    if (isCorrect) {
                                      speak(t('correctFeedback'), knownSpeechLang, audioSpeed);
                                    } else {
                                      speak(t('tryAgainFeedback'), knownSpeechLang, audioSpeed);
                                    }
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: '12px',
                                    border: isSelected ? (isCorrect ? '2px solid #4CAF50' : '2px solid #E74C3C') : '1px solid #E2E8F0',
                                    background: isSelected ? (isCorrect ? '#E8F5E9' : '#FDF2F2') : '#FFFFFF',
                                    color: isSelected ? (isCorrect ? '#1B5E20' : '#C62828') : 'var(--text-dark)',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}
                                  type="button"
                                >
                                  <span>{opt}</span>
                                  {isSelected && (isCorrect ? <span>✓</span> : <span>✗</span>)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                      <button
                        className={styles.mutedNavBtn}
                        onClick={() => setSlideIndex(prev => prev - 1)}
                        type="button"
                      >
                        {t('backBtn')}
                      </button>

                      {allCorrect ? (
                        <button
                          className={styles.finishLessonBtn}
                          onClick={() => {
                            setStoryAnswers({});
                            setActiveStoryTab('');
                            setSlideIndex(prev => prev + 1);
                          }}
                          style={{ width: 'auto', padding: '12px 36px', backgroundColor: '#4CAF50', boxShadow: '0 6px 20px rgba(76, 175, 80, 0.2)' }}
                          type="button"
                        >
                          {t('nextBtn')}
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800 }}>
                          💡 Answer all 4 tabs to continue!
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'conversation_chat') {
                const activeMsgs = chatMessages.length > 0 ? chatMessages : (currentSlide.messages || []);
                const userReplied = chatSelectedOption !== null;

                return (
                  <motion.div
                    key="conversation_chat"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ maxWidth: '640px', width: '100%', padding: '24px' }}
                  >
                    <span className={styles.storyboardBadge}>{currentSlide.title}</span>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)', marginTop: '6px' }}>
                      {currentSlide.subtitle}
                    </h2>

                    <div
                      style={{
                        background: '#F1F5F9',
                        borderRadius: '24px',
                        border: '2px solid #E2E8F0',
                        height: '320px',
                        overflowY: 'auto',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        margin: '20px 0',
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.03)'
                      }}
                    >
                      {activeMsgs.map((msg, mIdx) => {
                        const isThem = msg.sender === 'them';
                        return (
                          <div
                            key={mIdx}
                            style={{
                              display: 'flex',
                              alignSelf: isThem ? 'flex-start' : 'flex-end',
                              gap: '8px',
                              alignItems: 'flex-start',
                              maxWidth: '80%'
                            }}
                          >
                            {isThem && (
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                                🧑
                              </div>
                            )}
                            <div
                              style={{
                                background: isThem ? '#FFFFFF' : 'var(--color-orange)',
                                color: isThem ? 'var(--text-dark)' : '#FFFFFF',
                                padding: '10px 14px',
                                borderRadius: isThem ? '0 16px 16px 16px' : '16px 0 16px 16px',
                                fontSize: '13px',
                                fontWeight: 700,
                                textAlign: 'left',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                              }}
                            >
                              {msg.text}
                            </div>
                            {!isThem && (
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-peach-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                                🙋
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!userReplied ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textAlign: 'left' }}>
                          SELECT YOUR REPLY:
                        </span>
                        {currentSlide.options?.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setChatSelectedOption(opt);
                              setChatMessages([...activeMsgs, { sender: 'you', text: opt }]);
                              speak(t('excellentFeedback'), knownSpeechLang, audioSpeed);
                            }}
                            style={{
                              padding: '12px 16px',
                              borderRadius: '16px',
                              border: '1.5px solid var(--color-peach-light)',
                              background: '#FFFFFF',
                              color: 'var(--text-dark)',
                              fontWeight: 800,
                              fontSize: '13px',
                              textAlign: 'left',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                              width: '100%'
                            }}
                            type="button"
                          >
                            💬 {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          background: '#E8F5E9',
                          borderRadius: '16px',
                          padding: '12px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          border: '2px solid #4CAF50'
                        }}
                      >
                        <span style={{ fontSize: '24px' }}>🏆</span>
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#1B5E20', display: 'block' }}>
                            Conversation Practice Complete!
                          </span>
                          <span style={{ fontSize: '11px', color: '#1B5E20', opacity: 0.8 }}>
                            You expressed yourself perfectly in this dialogue!
                          </span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                      <button
                        className={styles.mutedNavBtn}
                        onClick={() => {
                          setChatMessages([]);
                          setChatSelectedOption(null);
                          setSlideIndex(prev => prev - 1);
                        }}
                        type="button"
                      >
                        {t('backBtn')}
                      </button>

                      {userReplied && (
                        <button
                          className={styles.finishLessonBtn}
                          onClick={() => {
                            setChatMessages([]);
                            setChatSelectedOption(null);
                            setSlideIndex(prev => prev + 1);
                          }}
                          style={{ width: 'auto', padding: '12px 36px', backgroundColor: '#FF7A00' }}
                          type="button"
                        >
                          {t('nextBtn')}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'essay_planning') {
                return (
                  <motion.div
                    key="essay_planning"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ maxWidth: '820px', width: '100%', padding: '24px' }}
                  >
                    <span className={styles.storyboardBadge}>{currentSlide.title}</span>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)', marginTop: '6px' }}>
                      {currentSlide.subtitle}
                    </h2>

                    <div style={{ background: 'var(--color-cream-bg)', border: '2px solid var(--color-peach-light)', borderRadius: '16px', padding: '14px 20px', margin: '16px 0', textAlign: 'left' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-orange-dark)', fontWeight: 900 }}>ESSAY TOPIC</span>
                      <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-dark)', margin: '4px 0 0 0' }}>
                        {currentSlide.topic}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', textAlign: 'left' }}>
                      <div style={{ flex: 1, background: '#FFFFFF', border: '1.5px solid #F1F5F9', borderRadius: '16px', padding: '16px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                          Plan your essay:
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {currentSlide.plan?.map((step, sIdx) => (
                            <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: 800 }}>
                              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#FEEAD2', color: 'var(--color-orange-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                {sIdx + 1}
                              </span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ flex: 1, background: '#FFFFFF', border: '1.5px solid #F1F5F9', borderRadius: '16px', padding: '16px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                          Key Skills:
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {currentSlide.skills?.map((skill, sIdx) => (
                            <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: 700, color: '#1B5E20' }}>
                              <span>✔️</span>
                              <span>{skill}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <textarea
                        value={essayText}
                        onChange={(e) => setEssayText(e.target.value)}
                        disabled={essaySubmitted}
                        placeholder="Type your essay thoughts here..."
                        style={{
                          width: '100%',
                          height: '130px',
                          borderRadius: '16px',
                          border: '2px solid var(--color-peach-light)',
                          padding: '14px',
                          fontSize: '13px',
                          fontWeight: 700,
                          resize: 'none',
                          outline: 'none',
                          boxShadow: '0 4px 12px rgba(255, 122, 0, 0.02)'
                        }}
                      />
                      
                      {!essaySubmitted ? (
                        <button
                          onClick={() => {
                            if (essayText.trim().length < 20) {
                              speak(t('writeMoreEssay'), knownSpeechLang, audioSpeed);
                              return;
                            }
                            setEssaySubmitted(true);
                            speak(t('essaySubmitted'), knownSpeechLang, audioSpeed);
                          }}
                          style={{
                            padding: '10px 24px',
                            background: 'linear-gradient(135deg, var(--color-orange), var(--color-orange-dark))',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '13px',
                            alignSelf: 'flex-end',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(255, 122, 0, 0.2)'
                          }}
                          type="button"
                        >
                          Start Writing ➔
                        </button>
                      ) : (
                        <div
                          style={{
                            background: '#E8F5E9',
                            borderRadius: '16px',
                            padding: '12px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            border: '2px solid #4CAF50',
                            textAlign: 'left'
                          }}
                        >
                          <span style={{ fontSize: '20px' }}>📝</span>
                          <div>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#1B5E20', display: 'block' }}>
                              Essay submitted successfully!
                            </span>
                            <span style={{ fontSize: '11px', color: '#1B5E20', opacity: 0.8 }}>
                              Awesome essay structure! Next lesson unlocked.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                      <button
                        className={styles.mutedNavBtn}
                        onClick={() => {
                          setEssayText('');
                          setEssaySubmitted(false);
                          setSlideIndex(prev => prev - 1);
                        }}
                        type="button"
                      >
                        {t('backBtn')}
                      </button>

                      {essaySubmitted && (
                        <button
                          className={styles.finishLessonBtn}
                          onClick={() => {
                            setEssayText('');
                            setEssaySubmitted(false);
                            setSlideIndex(prev => prev + 1);
                          }}
                          style={{ width: 'auto', padding: '12px 36px', backgroundColor: '#FF7A00' }}
                          type="button"
                        >
                          {t('nextBtn')}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'learn_concept') {
                return (
                  <motion.div
                    key="learn_concept"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ maxWidth: '680px', width: '100%', padding: '24px' }}
                  >
                    <span className={styles.storyboardBadge}>{currentSlide.title}</span>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)', marginTop: '8px' }}>
                      {currentSlide.subtitle}
                    </h2>

                    <div
                      style={{
                        margin: '20px auto',
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'var(--color-cream-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '52px',
                        border: '3px solid var(--color-peach-light)'
                      }}
                    >
                      {currentSlide.visual || '💡'}
                    </div>

                    <div style={{ textAlign: 'left', background: 'var(--color-cream-bg)', border: '2px solid var(--color-peach-light)', borderRadius: '16px', padding: '16px 20px', margin: '20px 0' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '8px' }}>
                        {currentSlide.concept_title}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-dark)', lineHeight: '1.6', fontWeight: 700 }}>
                        {currentSlide.concept_text}
                      </p>
                    </div>

                    {currentSlide.example_text && (
                      <div style={{ textAlign: 'left', background: '#F0FDF4', border: '2px dashed #4CAF50', borderRadius: '16px', padding: '16px 20px', margin: '20px 0' }}>
                        <span style={{ fontSize: '11px', color: '#2E7D32', fontWeight: 950, textTransform: 'uppercase' }}>
                          {currentSlide.example_heading || 'Example/Template:'}
                        </span>
                        <p style={{ fontSize: '13px', color: '#2E7D32', lineHeight: '1.6', fontWeight: 850, marginTop: '4px', whiteSpace: 'pre-line' }}>
                          {currentSlide.example_text}
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', width: '100%' }}>
                      <button
                        className={styles.mutedNavBtn}
                        onClick={() => setSlideIndex(prev => prev - 1)}
                        type="button"
                      >
                        {t('backBtn')}
                      </button>

                      <button
                        className={styles.finishLessonBtn}
                        onClick={() => setSlideIndex(prev => prev + 1)}
                        style={{ width: 'auto', padding: '12px 36px', backgroundColor: '#FF7A00' }}
                        type="button"
                      >
                        {t('nextBtn')}
                      </button>
                    </div>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'letter_drafting') {
                const lang = preferredLanguage || 'en';
                const starters = MIGO_WRITING_STARTERS[lang] || MIGO_WRITING_STARTERS['en'];
                const letterData = starters.letter;

                const compileLetterBodyText = (updatedMap) => {
                  const parts = letterData.body.split(/(\[[^\]]+\])/);
                  let counter = 0;
                  const compiled = parts.map(part => {
                    if (part.startsWith('[') && part.endsWith(']')) {
                      const val = updatedMap[counter++];
                      return val !== undefined ? val : part;
                    }
                    return part;
                  }).join('');
                  setLetterBody(compiled);
                };

                return (
                  <motion.div
                    key="letter_drafting"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ maxWidth: '780px', width: '100%', padding: '24px' }}
                  >
                    <span className={styles.storyboardBadge}>{currentSlide.title}</span>
                    <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-dark)', marginTop: '6px' }}>
                      {currentSlide.subtitle}
                    </h2>

                    <div
                      style={{
                        background: '#FFFFFF',
                        border: '2px solid var(--color-peach-light)',
                        borderRadius: '24px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        margin: '20px 0',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1.5px solid #F1F5F9', paddingBottom: '10px' }}>
                        <span style={{ width: '70px', fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)' }}>To:</span>
                        <input
                          type="text"
                          value={letterTo}
                          onChange={(e) => setLetterTo(e.target.value)}
                          disabled={letterSubmitted}
                          style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: 'var(--text-dark)'
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1.5px solid #F1F5F9', paddingBottom: '10px' }}>
                        <span style={{ width: '70px', fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)' }}>Subject:</span>
                        <input
                          type="text"
                          value={letterSubject}
                          onChange={(e) => setLetterSubject(e.target.value)}
                          disabled={letterSubmitted}
                          style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: 'var(--text-dark)'
                          }}
                        />
                      </div>

                      {/* Interactive Guided Letter Body */}
                      <div style={{ background: '#FFFDF9', border: '1.5px solid #FFE0B2', borderRadius: '16px', padding: '16px 20px', marginTop: '10px', lineHeight: '1.8' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 900, color: 'var(--color-orange-dark)' }}>
                          📝 Interactive Guided Letter (Tap blanks to fill):
                        </h4>
                        <div>
                          {parseTemplateToReact(letterData.body, letterData.blanks, letterBlanks, activeLetterBlankIdx, setActiveLetterBlankIdx)}
                        </div>
                      </div>

                      {/* Suggestions box for letter blanks */}
                      {activeLetterBlankIdx !== null && (
                        <div style={{ background: '#FFF8F2', padding: '16px', borderRadius: '16px', border: '2px solid var(--color-peach-light)', marginTop: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: 900, color: 'var(--color-orange-dark)' }}>
                              💡 Fill in the blank (Hint: {(letterData.blanks[activeLetterBlankIdx] || {}).hint || 'Choose a word'}):
                            </span>
                            <button
                              onClick={() => setActiveLetterBlankIdx(null)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 800, cursor: 'pointer', fontSize: '12px' }}
                              type="button"
                            >
                              Close ✕
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                            {((letterData.blanks[activeLetterBlankIdx] || {}).suggestions || []).map((sug) => (
                              <button
                                key={sug}
                                onClick={() => {
                                  const updated = { ...letterBlanks, [activeLetterBlankIdx]: sug };
                                  setLetterBlanks(updated);
                                  compileLetterBodyText(updated);
                                  if (activeLetterBlankIdx < letterData.blanks.length - 1) {
                                    setActiveLetterBlankIdx(activeLetterBlankIdx + 1);
                                  } else {
                                    setActiveLetterBlankIdx(null);
                                  }
                                }}
                                style={{
                                  padding: '8px 16px',
                                  background: '#FFFFFF',
                                  border: '1.5px solid var(--color-peach)',
                                  borderRadius: '20px',
                                  fontSize: '13px',
                                  fontWeight: 850,
                                  color: 'var(--color-orange-dark)',
                                  cursor: 'pointer'
                                }}
                                type="button"
                              >
                                {sug}
                              </button>
                            ))}
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              placeholder="Or type custom word..."
                              value={customBlankInput}
                              onChange={(e) => setCustomBlankInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && customBlankInput.trim() !== '') {
                                  const updated = { ...letterBlanks, [activeLetterBlankIdx]: customBlankInput.trim() };
                                  setLetterBlanks(updated);
                                  compileLetterBodyText(updated);
                                  setCustomBlankInput('');
                                  if (activeLetterBlankIdx < letterData.blanks.length - 1) {
                                    setActiveLetterBlankIdx(activeLetterBlankIdx + 1);
                                  } else {
                                    setActiveLetterBlankIdx(null);
                                  }
                                }
                              }}
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1.5px solid var(--color-peach-light)',
                                fontSize: '13px',
                                fontWeight: 700,
                                outline: 'none'
                              }}
                            />
                            <button
                              onClick={() => {
                                if (customBlankInput.trim() !== '') {
                                  const updated = { ...letterBlanks, [activeLetterBlankIdx]: customBlankInput.trim() };
                                  setLetterBlanks(updated);
                                  compileLetterBodyText(updated);
                                  setCustomBlankInput('');
                                  if (activeLetterBlankIdx < letterData.blanks.length - 1) {
                                    setActiveLetterBlankIdx(activeLetterBlankIdx + 1);
                                  } else {
                                    setActiveLetterBlankIdx(null);
                                  }
                                }
                              }}
                              style={{
                                padding: '8px 16px',
                                background: 'var(--color-orange)',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 800,
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                              type="button"
                            >
                              Insert
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Customize Textarea */}
                      <div style={{ textAlign: 'left', marginTop: '10px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 900, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                          ✍️ Customize / Add more details to the body:
                        </span>
                        <textarea
                          value={letterBody}
                          onChange={(e) => setLetterBody(e.target.value)}
                          disabled={letterSubmitted}
                          style={{
                            width: '100%',
                            height: '140px',
                            border: '1.5px solid var(--color-peach-light)',
                            borderRadius: '12px',
                            outline: 'none',
                            resize: 'none',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: 'var(--text-dark)',
                            lineHeight: '1.6',
                            padding: '12px'
                          }}
                        />
                      </div>
                    </div>

                    {!letterSubmitted ? (
                      <button
                        onClick={() => {
                          setLetterSubmitted(true);
                          speak(t('emailSent'), knownSpeechLang, audioSpeed);
                        }}
                        style={{
                          padding: '12px 32px',
                          background: 'linear-gradient(135deg, var(--color-orange), var(--color-orange-dark))',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '12px',
                          fontWeight: 800,
                          fontSize: '13px',
                          alignSelf: 'flex-end',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(255, 122, 0, 0.2)'
                        }}
                        type="button"
                      >
                        Send Email ✉️
                      </button>
                    ) : (
                      <div
                        style={{
                          background: '#E8F5E9',
                          borderRadius: '16px',
                          padding: '12px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          border: '2px solid #4CAF50',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>✉️</span>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#1B5E20', display: 'block' }}>
                            Email sent successfully!
                          </span>
                          <span style={{ fontSize: '11px', color: '#1B5E20', opacity: 0.8 }}>
                            You have drafted and delivered this mail template successfully.
                          </span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                      <button
                        className={styles.mutedNavBtn}
                        onClick={() => {
                          setLetterTo('');
                          setLetterSubject('');
                          setLetterBody('');
                          setLetterSubmitted(false);
                          setSlideIndex(prev => prev - 1);
                        }}
                        type="button"
                      >
                        {t('backBtn')}
                      </button>

                      {letterSubmitted && (
                        <button
                          className={styles.finishLessonBtn}
                          onClick={() => {
                            setLetterTo('');
                            setLetterSubject('');
                            setLetterBody('');
                            setLetterSubmitted(false);
                            setSlideIndex(prev => prev + 1);
                          }}
                          style={{ width: 'auto', padding: '12px 36px', backgroundColor: '#FF7A00' }}
                          type="button"
                        >
                          {t('nextBtn')}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'trace_letter') {
                return (
                  <motion.div
                    key="trace_letter"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <span className={styles.storyboardBadge}>{currentSlide.title}</span>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dark)', marginTop: '8px' }}>
                      {currentSlide.subtitle}
                    </h2>

                    <div style={{ margin: '24px 0' }}>
                      <TracingCanvas targetText={currentSlide.target} mode="letter" />
                    </div>

                    <div
                      style={{
                        border: '2px solid var(--color-peach-light)',
                        borderRadius: '16px',
                        padding: '12px 18px',
                        background: 'var(--color-cream-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        maxWidth: '380px',
                        margin: '0 auto 20px auto'
                      }}
                    >
                      <IllustrationSVG name="owl" size={32} />
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dark)' }}>
                          {currentSlide.arrows?.[0] || 'Start tracing!'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.bottomNavRow}>
                      <button className={styles.mutedNavBtn} onClick={() => setSlideIndex(prev => prev - 1)} type="button">
                        {t('backBtn')}
                      </button>
                      <button
                        className={styles.finishLessonBtn}
                        onClick={() => setSlideIndex(prev => prev + 1)}
                        type="button"
                        style={{ width: 'auto', padding: '12px 32px', backgroundColor: '#FF7A00', boxShadow: '0 6px 20px rgba(255, 122, 0, 0.25)' }}
                      >
                        {t('nextBtn')}
                      </button>
                    </div>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'write_word') {
                return (
                  <motion.div
                    key="write_word"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <span className={styles.storyboardBadge}>{currentSlide.title}</span>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-dark)', marginTop: '8px' }}>
                      {currentSlide.instruction}
                    </h2>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', margin: '24px 0' }}>
                      <IllustrationSVG name={currentSlide.image || 'default'} size={80} />
                      <TracingCanvas targetText={currentSlide.target} mode="word" />
                    </div>

                    <div className={styles.bottomNavRow}>
                      <button className={styles.mutedNavBtn} onClick={() => setSlideIndex(prev => prev - 1)} type="button">
                        {t('backBtn')}
                      </button>
                      <button
                        className={styles.finishLessonBtn}
                        onClick={() => setSlideIndex(prev => prev + 1)}
                        type="button"
                        style={{ width: 'auto', padding: '12px 32px', backgroundColor: '#FF7A00', boxShadow: '0 6px 20px rgba(255, 122, 0, 0.25)' }}
                      >
                        {t('nextBtn')}
                      </button>
                    </div>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'write_sentence') {
                const targetSentence = currentSlide.target || '';
                const sentenceWords = targetSentence.trim().split(/\s+/).filter(Boolean);
                const hasSelectedAll = jumbledSelectedIndices.length === sentenceWords.length;
                const isCorrectOrder = hasSelectedAll && jumbledSelectedIndices.every((val, idx) => val === idx);

                const handleSelectWord = (idx) => {
                  if (jumbledSelectedIndices.includes(idx)) return;
                  setJumbledSelectedIndices(prev => [...prev, idx]);
                  setJumbledPoolIndices(prev => prev.filter(pIdx => pIdx !== idx));
                };

                const handleRemoveWord = (idx) => {
                  setJumbledSelectedIndices(prev => prev.filter(sIdx => sIdx !== idx));
                  setJumbledPoolIndices(prev => {
                    const newPool = [...prev, idx];
                    // keep initial shuffled order
                    return jumbledInitialPool.filter(pIdx => newPool.includes(pIdx));
                  });
                };

                return (
                  <motion.div
                    key="write_sentence"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ maxWidth: '620px' }}
                  >
                    <span className={styles.storyboardBadge}>{currentSlide.title}</span>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-dark)', marginTop: '8px', marginBottom: '16px' }}>
                      {currentSlide.instruction || 'Arrange the words to form a correct sentence.'}
                    </h2>

                    {/* Target Sentence Display */}
                    <div style={{
                      background: 'var(--color-cream-bg)',
                      border: '2px solid var(--color-peach-light)',
                      borderRadius: '16px',
                      padding: '12px 20px',
                      fontSize: '22px',
                      fontWeight: 900,
                      color: 'var(--color-orange-dark)',
                      textAlign: 'center',
                      marginBottom: '20px'
                    }}>
                      {targetSentence}
                    </div>

                    {/* Answer Area (selected words order) */}
                    <div style={{
                      minHeight: '60px',
                      width: '100%',
                      background: '#F9F6F0',
                      border: '2px dashed #D5CBB9',
                      borderRadius: '16px',
                      padding: '12px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px'
                    }}>
                      {jumbledSelectedIndices.length === 0 ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>
                          {t('tapTokensPlaceholder')}
                        </span>
                      ) : (
                        jumbledSelectedIndices.map((wordIdx) => (
                          <motion.button
                            key={wordIdx}
                            onClick={() => handleRemoveWord(wordIdx)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '12px',
                              background: '#FFFFFF',
                              border: '2px solid var(--color-orange)',
                              color: 'var(--text-dark)',
                              fontWeight: 700,
                              fontSize: '16px',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                            }}
                          >
                            {sentenceWords[wordIdx]}
                          </motion.button>
                        ))
                      )}
                    </div>

                    {/* Pool Area (shuffled remaining words) */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      justifyContent: 'center',
                      marginBottom: '24px',
                      minHeight: '44px'
                    }}>
                      {jumbledPoolIndices.map((wordIdx) => (
                        <motion.button
                          key={wordIdx}
                          onClick={() => handleSelectWord(wordIdx)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '12px',
                            background: 'var(--color-cream-bg)',
                            border: '2px solid var(--color-peach-light)',
                            color: 'var(--text-dark)',
                            fontWeight: 700,
                            fontSize: '16px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                          }}
                        >
                          {sentenceWords[wordIdx]}
                        </motion.button>
                      ))}
                    </div>

                    {/* Feedback message showing if they are doing wrong */}
                    {hasSelectedAll && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          background: isCorrectOrder ? '#E8F8F0' : '#FCE8E6',
                          border: `2px solid ${isCorrectOrder ? '#27AE60' : '#EB5757'}`,
                          color: isCorrectOrder ? '#27AE60' : '#EB5757',
                          fontWeight: 800,
                          fontSize: '15px',
                          textAlign: 'center',
                          marginBottom: '20px'
                        }}
                      >
                        {isCorrectOrder ? (
                          <span>🎉 {t('sentenceCorrectFeedback')}</span>
                        ) : (
                          <span>❌ {t('sentenceIncorrectFeedback')}</span>
                        )}
                      </motion.div>
                    )}

                    <div className={styles.bottomNavRow}>
                      <button className={styles.mutedNavBtn} onClick={() => setSlideIndex(prev => prev - 1)} type="button">
                        {t('backBtn')}
                      </button>
                      <button
                        className={styles.finishLessonBtn}
                        onClick={() => {
                          if (hasSelectedAll && isCorrectOrder) {
                            setSlideIndex(prev => prev + 1);
                          }
                        }}
                        disabled={!isCorrectOrder}
                        type="button"
                        style={{
                          width: 'auto',
                          padding: '12px 32px',
                          backgroundColor: isCorrectOrder ? '#FF7A00' : '#CCCCCC',
                          cursor: isCorrectOrder ? 'pointer' : 'not-allowed',
                          boxShadow: isCorrectOrder ? '0 6px 20px rgba(255, 122, 0, 0.25)' : 'none'
                        }}
                      >
                        {t('nextBtn')}
                      </button>
                    </div>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'unscramble_words') {
                return (
                  <motion.div
                    key="unscramble_words"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ maxWidth: '780px' }}
                  >
                    <span className={styles.storyboardBadge}>{currentSlide.title}</span>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)', marginTop: '8px' }}>
                      {currentSlide.subtitle}
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '8px 0 16px' }}>
                      {currentSlide.instruction}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0', width: '100%' }}>
                      {currentSlide.items?.map((item) => {
                        const userLetters = unscrambleAnswers[item.id] || [];
                        const targetLen = item.target.length;
                        
                        return (
                          <div
                            key={item.id}
                            style={{
                              background: '#FFFFFF',
                              border: '2px solid var(--color-peach-light)',
                              borderRadius: '16px',
                              padding: '12px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              boxShadow: '0 4px 15px rgba(0,0,0,0.01)',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '150px', textAlign: 'left' }}>
                              <div
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: 'var(--color-orange)',
                                  color: '#FFFFFF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '12px'
                                }}
                              >
                                {item.id}
                              </div>
                              <IllustrationSVG name={item.image} size={24} />
                              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dark)' }}>{item.clue}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '6px', flex: 1, justifyContent: 'center' }}>
                              {Array.from({ length: targetLen }).map((_, bIdx) => {
                                const letter = userLetters[bIdx];
                                return (
                                  <button
                                    key={bIdx}
                                    onClick={() => handleAnswerLetterClick(item.id, bIdx)}
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '8px',
                                      border: letter ? '2px solid var(--color-orange)' : '2px dashed var(--color-peach)',
                                      background: letter ? 'var(--color-cream-bg)' : 'var(--bg-cream)',
                                      color: 'var(--color-orange-dark)',
                                      fontWeight: 900,
                                      fontSize: '14px',
                                      cursor: letter ? 'pointer' : 'default',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    type="button"
                                  >
                                    {letter || ''}
                                  </button>
                                );
                              })}
                            </div>

                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', width: '180px', justifyContent: 'flex-start' }}>
                              {item.tokens.map((token, tIdx) => {
                                const countInAns = userLetters.filter(l => l === token).length;
                                const countInTokensBefore = item.tokens.slice(0, tIdx).filter(l => l === token).length;
                                const isUsed = countInTokensBefore < countInAns;

                                return (
                                  <button
                                    key={tIdx}
                                    onClick={() => {
                                      if (isUsed || userLetters.length >= targetLen) return;
                                      handleTokenClick(item.id, token);
                                    }}
                                    disabled={isUsed || userLetters.length >= targetLen}
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '6px',
                                      border: '1px solid #E2E8F0',
                                      background: isUsed ? '#E2E8F0' : '#FFFFFF',
                                      color: isUsed ? '#94A3B8' : 'var(--text-dark)',
                                      fontWeight: 700,
                                      fontSize: '13px',
                                      cursor: isUsed ? 'default' : 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    type="button"
                                  >
                                    {token}
                                  </button>
                                );
                              })}
                            </div>

                            <button
                              onClick={() => speak(item.target, speechLang, audioSpeed)}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--color-cream-bg)',
                                border: '1.5px solid var(--color-peach-light)',
                                color: 'var(--color-orange)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              type="button"
                            >
                              🔊
                            </button>

                            <button
                              onClick={() => clearUnscrambleRow(item.id)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: '#FFF0F0',
                                border: 'none',
                                color: '#E74C3C',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                              type="button"
                            >
                              Clear
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '24px' }}>
                      <button
                        className={styles.mutedNavBtn}
                        onClick={() => setSlideIndex(prev => prev - 1)}
                        type="button"
                      >
                        {t('backBtn')}
                      </button>

                      {!unscrambleIsCorrect ? (
                        <button
                          className={styles.finishLessonBtn}
                          onClick={() => checkUnscrambleAnswers(currentSlide.items)}
                          type="button"
                          style={{ width: 'auto', padding: '12px 36px', backgroundColor: '#FF7A00', boxShadow: '0 6px 20px rgba(255, 122, 0, 0.25)' }}
                        >
                          Check Answers ✓
                        </button>
                      ) : (
                        <button
                          className={styles.finishLessonBtn}
                          onClick={() => setSlideIndex(prev => prev + 1)}
                          type="button"
                          style={{ width: 'auto', padding: '12px 36px', backgroundColor: '#4CAF50', boxShadow: '0 6px 20px rgba(76, 175, 80, 0.25)' }}
                        >
                          {t('nextBtn')}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'unscramble_sentence') {
                const checkSentence = () => {
                  const userStr = sentenceAnswer.join(' ').toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
                  const targetStr = currentSlide.target.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
                  if (userStr === targetStr) {
                    setSentenceCorrect(true);
                    speak(t('sentenceCorrectFeedback'), knownSpeechLang, audioSpeed);
                  } else {
                    setSentenceCorrect(false);
                    speak(t('sentenceIncorrectFeedback'), knownSpeechLang, audioSpeed);
                  }
                  setSentenceChecked(true);
                };

                return (
                  <motion.div
                    key="unscramble_sentence"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ maxWidth: '780px', width: '100%' }}
                  >
                    <span className={styles.storyboardBadge}>{currentSlide.title}</span>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)', marginTop: '8px' }}>
                      {currentSlide.subtitle}
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '8px 0 16px' }}>
                      {currentSlide.instruction}
                    </p>

                    {/* Word display slots */}
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', minHeight: '56px', border: '2.5px dashed var(--color-peach)', borderRadius: '16px', padding: '12px', background: '#FFFDFB', flexWrap: 'wrap', margin: '20px 0', alignItems: 'center' }}>
                      {sentenceAnswer.length === 0 && (
                        <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 800 }}>{t('tapTokensPlaceholder')}</span>
                      )}
                      {sentenceAnswer.map((word, wIdx) => (
                        <button
                          key={wIdx}
                          onClick={() => {
                            if (sentenceCorrect) return;
                            setSentenceAnswer(prev => prev.filter((_, idx) => idx !== wIdx));
                            setSentenceChecked(false);
                          }}
                          style={{
                            background: 'var(--color-orange)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontWeight: 800,
                            cursor: sentenceCorrect ? 'default' : 'pointer',
                            fontSize: '13px',
                            boxShadow: '0 4px 10px rgba(255, 122, 0, 0.15)'
                          }}
                          type="button"
                        >
                          {word}
                        </button>
                      ))}
                    </div>

                    {/* Scattered tokens */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', margin: '24px 0' }}>
                      {currentSlide.tokens.map((token, tIdx) => {
                        // Count occurrences in answer vs tokens to allow duplicates if the tokens list has duplicates
                        const countInAns = sentenceAnswer.filter(w => w === token).length;
                        const countInTokensBefore = currentSlide.tokens.slice(0, tIdx).filter(w => w === token).length;
                        const isUsed = countInTokensBefore < countInAns;

                        return (
                          <button
                            key={tIdx}
                            disabled={isUsed || sentenceCorrect}
                            onClick={() => {
                              setSentenceAnswer(prev => [...prev, token]);
                              setSentenceChecked(false);
                            }}
                            style={{
                              background: isUsed ? '#F1F5F9' : '#FFFFFF',
                              color: isUsed ? '#CBD5E1' : 'var(--text-dark)',
                              border: '2.5px solid var(--color-peach-light)',
                              borderRadius: '12px',
                              padding: '12px 20px',
                              fontWeight: 900,
                              fontSize: '14px',
                              cursor: (isUsed || sentenceCorrect) ? 'default' : 'pointer',
                              boxShadow: isUsed ? 'none' : '0 4px 10px rgba(0,0,0,0.02)',
                              transition: 'all 0.15s ease'
                            }}
                            type="button"
                          >
                            {token}
                          </button>
                        );
                      })}
                    </div>

                    {sentenceChecked && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', margin: '12px 0' }}>
                        <span style={{ fontSize: '20px' }}>{sentenceCorrect ? '✅' : '❌'}</span>
                        <span style={{ fontSize: '13px', fontWeight: 900, color: sentenceCorrect ? '#2E7D32' : '#C62828' }}>
                          {sentenceCorrect ? t('excellentFeedback') : t('sentenceIncorrectFeedback')}
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '24px' }}>
                      <button
                        className={styles.mutedNavBtn}
                        onClick={() => setSlideIndex(prev => prev - 1)}
                        type="button"
                      >
                        {t('backBtn')}
                      </button>

                      {!sentenceCorrect ? (
                        <button
                          className={styles.finishLessonBtn}
                          onClick={checkSentence}
                          type="button"
                          disabled={sentenceAnswer.length === 0}
                          style={{ width: 'auto', padding: '12px 36px', backgroundColor: '#FF7A00', boxShadow: '0 6px 20px rgba(255, 122, 0, 0.25)' }}
                        >
                          {t('checkSentenceBtn')}
                        </button>
                      ) : (
                        <button
                          className={styles.finishLessonBtn}
                          onClick={() => {
                            setSentenceAnswer([]);
                            setSentenceChecked(false);
                            setSentenceCorrect(false);
                            setSlideIndex(prev => prev + 1);
                          }}
                          type="button"
                          style={{ width: 'auto', padding: '12px 36px', backgroundColor: '#4CAF50', boxShadow: '0 6px 20px rgba(76, 175, 80, 0.25)' }}
                        >
                          {t('nextBtn')}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'paragraph_writing') {
                const lang = preferredLanguage || 'en';
                const starters = MIGO_WRITING_STARTERS[lang] || MIGO_WRITING_STARTERS['en'];
                const topicKey = getWritingStarterKey(currentSlide.topic);
                const data = starters[topicKey] || starters['default'];

                const compileText = (updatedMap) => {
                  const parts = data.template.split(/(\[[^\]]+\])/);
                  let counter = 0;
                  const compiled = parts.map(part => {
                    if (part.startsWith('[') && part.endsWith(']')) {
                      const val = updatedMap[counter++];
                      return val !== undefined ? val : part;
                    }
                    return part;
                  }).join('');
                  setParagraphText(compiled);
                };

                const hasCapitalization = paragraphText.trim() !== '' && paragraphText[0] === paragraphText[0].toUpperCase();
                const hasPunctuation = paragraphText.trim() !== '' && (paragraphText.endsWith('.') || paragraphText.endsWith('?') || paragraphText.endsWith('!') || paragraphText.endsWith('।'));
                const wordCount = paragraphText.trim() === '' ? 0 : paragraphText.trim().split(/\s+/).length;

                return (
                  <motion.div
                    key="paragraph_writing"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ maxWidth: '780px', width: '100%', padding: '24px' }}
                  >
                    <span className={styles.storyboardBadge}>{currentSlide.title}</span>
                    <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-dark)', marginTop: '8px' }}>
                      {currentSlide.subtitle}
                    </h2>
                    
                    <div style={{ background: 'var(--color-cream-bg)', border: '2px solid var(--color-peach-light)', borderRadius: '16px', padding: '16px 24px', margin: '16px 0', textAlign: 'left' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-orange-dark)', fontWeight: 900, textTransform: 'uppercase' }}>Writing Topic</span>
                      <h3 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-dark)', margin: '4px 0 0 0' }}>
                        {currentSlide.topic}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0', fontWeight: 700 }}>
                        {currentSlide.instruction}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      
                      {/* Step 1: Clickable Blanks Container */}
                      <div style={{ background: '#FFFDF9', border: '2px solid #FFE0B2', borderRadius: '16px', padding: '16px 20px', textAlign: 'left', lineHeight: '1.8' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 900, color: 'var(--color-orange-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>📝 Guided Structure: Tap blanks to fill</span>
                        </h4>
                        <div>
                          {parseTemplateToReact(data.template, data.blanks, filledBlanks, activeBlankIdx, setActiveBlankIdx)}
                        </div>
                      </div>

                      {/* Interactive Suggestions Sub-panel */}
                      {activeBlankIdx !== null && (
                        <div style={{ background: '#FFF8F2', padding: '16px', borderRadius: '16px', border: '2px solid var(--color-peach-light)', textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: 900, color: 'var(--color-orange-dark)' }}>
                              💡 Choose a word for this blank (Hint: {(data.blanks[activeBlankIdx] || {}).hint || 'Choose a word'}):
                            </span>
                            <button
                              onClick={() => setActiveBlankIdx(null)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 800, cursor: 'pointer', fontSize: '12px' }}
                              type="button"
                            >
                              Close ✕
                            </button>
                          </div>
                          
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                            {((data.blanks[activeBlankIdx] || {}).suggestions || []).map((sug) => (
                              <button
                                key={sug}
                                onClick={() => {
                                  const updated = { ...filledBlanks, [activeBlankIdx]: sug };
                                  setFilledBlanks(updated);
                                  compileText(updated);
                                  if (activeBlankIdx < data.blanks.length - 1) {
                                    setActiveBlankIdx(activeBlankIdx + 1);
                                  } else {
                                    setActiveBlankIdx(null);
                                  }
                                }}
                                style={{
                                  padding: '8px 16px',
                                  background: '#FFFFFF',
                                  border: '1.5px solid var(--color-peach)',
                                  borderRadius: '20px',
                                  fontSize: '13px',
                                  fontWeight: 850,
                                  color: 'var(--color-orange-dark)',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                                }}
                                type="button"
                              >
                                {sug}
                              </button>
                            ))}
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              placeholder="Or type custom word..."
                              value={customBlankInput}
                              onChange={(e) => setCustomBlankInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && customBlankInput.trim() !== '') {
                                  const updated = { ...filledBlanks, [activeBlankIdx]: customBlankInput.trim() };
                                  setFilledBlanks(updated);
                                  compileText(updated);
                                  setCustomBlankInput('');
                                  if (activeBlankIdx < data.blanks.length - 1) {
                                    setActiveBlankIdx(activeBlankIdx + 1);
                                  } else {
                                    setActiveBlankIdx(null);
                                  }
                                }
                              }}
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1.5px solid var(--color-peach-light)',
                                fontSize: '13px',
                                fontWeight: 700,
                                outline: 'none'
                              }}
                            />
                            <button
                              onClick={() => {
                                if (customBlankInput.trim() !== '') {
                                  const updated = { ...filledBlanks, [activeBlankIdx]: customBlankInput.trim() };
                                  setFilledBlanks(updated);
                                  compileText(updated);
                                  setCustomBlankInput('');
                                  if (activeBlankIdx < data.blanks.length - 1) {
                                    setActiveBlankIdx(activeBlankIdx + 1);
                                  } else {
                                    setActiveBlankIdx(null);
                                  }
                                }
                              }}
                              style={{
                                padding: '8px 16px',
                                background: 'var(--color-orange)',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 800,
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                              type="button"
                            >
                              Insert
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Customize Textarea */}
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 900, color: 'var(--text-muted)' }}>
                            ✍️ Edit & Expand:
                          </span>
                          <button
                            onClick={() => {
                              setSelectedTopic(currentSlide.topic);
                              setShowWizardModal(true);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-orange-dark)',
                              fontWeight: 900,
                              fontSize: '12.5px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            type="button"
                          >
                            ✨ Help Me Build
                          </button>
                        </div>
                        <textarea
                          value={paragraphText}
                          onChange={(e) => setParagraphText(e.target.value)}
                          disabled={paragraphSubmitted}
                          style={{
                            width: '100%',
                            height: '130px',
                            borderRadius: '16px',
                            border: '2px solid var(--color-peach-light)',
                            padding: '14px',
                            fontSize: '13.5px',
                            fontWeight: 700,
                            resize: 'none',
                            outline: 'none',
                            boxShadow: '0 4px 12px rgba(255, 122, 0, 0.02)',
                            lineHeight: '1.6'
                          }}
                        />
                      </div>

                      {/* Live feedback checklists */}
                      <div style={{ background: '#FFF8F2', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--color-peach-light)', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                        <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--color-orange-dark)' }}>💡 Live Writing Assistant:</span>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 850, color: 'var(--text-dark)' }}>
                          <span>{hasCapitalization ? '🟢' : '⚪'} Capitalized start</span>
                          <span>{hasPunctuation ? '🟢' : '⚪'} Ending punctuation</span>
                          <span>{wordCount >= 10 ? '🟢' : '⚪'} Length ({wordCount}/10 words)</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800 }}>
                          Word Count: <strong style={{ color: 'var(--color-orange-dark)' }}>{wordCount}</strong>
                        </span>
                        
                        {!paragraphSubmitted ? (
                          <button
                            onClick={() => {
                              if (wordCount < 10) {
                                speak(t('writeParagraphLimit'), knownSpeechLang, audioSpeed);
                                return;
                              }
                              setParagraphSubmitted(true);
                              speak(t('paragraphSubmitted'), knownSpeechLang, audioSpeed);
                            }}
                            disabled={paragraphText.trim() === ''}
                            style={{
                              padding: '10px 24px',
                              background: 'linear-gradient(135deg, var(--color-orange), var(--color-orange-dark))',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '12px',
                              fontWeight: 800,
                              fontSize: '13px',
                              cursor: paragraphText.trim() === '' ? 'default' : 'pointer',
                              boxShadow: paragraphText.trim() === '' ? 'none' : '0 4px 10px rgba(255, 122, 0, 0.2)'
                            }}
                            type="button"
                          >
                            Submit Writing ✓
                          </button>
                        ) : (
                          <div style={{ background: '#E8F5E9', border: '1.5px solid #2E7D32', borderRadius: '10px', padding: '6px 12px', color: '#2E7D32', fontSize: '12px', fontWeight: 900 }}>
                            🎉 Submitted & Approved
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '24px' }}>
                      <button
                        className={styles.mutedNavBtn}
                        onClick={() => setSlideIndex(prev => prev - 1)}
                        type="button"
                      >
                        {t('backBtn')}
                      </button>

                      <button
                        className={styles.finishLessonBtn}
                        onClick={() => {
                          setParagraphText('');
                          setParagraphSubmitted(false);
                          setSlideIndex(prev => prev + 1);
                        }}
                        type="button"
                        disabled={!paragraphSubmitted}
                        style={{ width: 'auto', padding: '12px 36px', backgroundColor: paragraphSubmitted ? '#4CAF50' : '#E2E8F0', color: paragraphSubmitted ? '#FFFFFF' : '#94A3B8', cursor: paragraphSubmitted ? 'pointer' : 'default', boxShadow: paragraphSubmitted ? '0 6px 20px rgba(76, 175, 80, 0.25)' : 'none' }}
                      >
                        {t('nextBtn')}
                      </button>
                    </div>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'explore') {
                return (
                  <motion.div
                    key="explore"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <span className={styles.storyboardBadge}>{currentSlide.instruction || 'Observe'}</span>
                    <h1 className={styles.storyboardTitle} style={{ fontSize: '28px', marginTop: '10px' }}>
                      {currentSlide.concept}
                    </h1>

                    <div
                      style={{
                        margin: '24px auto',
                        width: '140px',
                        height: '140px',
                        borderRadius: '50%',
                        background: 'var(--color-cream-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '72px',
                        border: '3px solid var(--color-peach-light)',
                        boxShadow: 'var(--shadow-card)'
                      }}
                    >
                      {currentSlide.visual || '💡'}
                    </div>

                    <button
                      onClick={() => speak(currentSlide.audio_narration || currentSlide.concept, speechLang, audioSpeed)}
                      className={styles.soundPlayCard}
                      style={{ margin: '12px auto 20px', maxWidth: '240px' }}
                      type="button"
                    >
                      <Volume2 size={24} />
                      <span>Listen to Pronunciation</span>
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', width: '100%' }}>
                      <button
                        className={styles.mutedNavBtn}
                        onClick={() => setSlideIndex(prev => prev - 1)}
                        type="button"
                      >
                        {t('backBtn')}
                      </button>

                      <button
                        className={styles.finishLessonBtn}
                        onClick={() => setSlideIndex(prev => prev + 1)}
                        style={{ width: 'auto', padding: '12px 36px', backgroundColor: '#FF7A00' }}
                        type="button"
                      >
                        {t('nextBtn')}
                      </button>
                    </div>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'learn') {
                return (
                  <motion.div
                    key="learn"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <span className={styles.storyboardBadge}>{currentSlide.instruction || 'Learn'}</span>
                    <h1 className={styles.storyboardTitle} style={{ fontSize: '28px', marginTop: '10px' }}>
                      {currentSlide.explanation}
                    </h1>

                    <div
                      style={{
                        margin: '24px auto',
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'var(--color-cream-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '60px',
                        border: '2px solid var(--color-peach-light)'
                      }}
                    >
                      {currentSlide.visual || '💡'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', width: '100%' }}>
                      <button
                        className={styles.mutedNavBtn}
                        onClick={() => setSlideIndex(prev => prev - 1)}
                        type="button"
                      >
                        {t('backBtn')}
                      </button>

                      <button
                        className={styles.finishLessonBtn}
                        onClick={() => setSlideIndex(prev => prev + 1)}
                        style={{ width: 'auto', padding: '12px 36px', backgroundColor: '#FF7A00' }}
                        type="button"
                      >
                        {t('nextBtn')}
                      </button>
                    </div>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'practice') {
                return (
                  <motion.div
                    key="practice"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <span className={styles.storyboardBadge}>{currentSlide.instruction || 'Practice'}</span>
                    
                    <div style={{ width: '100%', padding: '30px 0' }}>
                      <div className={styles.voiceRecordArea}>
                        <button
                          className={`${styles.voiceBtn} ${listening ? styles.voiceListening : voiceSuccess ? styles.voiceSuccess : ''}`}
                          onClick={() => {
                            setShowHandPointer(false);
                            startListening();
                          }}
                          type="button"
                          style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: listening ? '#FF4757' : (voiceSuccess ? '#4CAF50' : '#FF7A00'),
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                          }}
                        >
                          <Mic size={40} color="#FFFFFF" />
                        </button>
                        
                        <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '24px' }}>
                          {listening ? 'Listening...' : voiceSuccess ? 'Excellent pronunciation matched!' : `Say aloud: "${currentSlide.voice_target || 'A'}"`}
                        </h3>
                        
                        {userSpokenText && (
                          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                            You said: <strong style={{ color: 'var(--color-orange-dark)' }}>"{userSpokenText}"</strong>
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', width: '100%' }}>
                      <button
                        className={styles.mutedNavBtn}
                        onClick={() => {
                          setVoiceSuccess(false);
                          setUserSpokenText('');
                          setSlideIndex(prev => prev - 1);
                        }}
                        type="button"
                      >
                        {t('backBtn')}
                      </button>

                      {voiceSuccess ? (
                        <button
                          className={styles.finishLessonBtn}
                          onClick={() => {
                            setVoiceSuccess(false);
                            setUserSpokenText('');
                            setSlideIndex(prev => prev + 1);
                          }}
                          style={{ width: 'auto', padding: '12px 36px', backgroundColor: '#4CAF50' }}
                          type="button"
                        >
                          {t('nextBtn')}
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800 }}>
                          🎤 Speak to continue!
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              }

              if (currentSlide.type === 'graduation') {
                return (
                  <motion.div
                    key="graduation"
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div style={{ margin: '20px auto 10px' }}>
                      <IllustrationSVG name="trophy" size={100} />
                    </div>

                    <h1 className={styles.storyboardTitle} style={{ fontSize: '32px', color: '#107C41' }}>Great job!</h1>
                    <p className={styles.storyboardSubtitle}>{currentSlide.subtitle}</p>

                     {currentSlide.letters ? (
                      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', margin: '24px 0' }}>
                        {currentSlide.letters?.map((l) => {
                          const meta = LETTER_META[l] || {};
                          return (
                            <div
                              key={l}
                              className={styles.graduationLetterCircle}
                              style={{ borderColor: meta.color }}
                            >
                              <span style={{ color: meta.color }}>{l}</span>
                              <span className={styles.checkedCircleBadge}>✓</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '24px',
                          background: 'var(--color-cream-bg)',
                          border: '2px solid var(--color-peach-light)',
                          borderRadius: '16px',
                          padding: '16px 24px',
                          margin: '24px auto',
                          maxWidth: '320px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '20px' }}>⭐</span>
                          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)' }}>
                            +{currentSlide.xp || 15} XP
                          </span>
                        </div>
                        <div style={{ width: '2px', height: '24px', background: 'var(--color-peach-light)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '20px' }}>⏱️</span>
                          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)' }}>
                            {currentSlide.time || '10 min'}
                          </span>
                        </div>
                      </div>
                    )}

                    <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '28px' }}>
                      You're now ready for Lesson {lessonNumber + 1}!
                    </p>

                    <button
                      className={styles.finishLessonBtn}
                      onClick={() => {
                        const hasQuiz = (lesson.quiz_bank && lesson.quiz_bank.length > 0) || (lesson.quiz_data && Object.keys(lesson.quiz_data).length > 0);
                        if (hasQuiz) {
                          setShowQuiz(true);
                          setStage(3);
                          setCurrentQuizIndex(0);
                          setQuizScore(0);
                          setQuizFailed(false);
                          setIncorrectQuizGuesses({});
                          generateActiveQuiz();
                        } else {
                          handleCompleteAndPlayNext();
                        }
                      }}
                      type="button"
                      disabled={completing}
                      style={{ backgroundColor: '#FF7A00', boxShadow: '0 6px 20px rgba(255, 122, 0, 0.25)' }}
                    >
                      {completing ? 'Saving...' : `Continue to Lesson Checkup ➔`}
                    </button>
                  </motion.div>
                );
              }

              return null;
            })()
          ) : (
            <>
              {/* STAGE 0: EXPLORE BOARD */}
              {stage === 0 && (
                <motion.div
                  key="stage0"
                  className={styles.card}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
              {showHandPointer && (
                <motion.div
                  className={styles.handPointerOverlay}
                  animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                >
                  👆
                </motion.div>
              )}

              {isAlphabetLesson ? (
                <div style={{ width: '100%' }}>
                  <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-dark)' }}>
                    {exploreData.question}
                  </h2>

                  <div className={styles.pillsContainer}>
                    <button
                      className={`${styles.pillBtn} ${styles.listenPill}`}
                      onClick={() => speak(exploreData.target, speechLang, audioSpeed)}
                      type="button"
                    >
                      <Volume2 size={18} />
                      <span>Listen</span>
                    </button>
                    <button
                      className={`${styles.pillBtn} ${styles.hintPill}`}
                      onClick={() => speak(exploreData.hint, speechLang, audioSpeed)}
                      type="button"
                    >
                      <HelpCircle size={18} />
                      <span>Hint</span>
                    </button>
                  </div>

                  {/* Big Pink Circular Volume Button */}
                  <button
                    className={styles.bigPinkSpeakerBtn}
                    onClick={() => speak(exploreData.target, speechLang, audioSpeed)}
                    type="button"
                  >
                    <Volume2 size={56} />
                  </button>

                  {/* Large choices buttons stack */}
                  <div className={styles.alphabetQuizOptions}>
                    {(exploreData.options || []).map((opt) => {
                      const isSelected = alphabetAnswer === opt;
                      const isOptCorrect = opt === exploreData.target;
                      return (
                        <button
                          key={opt}
                          className={`${styles.alphabetOptionBtn} ${
                            isSelected ? (isOptCorrect ? styles.correctOption : styles.incorrectOption) : ''
                          }`}
                          onClick={() => {
                            setAlphabetAnswer(opt);
                            if (isOptCorrect) {
                              setAlphabetAnswerCorrect(true);
                              speak(t('correctFeedback'), knownSpeechLang, audioSpeed);
                            } else {
                              setAlphabetAnswerCorrect(false);
                              speak(t('incorrectFeedback'), knownSpeechLang, audioSpeed);
                            }
                          }}
                          type="button"
                        >
                          <span style={{ fontWeight: 800 }}>{opt}</span>
                          {isSelected && isOptCorrect && <span className={styles.checkmarkIcon}>✓</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Continue Button appears when correct */}
                  <div className={styles.footerRow} style={{ justifyContent: 'center', marginTop: '16px' }}>
                    <button
                      className={styles.primaryBtn}
                      disabled={!alphabetAnswerCorrect}
                      onClick={() => {
                        setAlphabetAnswer(null);
                        setAlphabetAnswerCorrect(false);
                        setStage(1);
                      }}
                      type="button"
                    >
                      <span>Continue</span>
                      <ArrowRight size={22} />
                    </button>
                  </div>
                </div>
              ) : (
                /* ORIGINAL EXPLORE BOARD */
                <div style={{ width: '100%' }}>
                  {lessonNumber === 1 ? (
                    <div style={{ width: '100%' }}>
                      <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>Tap any letter to hear sound</h2>
                      <div className={styles.alphabetGrid}>
                        {(ALPHABETS[preferredLanguage] || ALPHABETS.en).map((letter) => {
                          const details = LETTER_DETAILS[preferredLanguage]?.[letter] || LETTER_DETAILS.en[letter] || { name: letter, phonetic: letter, word: letter, emoji: '🔤' };
                          return (
                            <div
                              key={letter}
                              className={styles.alphabetBlock}
                              onClick={() => {
                                setShowHandPointer(false);
                                speak(details.name, speechLang, audioSpeed);
                                setTimeout(() => speak(details.phonetic, speechLang, audioSpeed), 900);
                                setTimeout(() => speak(details.word, speechLang, audioSpeed), 1800);
                              }}
                              style={{ minWidth: '80px', padding: '12px' }}
                            >
                              <span style={{ fontSize: '32px', fontWeight: 800 }}>{details.name} {details.name.toLowerCase()}</span>
                              <span style={{ fontSize: '24px' }}>{details.emoji}</span>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>{details.word}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* LESSONS 2-50: EXPLORE TARGET CARD */
                    <div style={{ width: '100%' }}>
                      <div
                        className={styles.everydayWordRow}
                        onClick={() => {
                          setShowHandPointer(false);
                          speak(exploreData.term || '', speechLang, audioSpeed);
                          if (exploreData.phonetic) {
                            setTimeout(() => speak(exploreData.phonetic, speechLang, audioSpeed), 1000);
                          }
                        }}
                        style={{ maxWidth: '400px', margin: '20px auto', padding: '24px' }}
                      >
                        <span className={styles.everydayEmoji} style={{ fontSize: '64px' }}>{exploreData.emoji || '🔤'}</span>
                        <div className={styles.everydayTextGroup}>
                          <h3 style={{ fontSize: '28px' }}>{exploreData.term || 'Target'}</h3>
                          <span style={{ fontSize: '15px' }}>Tap to hear sound: {exploreData.phonetic || ''}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={styles.footerRow}>
                    <div className={styles.tutorHint}>
                      <img src={owl} alt="MiGo Mascot" className={styles.owlHelperImg} />
                      <span>"Tap letters to explore, then click practice!"</span>
                    </div>
                    <button className={styles.primaryBtn} onClick={() => setStage(1)}>
                      <span>Practice Target</span>
                      <ArrowRight size={22} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STAGE 1: PRACTICE TARGET (Tracing / Microphone) */}
          {stage === 1 && (
            <motion.div
              key="stage1"
              className={styles.card}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {isAlphabetLesson ? (
                <div style={{ width: '100%' }}>
                  <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-dark)' }}>
                    {practiceData.question}
                  </h2>

                  <div className={styles.pillsContainer}>
                    <button
                      className={`${styles.pillBtn} ${styles.listenPill}`}
                      onClick={() => speak(practiceData.target, speechLang, audioSpeed)}
                      type="button"
                    >
                      <Volume2 size={18} />
                      <span>Listen</span>
                    </button>
                    <button
                      className={`${styles.pillBtn} ${styles.hintPill}`}
                      onClick={() => speak(practiceData.hint, speechLang, audioSpeed)}
                      type="button"
                    >
                      <HelpCircle size={18} />
                      <span>Hint</span>
                    </button>
                  </div>

                  {/* Big Pink Circular Volume Button */}
                  <button
                    className={styles.bigPinkSpeakerBtn}
                    onClick={() => speak(practiceData.target, speechLang, audioSpeed)}
                    type="button"
                  >
                    <Volume2 size={56} />
                  </button>

                  {/* Large choices buttons stack */}
                  <div className={styles.alphabetQuizOptions}>
                    {(practiceData.options || []).map((opt) => {
                      const isSelected = alphabetAnswer === opt;
                      const isOptCorrect = opt === practiceData.target;
                      return (
                        <button
                          key={opt}
                          className={`${styles.alphabetOptionBtn} ${
                            isSelected ? (isOptCorrect ? styles.correctOption : styles.incorrectOption) : ''
                          }`}
                          onClick={() => {
                            setAlphabetAnswer(opt);
                            if (isOptCorrect) {
                              setAlphabetAnswerCorrect(true);
                              speak(t('correctFeedback'), knownSpeechLang, audioSpeed);
                            } else {
                              setAlphabetAnswerCorrect(false);
                              speak(t('incorrectFeedback'), knownSpeechLang, audioSpeed);
                            }
                          }}
                          type="button"
                        >
                          <span style={{ fontWeight: 800 }}>{opt}</span>
                          {isSelected && isOptCorrect && <span className={styles.checkmarkIcon}>✓</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Celebration Card Overlay at the bottom */}
                  {alphabetAnswerCorrect && (
                    <div className={styles.celebrationPopup}>
                      <span className={styles.celebrationTitle}>🎉 Brilliant!</span>
                      <button
                        className={styles.finishLessonBtn}
                        onClick={handleFinishQuest}
                        type="button"
                        disabled={completing}
                      >
                        {completing ? "Saving..." : "Finish Lesson"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ORIGINAL STAGE 1: PRACTICE TARGET (Tracing / Microphone) */
                <div style={{ width: '100%' }}>
                  {lesson.skill === 'writing' ? (
                    /* Tracing guide */
                    <div style={{ width: '100%' }}>
                      <div className={styles.tracingInterfaceRow}>
                        <div className={styles.tracingGuideBlock}>
                          <span className={styles.giantGuideLetter}>{practiceData.voice_target || exploreData.phonetic || 'A'}</span>
                          <span className={styles.guideSubText}>Trace Guide</span>
                        </div>

                        <div className={styles.canvasContainer}>
                          <canvas
                            ref={canvasRef}
                            width={280}
                            height={280}
                            className={styles.tracingCanvas}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                          />
                          <button className={styles.clearCanvasBtn} onClick={clearCanvas}>
                            <Trash size={16} />
                            <span>Clear</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Microphone Speaking repetition */
                    <div style={{ width: '100%', padding: '40px 0' }}>
                      <div className={styles.voiceRecordArea}>
                        <button
                          className={`${styles.voiceBtn} ${listening ? styles.voiceListening : voiceSuccess ? styles.voiceSuccess : ''}`}
                          onClick={() => {
                            setShowHandPointer(false);
                            startListening();
                          }}
                          type="button"
                        >
                          <Mic size={32} color="#FFFFFF" />
                        </button>
                        <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '20px' }}>
                          {listening ? 'Listening...' : voiceSuccess ? 'Excellent pronunciation matched!' : `Say aloud: "${practiceData.voice_target || exploreData.term || 'A'}"`}
                        </h3>
                      </div>
                    </div>
                  )}

                  <div className={styles.footerRow}>
                    <div className={styles.tutorHint}>
                      <img src={owl} alt="MiGo Mascot" className={styles.owlHelperImg} />
                      <span>"Great practice! Let's play the visual game."</span>
                    </div>
                    <button className={styles.primaryBtn} onClick={() => setStage(2)}>
                      <span>Play Game</span>
                      <ArrowRight size={22} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STAGE 2: GAME ENGINE */}
          {stage === 2 && (
            <motion.div
              key="stage2"
              className={styles.card}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {gameData.type === 'tap_grid' && (
                <div style={{ width: '100%' }}>
                  <div className={styles.alphabetGrid}>
                    {(gameData.items || []).map((item) => (
                      <motion.button
                        key={item.label}
                        className={styles.alphabetBlock}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setShowHandPointer(false);
                          speak(item.sound, speechLang, audioSpeed);
                        }}
                        type="button"
                      >
                        <span style={{ fontSize: '48px' }}>{item.emoji}</span>
                        <span className={styles.letterTxt}>{item.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {gameData.type === 'find_one' && (
                <div style={{ width: '100%' }}>
                  <div className={styles.associationGrid}>
                    {(gameData.options || []).map((item) => {
                      const isCorrect = item.correct;
                      return (
                        <button
                          key={item.label}
                          className={styles.assocBox}
                          onClick={() => {
                            setShowHandPointer(false);
                            if (isCorrect) {
                              setMatchSuccess(true);
                              speak('Excellent!', speechLang, audioSpeed);
                            } else {
                              speak('Try again.', speechLang, audioSpeed);
                            }
                          }}
                          type="button"
                        >
                          <span style={{ fontSize: '64px' }}>{item.emoji}</span>
                          <span style={{ fontWeight: 800, fontSize: '16px' }}>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {gameData.type === 'match_pairs' && (
                <div style={{ width: '100%' }}>
                  <div className={styles.connectPairsContainer}>
                    <div className={styles.connectPairsColumn}>
                      {leftMatchItems.map((item) => {
                        const isCompleted = !!completedMatches[item.id];
                        const isSelected = selectedLeft === item.id;
                        return (
                          <button
                            key={item.id}
                            className={`${styles.matchGridBlock} ${isCompleted ? styles.matchSuccessBlock : isSelected ? styles.matchActiveBlock : ''}`}
                            onClick={() => selectLeftItem(item.id)}
                            type="button"
                            disabled={isCompleted}
                          >
                            <span>{item.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className={styles.connectPairsColumn}>
                      {rightMatchItems.map((item) => {
                        const isCompleted = Object.values(completedMatches).includes(item.id);
                        const isSelected = selectedRight === item.id;
                        return (
                          <button
                            key={item.id}
                            className={`${styles.matchGridBlock} ${isCompleted ? styles.matchSuccessBlock : isSelected ? styles.matchActiveBlock : ''}`}
                            onClick={() => selectRightItem(item.id)}
                            type="button"
                            disabled={isCompleted}
                          >
                            <span>{item.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {gameData.type === 'draw_canvas' && (
                <div style={{ width: '100%' }}>
                  <div className={styles.tracingInterfaceRow}>
                    <div className={styles.tracingGuideBlock}>
                      <span className={styles.giantGuideLetter}>{gameData.target || 'A'}</span>
                    </div>

                    <div className={styles.canvasContainer}>
                      <canvas
                        ref={canvasRef}
                        width={280}
                        height={280}
                        className={styles.tracingCanvas}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                      <button className={styles.clearCanvasBtn} onClick={clearCanvas}>
                        <Trash size={16} />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {gameData.type === 'fill_blank' && (
                <div style={{ width: '100%' }}>
                  <div className={styles.tracingGuideBlock} style={{ margin: '0 auto 20px', maxWidth: '280px' }}>
                    <span className={styles.giantGuideLetter} style={{ letterSpacing: '4px' }}>
                      {matchSuccess ? gameData.masked.replace('_', gameData.target) : gameData.masked}
                    </span>
                  </div>

                  <div className={styles.associationGrid}>
                    {(gameData.options || []).map((letter) => {
                      const isCorrect = letter === gameData.target;
                      return (
                        <button
                          key={letter}
                          className={styles.assocBox}
                          onClick={() => {
                            setShowHandPointer(false);
                            if (isCorrect) {
                              setMatchSuccess(true);
                              speak('Excellent!', speechLang, audioSpeed);
                            } else {
                              speak('Try again.', speechLang, audioSpeed);
                            }
                          }}
                          type="button"
                        >
                          <span style={{ fontSize: '32px', fontWeight: 800 }}>{letter}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {gameData.type === 'memory_cards' && (
                <div style={{ width: '100%' }}>
                  <div className={styles.associationGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    {memoryCards.map((card, idx) => {
                      const isFlipped = flippedCards.some(fc => fc.id === card.id) || matchedCardKeys.includes(card.match_key);
                      return (
                        <button
                          key={card.id}
                          className={`${styles.assocBox} ${isFlipped ? styles.activePhonics : ''}`}
                          onClick={() => handleCardFlip(card, idx)}
                          style={{ minHeight: '120px', backgroundColor: isFlipped ? '#FFFFFF' : '#FFF0E5' }}
                          type="button"
                        >
                          <span style={{ fontSize: '28px', fontWeight: 800 }}>
                            {isFlipped ? card.label : '❓'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {gameData.type === 'hunt_grid' && (
                <div style={{ width: '100%' }}>
                  <div className={styles.tracingGuideBlock} style={{ margin: '0 auto 20px', maxWidth: '280px' }}>
                    <span className={styles.giantGuideLetter}>{gameData.target}</span>
                  </div>

                  <div className={styles.associationGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {(gameData.grid || []).map((letter, idx) => (
                      <button
                        key={idx}
                        className={styles.assocBox}
                        onClick={() => handleHuntTap(letter)}
                        type="button"
                      >
                        <span style={{ fontSize: '28px', fontWeight: 800 }}>{letter}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {gameData.type === 'unscramble' && (
                <div style={{ width: '100%' }}>
                  <div className={styles.tracingGuideBlock} style={{ margin: '0 auto 20px', maxWidth: '280px' }}>
                    <span className={styles.giantGuideLetter}>
                      {builtSpelling.length > 0 ? builtSpelling.join('') : '___'}
                    </span>
                  </div>

                  <div className={styles.associationGrid}>
                    {shuffledLetters.map((letter, idx) => (
                      <button
                        key={idx}
                        className={styles.assocBox}
                        onClick={() => handleLetterTap(letter, idx)}
                        type="button"
                      >
                        <span style={{ fontSize: '28px', fontWeight: 800 }}>{letter}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.footerRow}>
                <div className={styles.tutorHint}>
                  <img src={owl} alt="MiGo Mascot" className={styles.owlHelperImg} />
                  <span>"Outstanding! Let's pass the 3-question quiz now!"</span>
                </div>
                <button
                  className={styles.primaryBtn}
                  disabled={!matchSuccess && gameData.type !== 'tap_grid' && gameData.type !== 'draw_canvas'}
                  onClick={() => setStage(3)}
                >
                  <span>Take Quiz</span>
                  <ArrowRight size={22} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 3: SHORT QUIZ (EXACTLY 3 QUESTIONS) */}
          {stage === 3 && (
            <motion.div
              key="stage3"
              className={styles.card}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className={styles.tag}>📝 Quiz Checkup ({currentQuizIndex + 1}/{activeQuizQuestions.length})</div>

              {quizFailed ? (
                <div className={styles.quizFailBlock}>
                  <XCircle size={64} color="#FF4757" style={{ margin: '0 auto 16px' }} />
                  <h2>Quiz checkup not passed.</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Score: <strong>{quizScore}/{activeQuizQuestions.length}</strong>. At least {activeQuizQuestions.length >= 3 ? 2 : activeQuizQuestions.length} correct answers required to pass.
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-orange-dark)', marginBottom: '24px' }}>
                    💡 Revision Tip: Review the slides and explanations before retrying the checkup!
                  </p>
                  <button className={styles.finishBtn} onClick={restartQuiz}>
                    Retry Quiz Checkup
                  </button>
                </div>
              ) : (
                <>
                  <h2 className={styles.sectionHeading} style={{ fontSize: '20px', marginBottom: '20px' }}>
                    {activeQuizQuestions[currentQuizIndex]?.question || 'Listen and select correct answer:'}
                  </h2>

                  {/* Speaker sound check */}
                  <button
                    className={styles.soundPlayCard}
                    onClick={() => {
                      const soundTarget = activeQuizQuestions[currentQuizIndex]?.sound_prompt || activeQuizQuestions[currentQuizIndex]?.correct || 'A';
                      speak(soundTarget, speechLang, audioSpeed);
                    }}
                    style={{ margin: '16px auto 24px', maxWidth: '200px' }}
                  >
                    <Volume2 size={32} />
                    <span>Play Sound Prompt</span>
                  </button>

                  <div className={styles.everydayWordsGrid}>
                    {(activeQuizQuestions[currentQuizIndex]?.options || ['Option A', 'Option B', 'Option C']).map((opt) => {
                      const isSelected = selectedQuizOption === opt;
                      const isGuessedWrong = (incorrectQuizGuesses[currentQuizIndex] || []).includes(opt);
                      const q = activeQuizQuestions[currentQuizIndex];
                      const correct = q?.correct || (q && q.options && q.correct_index !== undefined ? q.options[q.correct_index] : 'Option A');
                      const isCorrect = opt === correct;

                      return (
                        <div
                          key={opt}
                          className={`${styles.everydayWordRow} ${isSelected ? styles.gateDoneBadge : ''}`}
                          onClick={() => {
                            if (selectedQuizOption) return; // Locked once they get correct answer
                            handleQuizAnswer(opt);
                          }}
                          style={{
                            padding: '14px 20px',
                            cursor: selectedQuizOption ? 'default' : 'pointer',
                            border: isSelected ? '2.5px solid #4CAF50' : (isGuessedWrong ? '2.5px solid #E74C3C' : '1.5px solid #E2E8F0'),
                            background: isSelected ? '#E8F5E9' : (isGuessedWrong ? '#FDF2F2' : '#FFFFFF'),
                            color: isSelected ? '#1B5E20' : (isGuessedWrong ? '#C62828' : 'var(--text-dark)'),
                            opacity: isGuessedWrong ? 0.8 : 1,
                            pointerEvents: selectedQuizOption ? 'none' : 'auto'
                          }}
                        >
                          <span style={{ fontSize: '16px', fontWeight: 800 }}>{opt}</span>
                          {isSelected && <span style={{ marginLeft: 'auto', color: '#4CAF50', fontWeight: 900 }}>✓</span>}
                          {isGuessedWrong && <span style={{ marginLeft: 'auto', color: '#E74C3C', fontWeight: 900 }}>✗</span>}
                        </div>
                      );
                    })}
                  </div>

                  {((incorrectQuizGuesses[currentQuizIndex] || []).length > 0) && (
                    <div className={`${styles.feedbackAlertCard} ${styles.feedbackIncorrectAlert}`} style={{ margin: '16px auto', maxWidth: '480px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <IllustrationSVG name="owl" size={36} />
                      <div style={{ textAlign: 'left' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: '#C62828' }}>AI Tutor Tip:</h4>
                        <p style={{ fontSize: '12px', margin: '2px 0 0 0', color: '#C62828', fontWeight: 700 }}>
                          {activeQuizQuestions[currentQuizIndex]?.explanation || "Keep trying! Look closely at the options."}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className={styles.footerRow} style={{ marginTop: '20px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Quiz Score: {quizScore} / {activeQuizQuestions.length}
                    </span>
                    <button
                      className={styles.primaryBtn}
                      disabled={!selectedQuizOption}
                      onClick={handleNextQuizQuestion}
                    >
                      <span>{currentQuizIndex < (activeQuizQuestions.length - 1) ? 'Next' : 'Submit Quiz'}</span>
                      <ArrowRight size={22} />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* STAGE 4: REWARD & CELEBRATION */}
          {(stage === 4 || (isAlphabetLesson && stage === 2)) && (
            <motion.div
              key="stage4"
              className={`${styles.card} ${styles.rewardCard}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {(lesson.lesson_id && lesson.lesson_id.includes('-ASSESS-')) ? (
                <div className={styles.certificateOuterBorder}>
                  <div className={styles.certificateInnerBorder}>
                    <div className={styles.certHeader}>
                      <span className={styles.certLogo}>🎓 MIGO LITERACY GRADUATE</span>
                      <h1 className={styles.certMainTitle}>CERTIFICATE OF COMPLETION</h1>
                    </div>
                    <div className={styles.certBody}>
                      <p className={styles.certPresentation}>This certificate is proudly awarded to:</p>
                      <h2 className={styles.certLearnerName}>{learner?.name || 'LITERACY GRADUATE'}</h2>
                      <div className={styles.dividerLine} />
                      <p className={styles.certDetails}>
                        For successfully graduating the adaptive level assessment, mastering letter sounds, tracing visual guides, and everyday survival vocabulary!
                      </p>
                    </div>
                    <div className={styles.certFooter}>
                      <div className={styles.certSign}>
                        <span className={styles.certSignLine}>Antigravity</span>
                        <span>AI Learning Architect</span>
                      </div>
                      <div className={styles.certGoldSeal}>
                        <span className={styles.sealCircle}>🏆</span>
                      </div>
                      <div className={styles.certSign}>
                        <span className={styles.certSignLine}>MiGo Team</span>
                        <span>Director</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className={styles.finishBtn} onClick={() => navigate('/home')} style={{ marginTop: '28px' }}>
                    Return to Map & Continue 🚀
                  </button>
                </div>
              ) : (
                <>
                  <img src={treasure} alt="Treasure" className={styles.chestImgLarge} />
                  <h1 className={styles.rewardTitle}>Quest Completed!</h1>
                  <p className={styles.rewardSub}>Awesome progress! You've unlocked the next lesson.</p>

                  <div className={styles.rewardsPanelBox}>
                    <div className={styles.rewardStatItem}>
                      <Star size={20} color="#FF9F43" fill="#FF9F43" />
                      <span>+{lesson.rewards_data?.stars || 3} Stars</span>
                    </div>
                    <div className={styles.rewardStatItem}>
                      <Sparkles size={20} color="#1DD1A1" />
                      <span>+{lesson.rewards_data?.xp || 10} XP</span>
                    </div>
                    <div className={styles.rewardStatItem}>
                      <span style={{ fontSize: '18px' }}>💵</span>
                      <span>+{lesson.rewards_data?.coins || 2} Coins</span>
                    </div>
                  </div>

                  <div className={styles.actionBtnRow} style={{ margin: '24px auto 0' }}>
                    <button className={styles.finishBtn} onClick={handlePlayNextLesson} disabled={completing}>
                      <span>{completing ? 'Loading...' : `Play Lesson ${lessonNumber + 1} ▶`}</span>
                    </button>
                    <button className={styles.mapLinkBtn} onClick={() => navigate('/home')}>
                      Return to Map
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
          </>
          )}

        </AnimatePresence>
        </div>
      </main>

      {showNotes && (
        <LessonDocument
          lesson={lesson}
          language={preferredLanguage}
          onClose={() => setShowNotes(false)}
        />
      )}
      {renderWizardModal()}
    </div>
  );
}

export default function LessonPlayer() {
  return (
    <ErrorBoundary>
      <LessonPlayerInner />
    </ErrorBoundary>
  );
}
