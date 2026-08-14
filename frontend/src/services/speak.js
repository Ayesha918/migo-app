// src/services/speak.js

let cachedVoices = [];

// Voices load asynchronously in most browsers — this keeps our cache fresh
function loadVoices() {
  cachedVoices = window.speechSynthesis.getVoices();
}

if (window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * Picks the best available female-sounding voice for a given language.
 * Falls back to any voice matching the language, then to the browser default.
 */
function pickFemaleVoice(lang) {
  if (!cachedVoices.length) {
    cachedVoices = window.speechSynthesis.getVoices();
  }

  const langPrefix = lang ? lang.split('-')[0].toLowerCase() : 'en';

  // Common naming patterns browsers use for female voices
  const femaleHints = ['female', 'zira', 'samantha', 'susan', 'victoria', 'karen', 'moira', 'tessa', 'google us english', 'google uk english female'];

  const matchesLang = (voice) => voice && voice.lang && voice.lang.toLowerCase().startsWith(langPrefix);
  const soundsFemale = (voice) =>
    voice && voice.name && femaleHints.some((hint) => voice.name.toLowerCase().includes(hint));

  // 1. Best case: a voice matching both language and female naming pattern
  let voice = cachedVoices.find((v) => matchesLang(v) && soundsFemale(v));

  // 2. Fallback: any voice matching the language (may be male, but at least right language)
  if (!voice) {
    voice = cachedVoices.find((v) => matchesLang(v));
  }

  // 3. Last resort: browser default voice
  return voice || null;
}

/**
 * Speaks the given text aloud using the browser's SpeechSynthesis API.
 * @param {string} text - The text to speak.
 * @param {string} lang - BCP-47 language code (e.g. 'en-US', 'hi-IN', 'kn-IN', 'ar-SA').
 */
function speak(text, lang = 'en-US', rate = 0.95, cancelFirst = true) {
  if (!window.speechSynthesis) {
    console.warn('SpeechSynthesis not supported in this browser.');
    return;
  }

  // Ensure speech synthesis is not paused
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  if (cancelFirst) {
    window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.volume = 1;

  const femaleVoice = pickFemaleVoice(lang);
  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Speaks a list of utterances sequentially.
 * @param {Array<{text: string, lang: string}>} items - Array of text items to speak sequentially.
 * @param {number} rate - Speed rate of narration.
 */
export function speakSequence(items, rate = 0.85) {
  if (!window.speechSynthesis || !items || items.length === 0) return;

  // Make sure to cancel any current speech
  window.speechSynthesis.cancel();
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  let index = 0;

  const playNext = () => {
    if (index >= items.length) return;
    const current = items[index];
    if (!current || !current.text) {
      index++;
      playNext();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(current.text);
    utterance.lang = current.lang || 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    const femaleVoice = pickFemaleVoice(utterance.lang);
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onend = () => {
      index++;
      playNext();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis sequential item failed:', e);
      index++;
      playNext();
    };

    window.speechSynthesis.speak(utterance);
  };

  playNext();
}

export default speak;