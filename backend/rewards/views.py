# backend/rewards/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from users.models import Learner
from .models import RewardProfile, LearnerAchievement
from .serializers import RewardProfileSerializer, LearnerAchievementSerializer


@api_view(['GET'])
def get_rewards_summary(request):
    """GET /api/rewards/summary?learner_id=MG000001"""
    learner_id = request.query_params.get('learner_id', '').strip()
    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    profile, _ = RewardProfile.objects.get_or_create(learner=learner)
    achievements = LearnerAchievement.objects.filter(learner=learner).order_by('-earned_at')

    return Response({
        'profile': RewardProfileSerializer(profile).data,
        'achievements': LearnerAchievementSerializer(achievements, many=True).data,
    }, status=status.HTTP_200_OK)