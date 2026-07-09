// src/components/Assessment/Assessment.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useLearner } from '../../services/LearnerContext';
import ReadingAssessment from './ReadingAssessment';
import WritingAssessment from './WritingAssessment';
import ComprehensionAssessment from './ComprehensionAssessment';
import styles from './Assessment.module.css';

function Assessment() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { learner } = useLearner();

  if (!learner) {
    return (
      <div className={styles.page}>
        <p>Please log in first.</p>
        <button className={styles.nextButton} onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  const validTypes = ['reading', 'writing', 'comprehension'];
  if (!validTypes.includes(type)) {
    return (
      <div className={styles.page}>
        <p>Unknown assessment type.</p>
        <button className={styles.nextButton} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const commonProps = { learner };

  return (
    <div className={styles.page}>
      {type === 'reading' && <ReadingAssessment {...commonProps} />}
      {type === 'writing' && <WritingAssessment {...commonProps} />}
      {type === 'comprehension' && <ComprehensionAssessment {...commonProps} />}
    </div>
  );
}

export default Assessment;