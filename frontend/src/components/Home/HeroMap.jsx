// src/components/Home/HeroMap.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Lock, CheckCircle2, Play, Sparkles, Trophy } from 'lucide-react';
import owl from '../../assets/images/owl.png';
import treasure from '../../assets/images/treasure.png';
import gift from '../../assets/images/gift.jpeg';
import MilestoneModal from './MilestoneModal';
import LessonVisual from '../Lessons/LessonVisual';
import styles from './HeroMap.module.css';

export default function HeroMap({
  learningPath = [],
  currentLesson,
  completedCount = 0,
  onLessonClick,
}) {
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  const firstUncompletedNode = learningPath.find(node => node.status !== 'completed');

  // Generate smooth serpentine path coordinates for all nodes
  const nodes = learningPath.map((item, index) => {
    const waveIndex = index % 4;
    let xPercent = 50;
    if (waveIndex === 0) xPercent = 22;
    else if (waveIndex === 1) xPercent = 50;
    else if (waveIndex === 2) xPercent = 78;
    else if (waveIndex === 3) xPercent = 50;

    const yPx = 100 + index * 160;

    return {
      ...item,
      x: xPercent,
      y: yPx,
      index,
    };
  });

  const totalHeight = Math.max(700, nodes.length * 160 + 220);

  const svgPathData = nodes.reduce((acc, curr, i) => {
    if (i === 0) return `M ${curr.x * 8} ${curr.y}`;
    const prev = nodes[i - 1];
    const cpY = (prev.y + curr.y) / 2;
    return `${acc} C ${prev.x * 8} ${cpY}, ${curr.x * 8} ${cpY}, ${curr.x * 8} ${curr.y}`;
  }, '');

  return (
    <div className={styles.mapSection}>
      {/* Background decorations */}
      <div className={styles.cloud1}>☁️</div>
      <div className={styles.cloud2}>☁️</div>
      <div className={styles.cloud3}>☁️</div>

      {/* Map Header Info */}
      <div className={styles.mapHeader}>
        <div className={styles.mapTitleGroup}>
          <Sparkles color="#FF9F43" size={24} />
          <h2>Your Adventure Road</h2>
        </div>
        <div className={styles.counterChip}>
          <Trophy size={18} color="#FFD700" />
          <span>{completedCount} / {learningPath.length} Completed</span>
        </div>
      </div>

      {/* Winding Map Canvas */}
      <div className={styles.mapContainer} style={{ height: `${totalHeight}px` }}>
        {/* SVG Curved Pathway */}
        <svg className={styles.svgLayer} viewBox={`0 0 800 ${totalHeight}`} preserveAspectRatio="none">
          <path
            d={svgPathData}
            fill="none"
            stroke="#FFE8CD"
            strokeWidth="28"
            strokeLinecap="round"
          />
          <path
            d={svgPathData}
            fill="none"
            stroke="#FF9F43"
            strokeWidth="10"
            strokeDasharray="14 10"
            strokeLinecap="round"
          />
        </svg>

        {/* Nodes Layer */}
        {nodes.map((node, i) => {
          const detail = node.lesson_detail || {};
          const isCompleted = node.status === 'completed';
          const isAvailable = node.status === 'available';
          const isLocked = node.status === 'locked';

          const isMilestone = (i + 1) % 4 === 0;

          return (
            <div
              key={node.id || i}
              className={styles.nodeWrapper}
              style={{ left: `${node.x}%`, top: `${node.y}px` }}
            >
              {/* Mascot Indicator on Current Unlocked Lesson */}
              {isAvailable && firstUncompletedNode && firstUncompletedNode.day_number === node.day_number && (
                <motion.div
                  className={styles.mascotFloating}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                >
                  <img src={owl} alt="MiGo Mascot" className={styles.owlPin} />
                  <span className={styles.startBadge}>START HERE!</span>
                </motion.div>
              )}

              {/* Node Main Button */}
              <motion.button
                className={`${styles.nodeButton} ${isCompleted ? styles.completedNode : isAvailable ? styles.availableNode : styles.lockedNode}`}
                whileHover={!isLocked ? { scale: 1.1 } : {}}
                whileTap={!isLocked ? { scale: 0.95 } : {}}
                disabled={isLocked}
                onClick={() => onLessonClick(node)}
              >
                <div className={styles.nodeEmoji}>
                  {detail.image_emoji || (isCompleted ? '⭐' : isAvailable ? '▶' : '🔒')}
                </div>

                <div className={styles.nodeStatusIcon}>
                  {isCompleted && <CheckCircle2 size={24} color="#1DD1A1" fill="#FFFFFF" />}
                  {isAvailable && <Play size={20} color="#FFFFFF" fill="#FFFFFF" />}
                  {isLocked && <Lock size={20} color="#A0A0A0" />}
                </div>
              </motion.button>

              {/* Lesson Label Card */}
              <div className={styles.nodeCard}>
                <span className={styles.dayLabel}>Lesson {node.day_number}</span>
                <span className={styles.nodeTitle}>{detail.title || `Lesson ${node.day_number}`}</span>
              </div>

              {/* Milestone Treasure Chest */}
              {isMilestone && (
                <motion.div
                  className={styles.milestoneWrap}
                  whileHover={{ scale: 1.15 }}
                  onClick={() => setSelectedMilestone(Math.floor((i + 1) / 4))}
                >
                  <img src={treasure} alt="Treasure Chest" className={styles.chestImg} />
                  <span className={styles.chestBadge}>Reward Chest!</span>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Milestone Modal */}
      <MilestoneModal
        isOpen={Boolean(selectedMilestone)}
        onClose={() => setSelectedMilestone(null)}
        milestoneNumber={selectedMilestone}
      />
    </div>
  );
}