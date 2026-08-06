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

    if has_writing_weakness:
        # Separate writing and core lessons inside this page, prioritize mixing writing
        batch_writing = [l for l in batch_lessons if l.skill == 'writing']
        batch_core = [l for l in batch_lessons if l.skill != 'writing']
        result_ids = [l.lesson_id for l in batch_core] + [l.lesson_id for l in batch_writing]
    else:
        result_ids = [l.lesson_id for l in batch_lessons]

    # Inject beginner writing lessons if user has extremely low writing score (< 60)
    if w_score < 60:
        uncompleted_beg_writing = Lesson.objects.filter(
            difficulty='beginner',
            skill='writing',
            language=language
        ).exclude(
            path_entries__learner=learner,
            path_entries__status='completed'
        ).order_by('order_in_level')[:2]
        
        beg_writing_ids = [l.lesson_id for l in uncompleted_beg_writing]
        result_ids = beg_writing_ids + result_ids

    # If the user completed all regular lessons (or this is the final page and they finished it)
    all_regular_completed = (completed_count >= total_lessons_count)
    
    # If all regular lessons of the level are completed, insert the level-specific assessment!
    if all_regular_completed:
        assessment_id = f"{level.upper()}-ASSESSMENT-{language.upper()}"
        result_ids.append(assessment_id)

    # Fallback to English if not enough lessons in selected language
    if len(result_ids) < 10 and not all_regular_completed:
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
