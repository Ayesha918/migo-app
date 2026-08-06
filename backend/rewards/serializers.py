# backend/rewards/serializers.py
from rest_framework import serializers
from .models import RewardProfile, LearnerAchievement, Achievement


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['code', 'title', 'description', 'icon_emoji']


class LearnerAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer()
    class Meta:
        model = LearnerAchievement
        fields = ['achievement', 'earned_at']


class RewardProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RewardProfile
        fields = ['stars', 'xp', 'coins', 'current_streak_days', 'longest_streak_days']