// src/components/Register/ProgressBar.jsx
import styles from './Register.module.css';

function ProgressBar({ currentStep, totalSteps }) {
  return (
    <div className={styles.progressBar}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`${styles.progressSegment} ${
            index === currentStep ? styles.progressActive : ''
          } ${index < currentStep ? styles.progressDone : ''}`}
        />
      ))}
    </div>
  );
}

export default ProgressBar;