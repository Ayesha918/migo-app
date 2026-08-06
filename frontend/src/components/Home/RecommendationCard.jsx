// src/components/Home/RecommendationCard.jsx

import styles from "./RecommendationCard.module.css";
import { Sparkles, ArrowRightCircle } from "lucide-react";

export default function RecommendationCard({
    recommendation,
    onStart,
}) {

    if (!recommendation) {
        return (
            <div className={styles.card}>
                <h2>AI Recommendation</h2>

                <p>
                    Your personalized recommendation will appear here after your
                    learning path is generated.
                </p>
            </div>
        );
    }

    return (

        <div className={styles.card}>

            <div className={styles.header}>

                <Sparkles size={28} />

                <h2>AI Recommendation</h2>

            </div>

            <span className={styles.badge}>
                Recommended Next
            </span>

            <h3>
                {recommendation.title}
            </h3>

            <p className={styles.reason}>
                {recommendation.reason}
            </p>

            <button
                className={styles.button}
                onClick={onStart}
            >
                Start Lesson
                <ArrowRightCircle size={20}/>
            </button>

        </div>

    );

}