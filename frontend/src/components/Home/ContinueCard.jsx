// src/components/Home/ContinueCard.jsx

import styles from "./ContinueCard.module.css";
import { PlayCircle, BookOpen, Star } from "lucide-react";

export default function ContinueCard({ lesson, onContinue }) {
  return (
    <div className={styles.card}>
      <div className={styles.iconBox}>
        <BookOpen size={34} />
      </div>

      <div className={styles.content}>
        <span className={styles.label}>Continue Learning</span>

        <h2>
          {lesson?.title || "No lesson available"}
        </h2>

        <p>
          {lesson?.description ||
            "Complete today's lesson to unlock exciting rewards and continue your journey."}
        </p>

        <div className={styles.rewardRow}>
          <span>
            <Star size={16} fill="#FFD700" color="#FFD700" />
            +5 Stars
          </span>

          <span>⚡ +20 XP</span>
        </div>

        <button
          onClick={onContinue}
          className={styles.button}
          disabled={!lesson}
        >
          <PlayCircle size={20} />
          Continue
        </button>
      </div>
    </div>
  );
}