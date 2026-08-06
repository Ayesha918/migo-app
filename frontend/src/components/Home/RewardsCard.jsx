// src/components/Home/RewardsCard.jsx

import styles from "./RewardsCard.module.css";
import { Star, Coins, Zap, Gift } from "lucide-react";

export default function RewardsCard({ rewards }) {

    const profile = rewards?.profile || {};

    const stars = profile.total_stars || 0;
    const coins = profile.coins || 0;
    const xp = profile.total_xp || 0;

    return (

        <div className={styles.card}>

            <div className={styles.header}>

                <Gift size={28} />

                <h2>Rewards</h2>

            </div>

            <div className={styles.rewardGrid}>

                <div className={styles.rewardItem}>

                    <Star
                        size={30}
                        color="#FFD93D"
                        fill="#FFD93D"
                    />

                    <h3>{stars}</h3>

                    <span>Stars</span>

                </div>

                <div className={styles.rewardItem}>

                    <Coins
                        size={30}
                        color="#FFB000"
                    />

                    <h3>{coins}</h3>

                    <span>Coins</span>

                </div>

                <div className={styles.rewardItem}>

                    <Zap
                        size={30}
                        color="#9B5DE5"
                    />

                    <h3>{xp}</h3>

                    <span>XP</span>

                </div>

            </div>

            <div className={styles.nextReward}>

                <Gift size={24}/>

                <div>

                    <strong>

                        Treasure Chest

                    </strong>

                    <small>

                        Collect more stars to unlock special rewards!

                    </small>

                </div>

            </div>

        </div>

    );

}