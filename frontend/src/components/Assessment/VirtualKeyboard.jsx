// src/components/Assessment/VirtualKeyboard.jsx
import { useState } from 'react';
import keyboardLayouts from '../../services/keyboardLayouts';
import styles from './VirtualKeyboard.module.css';

function VirtualKeyboard({ language, onCharPress, onBackspace, onSpace }) {
  const [activeTab, setActiveTab] = useState('vowels');
  const layout = keyboardLayouts[language];

  if (!layout) return null; // English or unsupported -> no virtual keyboard shown

  const tabs = [
    { key: 'vowels', label: 'Vowels' },
    { key: 'consonants', label: 'Consonants' },
    { key: 'matras', label: 'Signs' },
  ];

  return (
    <div className={styles.keyboard}>
      <div className={styles.tabRow}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tabButton} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.keyGrid}>
        {layout[activeTab].map((char, idx) => (
          <button
            key={idx}
            type="button"
            className={styles.keyButton}
            onClick={() => onCharPress(char)}
          >
            {char}
          </button>
        ))}
      </div>

      <div className={styles.controlRow}>
        <button type="button" className={styles.controlButton} onClick={onSpace}>
          ⎵ Space
        </button>
        <button type="button" className={styles.controlButton} onClick={onBackspace}>
          ⌫ Delete
        </button>
      </div>
    </div>
  );
}

export default VirtualKeyboard;