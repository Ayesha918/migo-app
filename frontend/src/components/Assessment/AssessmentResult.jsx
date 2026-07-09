// src/components/Assessment/AssessmentResult.jsx
import { useNavigate } from 'react-router-dom';
import styles from './Assessment.module.css';

function getEncouragement(score) {
  if (score >= 80) return { emoji: '🌟', message: 'Excellent work!' };
  if (score >= 50) return { emoji: '👏', message: 'Good job! Keep practicing.' };
  return { emoji: '💪', message: "Nice try! Let's practice more." };
}

function AssessmentResult({ result, assessmentType }) {
  const navigate = useNavigate();
  const { emoji, message } = getEncouragement(result.score);

  return (
    <div className={styles.card} style={{ textAlign: 'center' }}>
      <div className={styles.resultEmoji}>{emoji}</div>
      <div className={styles.resultScore}>{result.score}%</div>
      <p className={styles.resultMessage}>{message}</p>
      <p style={{ color: '#999', marginBottom: 24 }}>
        {result.correct_count} out of {result.total_questions} correct
      </p>
      <button className={styles.nextButton} onClick={() => navigate('/dashboard')} type="button">
        Back to Dashboard
      </button>
    </div>
  );
}

export default AssessmentResult;