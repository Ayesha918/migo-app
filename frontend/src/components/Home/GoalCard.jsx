// src/components/Home/GoalCard.jsx

import styles from "./GoalCard.module.css";
import { Target, Gift } from "lucide-react";

export default function GoalCard({ completed, total }) {

    const percent =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);

    const remaining = total - completed;

    return (

        <div className={styles.card}>

            <div className={styles.icon}>
                <Target size={32} />
            </div>

            <h2>Today's Goal</h2>

            <p>

                Complete your learning journey and unlock new rewards.

            </p>

            <div className={styles.progressBar}>

                <div
                    className={styles.progress}
                    style={{
                        width: `${percent}%`,
                    }}
                />

            </div>

            <div className={styles.stats}>

                <span>

                    {completed}

                    /

                    {total}

                    Lessons

                </span>

                <span>

                    {percent}%

                </span>

            </div>

            <div className={styles.rewardBox}>

                <Gift size={22} />

                <div>

                    <strong>

                        Reward Waiting!

                    </strong>

                    <small>

                        {remaining > 0
                            ? `${remaining} lesson(s) to next reward`
                            : "Reward Unlocked 🎉"}

                    </small>

                </div>

            </div>

        </div>

    );

}