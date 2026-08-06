# backend/lessons/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Lesson
from .serializers import LessonSerializer
from users.models import Learner
from .models import Lesson, LearningPath
from .serializers import LessonSerializer, LearningPathSerializer
from rewards.models import RewardProfile, Achievement, LearnerAchievement


@api_view(['GET'])
def get_learning_path(request):
    """
    GET /api/lessons/path?learner_id=MG000001
    Returns the learner's full day-by-day path, ordered.
    """
    learner_id = request.query_params.get('learner_id', '').strip()
    if not learner_id:
        return Response({'error': 'learner_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    from assessments.models import LiteracyProfile
    profile, _ = LiteracyProfile.objects.get_or_create(learner=learner)
    
    path = LearningPath.objects.filter(learner=learner).order_by('day_number')
    
    if path.exists():
        first_entry = path.first()
        # Wipe and regenerate if difficulty does not match the learner's current profile level
        if first_entry.lesson.difficulty != profile.level:
            path.delete()
            from .recommendation import get_llm_recommendations
            recommended_ids = get_llm_recommendations(learner)
            lessons_by_id = {l.lesson_id: l for l in Lesson.objects.filter(lesson_id__in=recommended_ids)}
            ordered_lessons = [lessons_by_id[lid] for lid in recommended_ids if lid in lessons_by_id]
            for i, lesson in enumerate(ordered_lessons):
                LearningPath.objects.create(
                    learner=learner,
                    lesson=lesson,
                    day_number=i + 1,
                    status='available' if i == 0 else 'locked'
                )
            path = LearningPath.objects.filter(learner=learner).order_by('day_number')

    serializer = LearningPathSerializer(path, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def generate_learning_path(request):
    """
    POST /api/lessons/path/generate
    Body: { "learner_id": "MG000001" }
    """
    learner_id = request.data.get('learner_id')
    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    from .recommendation import get_llm_recommendations
    recommended_ids = get_llm_recommendations(learner)

    if not recommended_ids:
        return Response(
            {'error': 'No available lessons to assign for this language/level.'},
            status=status.HTTP_404_NOT_FOUND
        )

    lessons_by_id = {l.lesson_id: l for l in Lesson.objects.filter(lesson_id__in=recommended_ids)}
    ordered_lessons = [lessons_by_id[lid] for lid in recommended_ids if lid in lessons_by_id]

    last_day = LearningPath.objects.filter(learner=learner).order_by('-day_number').first()
    next_day = (last_day.day_number + 1) if last_day else 1

    created_entries = []
    for i, lesson in enumerate(ordered_lessons):
        is_first_day = (next_day + i == 1)
        prev_completed = False
        if not is_first_day:
            prev_entry = LearningPath.objects.filter(learner=learner, day_number=next_day + i - 1).first()
            if prev_entry and prev_entry.status == 'completed':
                prev_completed = True
        status_val = 'available' if (is_first_day or prev_completed) else 'locked'

        entry = LearningPath.objects.create(
            learner=learner,
            lesson=lesson,
            day_number=next_day + i,
            status=status_val,
        )
        created_entries.append(entry)

    serializer = LearningPathSerializer(created_entries, many=True)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def list_lessons(request):
    """
    GET /api/lessons/?difficulty=beginner&language=en
    Returns all lessons matching the filters.
    """
    difficulty = request.query_params.get('difficulty')
    language = request.query_params.get('language', 'en')

    lessons = Lesson.objects.filter(language=language)
    if difficulty:
        lessons = lessons.filter(difficulty=difficulty)

    serializer = LessonSerializer(lessons, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_lesson_detail(request, lesson_id):
    """GET /api/lessons/BEG-EN-001"""
    try:
        lesson = Lesson.objects.get(lesson_id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({'error': 'Lesson not found.'}, status=status.HTTP_404_NOT_FOUND)

    is_graduation = lesson_id in [
        'BEG-ASSESS-EN', 'BEG-ASSESS-HI', 'BEG-ASSESS-KN', 'BEG-ASSESS-TA',
        'INT-ASSESS-EN', 'INT-ASSESS-HI', 'INT-ASSESS-KN', 'INT-ASSESS-TA',
        'ADV-ASSESS-EN', 'ADV-ASSESS-HI', 'ADV-ASSESS-KN', 'ADV-ASSESS-TA'
    ]
    if is_graduation:
        from .helpers import generate_dynamic_assessment_quiz
        try:
            lesson.quiz_bank = generate_dynamic_assessment_quiz(lesson.difficulty, lesson.language)
        except Exception as e:
            print("Error generating dynamic quiz inside get_lesson_detail:", e)

    serializer = LessonSerializer(lesson)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT'])
def complete_lesson(request):
    """
    PUT /api/lessons/path/complete
    Body: { "learner_id": "MG000001", "day_number": 1 }
    Marks a lesson completed, awards points, and unlocks level milestones.
    """
    learner_id = request.data.get('learner_id')
    day_number = request.data.get('day_number')

    try:
        day_number = int(day_number)
    except (TypeError, ValueError):
        return Response({'error': 'day_number must be an integer.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        entry = LearningPath.objects.get(learner=learner, day_number=day_number)
    except LearningPath.DoesNotExist:
        return Response({'error': 'Learning path entry not found.'}, status=status.HTTP_404_NOT_FOUND)

    from django.utils import timezone
    entry.status = 'completed'
    entry.completed_at = timezone.now()
    entry.save()

    next_entry = LearningPath.objects.filter(learner=learner, day_number=day_number + 1).first()
    if next_entry:
        next_entry.status = 'available'
        next_entry.save()

    # ---- Rewards ----
    reward_profile, _ = RewardProfile.objects.get_or_create(learner=learner)
    reward_profile.add_rewards(stars=3, xp=10, coins=2)
    reward_profile.register_activity_today()

    # Achievements update
    total_completed = LearningPath.objects.filter(learner=learner, status='completed').count()
    if total_completed == 1:
        badge, _ = Achievement.objects.get_or_create(
            code='first_lesson',
            defaults={'title': 'First Step', 'description': 'Completed your first lesson!', 'icon_emoji': '🎉'}
        )
        LearnerAchievement.objects.get_or_create(learner=learner, achievement=badge)
    elif total_completed == 10:
        badge, _ = Achievement.objects.get_or_create(
            code='ten_lessons',
            defaults={'title': 'Getting Strong', 'description': 'Completed 10 lessons!', 'icon_emoji': '💪'}
        )
        LearnerAchievement.objects.get_or_create(learner=learner, achievement=badge)

    is_graduation = entry.lesson.lesson_id in [
        'BEG-ASSESS-EN', 'BEG-ASSESS-HI', 'BEG-ASSESS-KN', 'BEG-ASSESS-TA',
        'INT-ASSESS-EN', 'INT-ASSESS-HI', 'INT-ASSESS-KN', 'INT-ASSESS-TA',
        'ADV-ASSESS-EN', 'ADV-ASSESS-HI', 'ADV-ASSESS-KN', 'ADV-ASSESS-TA'
    ]
    if is_graduation:
        badge_code = f"{entry.lesson.difficulty}_completed_cert"
        badge_title = f"{entry.lesson.difficulty.capitalize()} Graduate 🎓"
        badge_desc = f"Successfully passed the final {entry.lesson.difficulty.capitalize()} level graduation assessment!"
        badge, _ = Achievement.objects.get_or_create(
            code=badge_code,
            defaults={'title': badge_title, 'description': badge_desc, 'icon_emoji': '🎓'}
        )
        LearnerAchievement.objects.get_or_create(learner=learner, achievement=badge)

        from assessments.models import LiteracyProfile
        profile = LiteracyProfile.objects.filter(learner=learner).first()
        if profile:
            old_lvl = profile.level.lower() if profile.level else 'beginner'
            if old_lvl == 'beginner':
                profile.level = 'intermediate'
                profile.overall_score = max(profile.overall_score, 45.0)
            elif old_lvl == 'intermediate':
                profile.level = 'advanced'
                profile.overall_score = max(profile.overall_score, 75.0)
            elif old_lvl == 'advanced':
                profile.overall_score = 100.0
            profile.save()

    return Response(LearningPathSerializer(entry).data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_lessons_by_level(request):
    """
    GET /api/lessons/by-level?level=beginner&learner_id=MG000001
    Returns all lessons of a specific difficulty level with status values adjusted 
    according to the learner's level and progress.
    """
    learner_id = request.query_params.get('learner_id', '').strip()
    level = request.query_params.get('level', 'beginner').strip().lower()

    if not learner_id:
        return Response({'error': 'learner_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    from assessments.models import LiteracyProfile
    profile, _ = LiteracyProfile.objects.get_or_create(learner=learner)

    # Map difficulties to comparison integers
    level_hierarchy = {'beginner': 1, 'intermediate': 2, 'advanced': 3}
    user_level_val = level_hierarchy.get(profile.level.lower(), 1)
    req_level_val = level_hierarchy.get(level, 1)

    # Filter lessons in user's learning language matching requested difficulty level
    lessons = Lesson.objects.filter(
        language=learner.learning_language,
        difficulty=level
    ).order_by('order_in_level')

    # Get user's learning path details to map actual locks for their current level
    user_path = {
        lp.lesson.lesson_id: lp.status 
        for lp in LearningPath.objects.filter(learner=learner)
    }

    results = []
    for idx, lesson in enumerate(lessons):
        # Default behavior:
        # If user's current level is higher than requested level, all are fully unlocked reviewable
        if user_level_val > req_level_val:
            status_val = 'completed'
        # If user's current level is lower than requested level, all are locked
        elif user_level_val < req_level_val:
            status_val = 'locked'
        # If user is currently on this level:
        else:
            status_val = user_path.get(lesson.lesson_id, 'locked')
            if lesson.lesson_id not in user_path and idx == 0:
                status_val = 'available'

        results.append({
            'id': lesson.id,
            'day_number': idx + 1,
            'status': status_val,
            'lesson_detail': LessonSerializer(lesson).data
        })

    return Response(results, status=status.HTTP_200_OK)