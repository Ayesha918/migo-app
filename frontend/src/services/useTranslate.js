// src/services/useTranslate.js
import { useLearner } from './LearnerContext';
import { translate } from './translations';

/**
 * Returns a `t(key)` function bound to the current learner's preferred language.
 * Usage: const t = useTranslate(); t('welcome')
 */
function useTranslate() {
  const { learner } = useLearner();
  const langCode = learner?.known_language || 'en';   // UI follows what they KNOW
  return (key) => translate(key, langCode);
}
export default useTranslate;