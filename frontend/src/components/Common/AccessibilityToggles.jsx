// src/components/Common/AccessibilityToggles.jsx
import { useState, useEffect } from 'react';
import { Type, Volume2, HelpCircle, Play, X } from 'lucide-react';
import styles from './AccessibilityToggles.module.css';

export default function AccessibilityToggles() {
  const [zoomLevel, setZoomLevel] = useState(1.0); // 1.0, 1.15, 1.3
  const [panelOpen, setPanelOpen] = useState(false);
  const [readerText, setReaderText] = useState('');

  // Adjust Zoom Scale in CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--zoom-scale', zoomLevel.toString());
  }, [zoomLevel]);

  const cycleZoom = () => {
    if (zoomLevel === 1.0) setZoomLevel(1.15);
    else if (zoomLevel === 1.15) setZoomLevel(1.3);
    else setZoomLevel(1.0);
  };

  // Speaks entered text to learner
  const speakText = () => {
    if (!readerText.trim()) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(readerText);
      utterance.rate = 0.85; // slower speed for clean literacy modeling
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.toggleTrigger}
        onClick={() => setPanelOpen(!panelOpen)}
        title="MiGo Study Helper"
        type="button"
      >
        <HelpCircle size={22} className={styles.settingsIcon} />
        <span>MiGo Helper</span>
      </button>

      {panelOpen && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>🦉 MiGo Helper Tools</h3>
            <button className={styles.closeBtn} onClick={() => setPanelOpen(false)} type="button">
              <X size={16} />
            </button>
          </div>

          {/* Feature 1: Speak Aloud TTS Reader */}
          <div className={styles.helperSection}>
            <span className={styles.sectionLabel}>🗣️ Audio Reader Helper:</span>
            <p className={styles.helperHint}>Type any word or sentence, and your tutor owl will read it aloud!</p>
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Type word to pronounce..."
                value={readerText}
                onChange={(e) => setReaderText(e.target.value)}
                className={styles.helperInput}
              />
              <button 
                className={styles.speakBtn} 
                onClick={speakText} 
                disabled={!readerText.trim()}
                title="Speak Word"
                type="button"
              >
                <Volume2 size={16} />
                <span>Read</span>
              </button>
            </div>
          </div>

          {/* Feature 2: Large Text Scale Controller */}
          <div className={styles.helperSection}>
            <span className={styles.sectionLabel}>🔍 Screen Font Size:</span>
            <div className={styles.optionRow}>
              <span>Adjust Scale:</span>
              <button className={styles.actionBtn} onClick={cycleZoom} type="button">
                <Type size={18} />
                <span>
                  {zoomLevel === 1.0 ? 'Normal Text' : zoomLevel === 1.15 ? 'Large Text' : 'Extra Large'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
