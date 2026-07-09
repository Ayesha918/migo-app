# backend/dashboard/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from users.models import Learner
from assessments.models import LiteracyProfile, AssessmentAttempt
from .serializers import DashboardSerializer


@api_view(['GET'])
def get_dashboard(request):
    """
    GET /api/dashboard/summary?learner_id=MG000001
    Returns everything the Dashboard screen needs in one call.
    """
    learner_id = request.query_params.get('learner_id', '').strip()
    if not learner_id:
        return Response({'error': 'learner_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    profile, _ = LiteracyProfile.objects.get_or_create(learner=learner)

    # Completion = how many of the 3 assessment types have at least one attempt
    completed_types = AssessmentAttempt.objects.filter(learner=learner).values_list(
        'assessment_type', flat=True
    ).distinct()
    completion_percent = round((len(set(completed_types)) / 3) * 100, 1)

    recent_activity = AssessmentAttempt.objects.filter(learner=learner).order_by('-completed_at')[:5]

    data = {
        'reading_score': profile.reading_score,
        'writing_score': profile.writing_score,
        'comprehension_score': profile.comprehension_score,
        'overall_score': profile.overall_score,
        'level': profile.level,
        'completion_percent': completion_percent,
        'recent_activity': recent_activity,
    }

    serializer = DashboardSerializer(data)
    return Response(serializer.data, status=status.HTTP_200_OK)