// src/components/Home/ProgressCard.jsx

import styles from "./ProgressCard.module.css";
import { TrendingUp, Award } from "lucide-react";

export default function ProgressCard({
    dashboard,
    completed,
    total
}) {

    const completion = dashboard?.completion_percent || 0;
    const level = dashboard?.level || "Beginner";
    const score = dashboard?.overall_score || 0;

    return (

        <div className={styles.card}>

            <div className={styles.header}>

                <TrendingUp size={28} />

                <h2>Learning Progress</h2>

            </div>

            <div className={styles.circleWrapper}>

                <div
                    className={styles.circle}
                    style={{
                        background: `conic-gradient(
                        #FF4D86 0%,
                        #FFB300 ${completion}%,
                        #ECECEC ${completion}%,
                        #ECECEC 100%
                     )`
                 }}
            >

                    <span>{completion}%</span>

                </div>

            </div>

            <div className={styles.info}>

                <div className={styles.row}>

                    <span>Current Level</span>

                    <strong>{level}</strong>

                </div>

                <div className={styles.row}>

                    <span>Lessons</span>

                    <strong>{completed} / {total}</strong>

                </div>

                <div className={styles.row}>

                    <span>Average Score</span>

                    <strong>{score}%</strong>

                </div>

            </div>

            <div className={styles.levelCard}>

                <Award size={24} />

                <div>

                    <strong>Keep Going!</strong>

                    <small>
                        You're making excellent progress.
                    </small>

                </div>

            </div>

        </div>

    );

}