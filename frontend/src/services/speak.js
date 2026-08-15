// src/services/speak.js

// Global array to prevent garbage collection of active utterances in Chrome/Edge
let activeUtterances = [];
let currentFallbackAudio = null;

// Languages that will always stream from Google Translate TTS for high-quality regional voices
const ALWAYS_STREAM_LANGS = ['hi', 'kn', 'ta', 'te'];

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

  return voice || null;
}

/**
 * Speaks the text using browser's native SpeechSynthesis API as the final fallback.
 */
function speakNativeVoice(text, lang, onEndCallback, onErrorCallback) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onErrorCallback) onErrorCallback(new Error("speechSynthesis not supported"));
    return;
  }

  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.85;
  utterance.pitch = 1;
  utterance.volume = 1;

  const nativeVoice = pickFemaleVoice(lang);
  if (nativeVoice) {
    utterance.voice = nativeVoice;
  }

  activeUtterances.push(utterance);

  utterance.onend = () => {
    activeUtterances = activeUtterances.filter(u => u !== utterance);
    if (onEndCallback) onEndCallback();
  };

  utterance.onerror = (e) => {
    activeUtterances = activeUtterances.filter(u => u !== utterance);
    console.warn("Native SpeechSynthesis failed:", e);
    if (onErrorCallback) onErrorCallback(e);
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Plays speech using Google Translate TTS service.
 * Proxies the request through our backend /api/users/tts to bypass browser Referer checks.
 * Falls back immediately to native SpeechSynthesis if the proxy times out (e.g. Render server asleep) or fails.
 */
function speakViaAudioFallback(text, lang, onEndCallback, onErrorCallback) {
  if (currentFallbackAudio) {
    currentFallbackAudio.pause();
    currentFallbackAudio = null;
  }

  const langPrefix = lang ? lang.split('-')[0].toLowerCase() : 'en';
  const baseAPI = (import.meta.env && import.meta.env.VITE_API_URL) || 'https://migo-app-1.onrender.com/api';
  const url = `${baseAPI}/users/tts?text=${encodeURIComponent(text)}&lang=${langPrefix}`;
  
  const audio = document.createElement('audio');
  audio.src = url;
  currentFallbackAudio = audio;

  let fallbackTriggered = false;

  const triggerNativeFallback = () => {
    if (fallbackTriggered) return;
    fallbackTriggered = true;
    
    if (currentFallbackAudio === audio) {
      currentFallbackAudio.pause();
      currentFallbackAudio = null;
    }
    console.warn("TTS audio proxy delayed or failed, falling back to native voice.");
    speakNativeVoice(text, lang, onEndCallback, onErrorCallback);
  };

  // Fallback timeout: if the audio does not start playing within 2.5 seconds, trigger native TTS
  const timeoutId = setTimeout(() => {
    triggerNativeFallback();
  }, 2500);

  audio.onplaying = () => {
    clearTimeout(timeoutId);
  };

  audio.onended = () => {
    clearTimeout(timeoutId);
    if (currentFallbackAudio === audio) {
      currentFallbackAudio = null;
    }
    if (onEndCallback) onEndCallback();
  };

  audio.onerror = (e) => {
    clearTimeout(timeoutId);
    triggerNativeFallback();
  };

  audio.play().catch((err) => {
    clearTimeout(timeoutId);
    console.warn("Audio autoplay blocked by browser:", err);
    triggerNativeFallback();
  });
}

/**
 * Speaks the given text aloud using the browser's SpeechSynthesis API or Google TTS fallback.
 * @param {string} text - The text to speak.
 * @param {string} lang - BCP-47 language code (e.g. 'en-US', 'hi-IN', 'kn-IN', 'ar-SA').
 * @param {number} rate - Speed rate of narration.
 * @param {boolean} cancelFirst - Whether to clear the queue first.
 * @param {function} onStart - Callback when speech begins.
 * @param {function} onEnd - Callback when speech finishes.
 * @param {function} onError - Callback when speech errors.
 */
function speak(text, lang = 'en-US', rate = 0.95, cancelFirst = true, onStart = null, onEnd = null, onError = null) {
  if (typeof window === 'undefined') return;

  if (cancelFirst) {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    activeUtterances = [];
    if (currentFallbackAudio) {
      currentFallbackAudio.pause();
      currentFallbackAudio = null;
    }
  }

  const langPrefix = lang ? lang.split('-')[0].toLowerCase() : 'en';
  const shouldAlwaysStream = ALWAYS_STREAM_LANGS.includes(langPrefix);

  const nativeVoice = shouldAlwaysStream ? null : pickFemaleVoice(lang);
  if (!nativeVoice) {
    console.log(`Routing regional/fallback TTS audio for ${lang}.`);
    if (onStart) onStart();
    speakViaAudioFallback(text, lang, onEnd, onError);
    return;
  }

  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.voice = nativeVoice;

  // Retain reference to prevent garbage collection in Chrome
  activeUtterances.push(utterance);
  
  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    activeUtterances = activeUtterances.filter(u => u !== utterance);
    if (onEnd) onEnd();
  };
  
  utterance.onerror = (e) => {
    activeUtterances = activeUtterances.filter(u => u !== utterance);
    console.warn('Speech error:', e);
    if (onError) onError(e);
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Speaks a list of utterances sequentially.
 * @param {Array<{text: string, lang: string}>} items - Array of text items to speak sequentially.
 * @param {number} rate - Speed rate of narration.
 */
export function speakSequence(items, rate = 0.85) {
  if (typeof window === 'undefined' || !items || items.length === 0) return;

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  activeUtterances = [];
  if (currentFallbackAudio) {
    currentFallbackAudio.pause();
    currentFallbackAudio = null;
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

    const currentLang = current.lang || 'en-US';
    const langPrefix = currentLang.split('-')[0].toLowerCase();
    const shouldAlwaysStream = ALWAYS_STREAM_LANGS.includes(langPrefix);

    const nativeVoice = shouldAlwaysStream ? null : pickFemaleVoice(currentLang);

    if (!nativeVoice) {
      console.log(`speakSequence: Routing regional/fallback TTS audio for ${currentLang}`);
      speakViaAudioFallback(
        current.text,
        currentLang,
        () => {
          index++;
          playNext();
        },
        () => {
          index++;
          playNext();
        }
      );
      return;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(current.text);
    utterance.lang = currentLang;
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.voice = nativeVoice;

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