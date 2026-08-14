// src/services/speak.js

// Global array to prevent garbage collection of active utterances in Chrome/Edge
let activeUtterances = [];

/**
 * Picks the best available female-sounding voice for a given language.
 * Falls back to any voice matching the language, then to the browser default.
 */
function pickFemaleVoice(lang) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) {
    return null;
  }

  const langPrefix = lang ? lang.split('-')[0].toLowerCase() : 'en';

  // Common naming patterns browsers use for female voices
  const femaleHints = ['female', 'zira', 'samantha', 'susan', 'victoria', 'karen', 'moira', 'tessa', 'google us english', 'google uk english female'];

  const matchesLang = (voice) => {
    if (!voice || !voice.lang) return false;
    const voiceLangClean = voice.lang.toLowerCase().replace('_', '-');
    return voiceLangClean === lang.toLowerCase() || voiceLangClean.startsWith(langPrefix);
  };

  const soundsFemale = (voice) =>
    voice && voice.name && femaleHints.some((hint) => voice.name.toLowerCase().includes(hint));

  // 1. Best case: a voice matching both language and female naming pattern
  let voice = voices.find((v) => matchesLang(v) && soundsFemale(v));

  // 2. Fallback: any voice matching the language (may be male, but at least right language)
  if (!voice) {
    voice = voices.find((v) => matchesLang(v));
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
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('SpeechSynthesis not supported in this browser.');
    return;
  }

  // Ensure speech synthesis is not paused
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  if (cancelFirst) {
    window.speechSynthesis.cancel();
    activeUtterances = []; // Reset active list if cancelling
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

  // Retain reference to prevent garbage collection in Chrome
  activeUtterances.push(utterance);
  
  utterance.onend = () => {
    activeUtterances = activeUtterances.filter(u => u !== utterance);
  };
  
  utterance.onerror = (e) => {
    activeUtterances = activeUtterances.filter(u => u !== utterance);
    console.warn('Speech error:', e);
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Speaks a list of utterances sequentially.
 * @param {Array<{text: string, lang: string}>} items - Array of text items to speak sequentially.
 * @param {number} rate - Speed rate of narration.
 */
export function speakSequence(items, rate = 0.85) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !items || items.length === 0) return;

  // Make sure to cancel any current speech
  window.speechSynthesis.cancel();
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
  activeUtterances = [];

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

    // Keep reference in activeUtterances list to prevent Chrome GC bug
    activeUtterances.push(utterance);

    utterance.onend = () => {
      activeUtterances = activeUtterances.filter(u => u !== utterance);
      index++;
      playNext();
    };

    utterance.onerror = (e) => {
      activeUtterances = activeUtterances.filter(u => u !== utterance);
      console.warn('Speech synthesis sequential item failed:', e);
      index++;
      playNext();
    };

    window.speechSynthesis.speak(utterance);
  };

  playNext();
}

export default speak;