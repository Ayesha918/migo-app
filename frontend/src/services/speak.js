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

  const langPrefix = lang.split('-')[0]; // 'en-US' -> 'en'

  // Common naming patterns browsers use for female voices
  const femaleHints = ['female', 'zira', 'samantha', 'susan', 'victoria', 'karen', 'moira', 'tessa', 'google us english', 'google uk english female'];

  const matchesLang = (voice) => voice.lang.toLowerCase().startsWith(langPrefix);
  const soundsFemale = (voice) =>
    femaleHints.some((hint) => voice.name.toLowerCase().includes(hint));

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
function speak(text, lang = 'en-US') {
  if (!window.speechSynthesis) {
    console.warn('SpeechSynthesis not supported in this browser.');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  const femaleVoice = pickFemaleVoice(lang);
  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export default speak;