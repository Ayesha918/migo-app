# backend/dashboard/serializers.py
from rest_framework import serializers
from assessments.models import AssessmentAttempt


class RecentAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentAttempt
        fields = ['assessment_type', 'score', 'completed_at']


class DashboardSerializer(serializers.Serializer):
    """
     shapes a combined response for the Dashboard screen in one API call.
    """
    reading_score = serializers.FloatField()
    writing_score = serializers.FloatField()
    comprehension_score = serializers.FloatField()
    overall_score = serializers.FloatField()
    level = serializers.CharField()
    completion_percent = serializers.FloatField()
    recent_activity = RecentAttemptSerializer(many=True)
    assessment_status = serializers.DictField()

    # Module 3 analytics, gamification & progress monitoring fields
    lessons_completed = serializers.IntegerField()
    weekly_study_time = serializers.IntegerField()  # study time in minutes
    streak_count = serializers.IntegerField()
    xp_points = serializers.IntegerField()
    xp_target = serializers.IntegerField()
    virtual_coins = serializers.IntegerField()

    skills_radar = serializers.DictField()
    pronunciation_trend = serializers.ListField(child=serializers.FloatField())
    weekly_study_chart = serializers.ListField(child=serializers.IntegerField())
    reading_improvement = serializers.ListField(child=serializers.FloatField())
    writing_improvement = serializers.ListField(child=serializers.FloatField())
    speaking_improvement = serializers.ListField(child=serializers.FloatField())

    badges = serializers.ListField(child=serializers.DictField())
    leaderboard = serializers.ListField(child=serializers.DictField())
    ai_recommendation = serializers.CharField(allow_blank=True, required=False)