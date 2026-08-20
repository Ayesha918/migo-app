# backend/lessons/recommendation.py
from .models import Lesson, LearningPath
from assessments.models import LiteracyProfile


def get_llm_recommendations(learner):
    """
    Personalized recommendation engine simulating an LLM tutor.
    Recommends 10 lessons in paging batches based on progress and assessment scores.
    If the user has a weakness in writing (writing_score < 70), mixes writing lessons into their active milestone.
    """
    profile, _ = LiteracyProfile.objects.get_or_create(learner=learner)
    level = profile.level or 'beginner'
    language = learner.learning_language or 'en'

    # Retrieve scores (default to 100 if not completed yet)
    w_score = profile.writing_score if profile.writing_score is not None else 100

    # Determine weakness priorities
    has_writing_weakness = w_score < 70

    # Get all regular lessons for this level and language, excluding the assessments
    exclude_ids = [
        'BEG-ASSESS-EN', 'BEG-ASSESS-HI', 'BEG-ASSESS-KN', 'BEG-ASSESS-TA',
        'INT-ASSESS-EN', 'INT-ASSESS-HI', 'INT-ASSESS-KN', 'INT-ASSESS-TA',
        'ADV-ASSESS-EN', 'ADV-ASSESS-HI', 'ADV-ASSESS-KN', 'ADV-ASSESS-TA'
    ]
    all_lessons = Lesson.objects.filter(
        language=language, 
        difficulty=level
    ).exclude(
        lesson_id__in=exclude_ids
    ).order_by('order_in_level')

    total_lessons_count = all_lessons.count()

    # Count how many regular lessons the user has completed so far
    completed_count = LearningPath.objects.filter(
        learner=learner,
        status='completed'
    ).exclude(
        lesson__lesson_id__in=exclude_ids
    ).count()

    # Recommend in pages/batches of 10
    batch_index = completed_count // 10
    start_idx = batch_index * 10
    end_idx = start_idx + 10

    # Grab active page
    batch_lessons = all_lessons[start_idx:end_idx]
    result_ids = []

    # Identify weaknesses at the current user's level difficulty
    weaknesses = []
    if profile.writing_score is not None and profile.writing_score < 70:
        weaknesses.append({
            'skills': ['writing', 'sentence_formation'],
            'score': profile.writing_score
        })
    if profile.reading_score is not None and profile.reading_score < 70:
        weaknesses.append({
            'skills': ['letter_recognition', 'letter_sounds', 'word_recognition', 'reading_fluency'],
            'score': profile.reading_score
        })
    if profile.comprehension_score is not None and profile.comprehension_score < 70:
        weaknesses.append({
            'skills': ['comprehension', 'vocabulary'],
            'score': profile.comprehension_score
        })

    # Sort weaknesses by score (ascending) so the weakest skill is prioritized
    weaknesses.sort(key=lambda x: x['score'])

    result_ids = [l.lesson_id for l in batch_lessons]

    # Inject up to 2 uncompleted lessons for the weakest areas at the user's actual level
    injected_ids = []
    for weak in weaknesses:
        uncompleted_weak_lessons = Lesson.objects.filter(
            difficulty=level,
            skill__in=weak['skills'],
            language=language
        ).exclude(
            lesson_id__in=exclude_ids
        ).exclude(
            path_entries__learner=learner,
            path_entries__status='completed'
        ).order_by('order_in_level')[:2]
        
        for l in uncompleted_weak_lessons:
            injected_ids.append(l.lesson_id)
        
        if len(injected_ids) >= 2:
            break

    # Prioritize the weak-skill lessons by placing them at the beginning
    result_ids = injected_ids + result_ids

    # If the user completed all regular lessons (or this is the final page and they finished it)
    all_regular_completed = (completed_count >= total_lessons_count)
    
    # If all regular lessons of the level are completed, insert the level-specific assessment!
    if all_regular_completed:
        assessment_id = f"{level.upper()[:3]}-ASSESS-{language.upper()}"
        result_ids.append(assessment_id)

    # Fallback to English if not enough lessons in selected language (only for English learners)
    if language == 'en' and len(result_ids) < 10 and not all_regular_completed:
        needed = 10 - len(result_ids)
        fallback_lessons = Lesson.objects.filter(
            language='en', difficulty=level
        ).exclude(
            lesson_id__in=result_ids + exclude_ids
        )[:needed]
        result_ids.extend([l.lesson_id for l in fallback_lessons])

    # De-duplicate while preserving order
    seen = set()
    final_ids = []
    for lid in result_ids:
        if lid not in seen:
            seen.add(lid)
            final_ids.append(lid)

    return final_ids[:10]
