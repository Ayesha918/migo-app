# backend/dashboard/serializers.py
from rest_framework import serializers
from assessments.models import AssessmentAttempt, LiteracyProfile


class RecentAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentAttempt
        fields = ['assessment_type', 'score', 'completed_at']


class DashboardSerializer(serializers.Serializer):
    """
    Not tied to a single model — this serializer just shapes a combined
    response for the Dashboard screen in one API call.
    """
    reading_score = serializers.FloatField()
    writing_score = serializers.FloatField()
    comprehension_score = serializers.FloatField()
    overall_score = serializers.FloatField()
    level = serializers.CharField()
    completion_percent = serializers.FloatField()
    recent_activity = RecentAttemptSerializer(many=True)