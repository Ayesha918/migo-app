// src/components/Home/VoiceAssistantChatbot.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mic, MicOff, Volume2, X, Send, Sparkles, HelpCircle } from 'lucide-react';
import { useLearner } from '../../services/LearnerContext';
import speak from '../../services/speak';
import useVoiceInput from '../../services/useVoiceInput';
import owl from '../../assets/images/owl.png';
import styles from './VoiceAssistantChatbot.module.css';

const QUICK_QUESTIONS = [
  'How do I level up?',
  'How do I earn stars and coins?',
  'Give me a reading tip!',
  'How does the prediction work?',
];

export default function VoiceAssistantChatbot() {
  const { learner } = useLearner();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hoot! Hi ${learner?.name || 'friend'}! 🦉 I am MiGo, your AI Voice Assistant! How can I help you today?`,
    },
  ]);

  const speechLang = learner?.learning_language === 'hi' ? 'hi-IN' : learner?.learning_language === 'kn' ? 'kn-IN' : learner?.learning_language === 'ta' ? 'ta-IN' : 'en-US';

  const handleBotResponse = (userQuery) => {
    const query = userQuery.toLowerCase().trim();
    let reply = "Hoot! Keep practicing your daily lessons to earn stars and unlock new adventure levels!";

    if (query.includes('level') || query.includes('level up')) {
      reply = "To level up, complete your daily lessons on the Adventure Road! As your reading & writing accuracy grows, you'll advance from Beginner to Intermediate and Advanced!";
    } else if (query.includes('star') || query.includes('coin') || query.includes('reward')) {
      reply = "You earn 3 Stars and 10 XP for every lesson completed, plus bonus coins from milestone treasure chests on the map!";
    } else if (query.includes('tip') || query.includes('read') || query.includes('write')) {
      reply = "Top Tip: Say words aloud while looking at the pictures! Practice for 15 minutes every day for the fastest learning growth!";
    } else if (query.includes('prediction') || query.includes('ml') || query.includes('forecast')) {
      reply = "Our Scikit-Learn Machine Learning model analyzes your completed lessons and quiz scores to forecast your 2-week score trajectory on your Roadmap & Dashboard!";
    } else if (query.includes('hi') || query.includes('hello')) {
      reply = `Hello ${learner?.name || 'friend'}! I'm always here to guide you on your learning journey. Ask me anything!`;
    }

    setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    speak(reply, speechLang);
  };

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    if (!textToSend) setInputText('');

    setTimeout(() => {
      handleBotResponse(text);
    }, 400);
  };

  const handleVoiceResult = (transcript) => {
    if (transcript) {
      handleSend(transcript);
    }
  };

  const { startListening, listening } = useVoiceInput(handleVoiceResult, speechLang);

  return (
    <div className={styles.container}>
      {/* Chat Window Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.chatWindow}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* Window Header */}
            <div className={styles.chatHeader}>
              <div className={styles.botInfo}>
                <img src={owl} alt="MiGo Mascot" className={styles.headerOwlImg} />
                <div>
                  <h3>MiGo Voice Assistant</h3>
                  <span className={styles.onlineBadge}>● Online & Listening</span>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Messages Body */}
            <div className={styles.messagesBody}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`${styles.msgRow} ${msg.sender === 'user' ? styles.userRow : styles.botRow}`}
                >
                  {msg.sender === 'bot' && <img src={owl} alt="Owl" className={styles.msgOwlImg} />}
                  <div className={`${styles.bubble} ${msg.sender === 'user' ? styles.userBubble : styles.botBubble}`}>
                    <span>{msg.text}</span>
                    {msg.sender === 'bot' && (
                      <button className={styles.speakMiniBtn} onClick={() => speak(msg.text, speechLang)}>
                        <Volume2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Suggestions */}
            <div className={styles.quickQuestionsRow}>
              {QUICK_QUESTIONS.map((q, idx) => (
                <button key={idx} className={styles.quickChip} onClick={() => handleSend(q)}>
                  {q}
                </button>
              ))}
            </div>

            {/* Input Row */}
            <div className={styles.inputRow}>
              <button
                type="button"
                className={`${styles.micBtn} ${listening ? styles.micListening : ''}`}
                onClick={startListening}
                title="Tap to speak your question"
              >
                {listening ? <Mic size={20} color="#FFF" /> : <MicOff size={20} color="#FF7A00" />}
              </button>

              <input
                type="text"
                className={styles.textInput}
                placeholder="Ask MiGo anything..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />

              <button type="button" className={styles.sendBtn} onClick={() => handleSend()}>
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Corner Mascot Trigger Button */}
      <motion.button
        className={styles.floatingTrigger}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      >
        <img src={owl} alt="MiGo Assistant" className={styles.triggerOwlImg} />
        {!isOpen && <span className={styles.triggerBadge}>Ask AI 🦉</span>}
      </motion.button>
    </div>
  );
}
