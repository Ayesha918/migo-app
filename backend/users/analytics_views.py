# backend/users/analytics_views.py
import json
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Sum
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from users.models import Learner, StudySession
from assessments.models import LiteracyProfile, AssessmentAttempt
from lessons.models import LearningPath
from assessments.prediction import predict_learner_trajectory


@api_view(['POST'])
def start_session(request):
    """
    POST /api/session/start
    Body: { "learner_id": "MG000001" }
    """
    learner_id = request.data.get('learner_id', '').strip()
    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Check for existing open sessions and close them as a safety measure
    open_sessions = StudySession.objects.filter(learner=learner, end_time__isnull=True)
    for s in open_sessions:
        s.end_time = timezone.now()
        s.duration_seconds = max(0.0, (s.end_time - s.start_time).total_seconds())
        s.save()

    session = StudySession.objects.create(learner=learner, start_time=timezone.now())
    return Response({
        'session_id': session.id,
        'start_time': session.start_time
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def end_session(request):
    """
    POST /api/session/end
    Body: { "learner_id": "MG000001" }
    """
    learner_id = request.data.get('learner_id', '').strip()
    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    session = StudySession.objects.filter(learner=learner, end_time__isnull=True).order_by('-start_time').first()
    if not session:
        # Fallback: create a mock short session if none was open
        session = StudySession.objects.create(
            learner=learner,
            start_time=timezone.now() - timedelta(minutes=5),
            end_time=timezone.now(),
            duration_seconds=300.0
        )
    else:
        session.end_time = timezone.now()
        session.duration_seconds = max(5.0, (session.end_time - session.start_time).total_seconds())
        session.save()

    return Response({
        'session_id': session.id,
        'duration_seconds': session.duration_seconds
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def complete_lesson_api(request):
    """
    POST /api/lesson/complete
    Body: { "learner_id": "MG000001", "day_number": 1 }
    """
    from lessons.views import complete_lesson
    # Re-use existing complete_lesson view logic by passing request
    return complete_lesson(request._request)


@api_view(['POST'])
def submit_quiz_api(request):
    """
    POST /api/quiz/submit
    Body: { "learner_id": "MG000001", "assessment_type": "reading", "score": 85.0 }
    """
    learner_id = request.data.get('learner_id', '').strip()
    assessment_type = request.data.get('assessment_type', 'reading')
    score = float(request.data.get('score', 100.0))

    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    attempt = AssessmentAttempt.objects.create(
        learner=learner,
        assessment_type=assessment_type,
        language=learner.learning_language,
        score=score,
        total_questions=1,
        correct_count=1 if score >= 60 else 0,
    )

    return Response({
        'quiz_id': attempt.id,
        'score': attempt.score,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_user_analytics(request):
    """
    GET /api/user-analytics?learner_id=MG000001
    """
    learner_id = request.query_params.get('learner_id', '').strip()
    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    # 1. Total study hours
    total_seconds = StudySession.objects.filter(learner=learner).aggregate(total=Sum('duration_seconds'))['total'] or 0.0
    total_hours = round(total_seconds / 3600.0, 2)

    # 2. Avg daily study time (minutes)
    sessions = StudySession.objects.filter(learner=learner, duration_seconds__gt=0)
    unique_days = len(set(s.start_time.date() for s in sessions))
    avg_daily_mins = round((total_seconds / 60.0) / unique_days, 1) if unique_days else 0.0

    # 3. Lessons completed
    lessons_completed = LearningPath.objects.filter(learner=learner, status='completed').count()

    # 4. Learning consistency (last 7 days active percentage)
    last_7_days = [timezone.now().date() - timedelta(days=i) for i in range(7)]
    active_days_count = sum(1 for d in last_7_days if StudySession.objects.filter(learner=learner, start_time__date=d).exists())
    consistency = round((active_days_count / 7.0) * 100, 0)

    # 5. Profile scores
    profile, _ = LiteracyProfile.objects.get_or_create(learner=learner)
    reading_score = profile.reading_score
    writing_score = profile.writing_score
    overall_score = profile.overall_score

    # 6. Weekly study hours list (for Chart display)
    weekly_study_hours = []
    for d in reversed(last_7_days):
        day_secs = StudySession.objects.filter(learner=learner, start_time__date=d).aggregate(total=Sum('duration_seconds'))['total'] or 0.0
        weekly_study_hours.append({
            'name': d.strftime('%a'),
            'hours': round(day_secs / 3600.0, 2)
        })

    # 7. Quiz accuracy trend
    recent_attempts = AssessmentAttempt.objects.filter(learner=learner).order_by('-completed_at')[:10]
    quiz_accuracy_trend = [
        {'attempt': i + 1, 'score': a.score} for i, a in enumerate(reversed(recent_attempts))
    ]

    return Response({
        'total_study_hours': total_hours,
        'avg_daily_study_time': avg_daily_mins,
        'lessons_completed': lessons_completed,
        'learning_consistency': consistency,
        'reading_score': reading_score,
        'writing_score': writing_score,
        'overall_score': overall_score,
        'weekly_study_hours': weekly_study_hours,
        'quiz_accuracy_trend': quiz_accuracy_trend,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_predictions_dashboard(request):
    """
    GET /api/predictions?learner_id=MG000001&study_duration_seconds=1200
    """
    learner_id = request.query_params.get('learner_id', '').strip()
    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Calculate actual cumulative study time
    total_seconds = StudySession.objects.filter(learner=learner).aggregate(total=Sum('duration_seconds'))['total'] or 0.0

    study_duration_param = request.query_params.get('study_duration_seconds')
    if study_duration_param:
        try:
            total_seconds = float(study_duration_param)
        except ValueError:
            pass

    prediction = predict_learner_trajectory(learner, total_seconds)
    return Response(prediction, status=status.HTTP_200_OK)
