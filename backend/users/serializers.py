# backend/users/serializers.py
from rest_framework import serializers
from .models import Learner


class LearnerSerializer(serializers.ModelSerializer):
    phone_number = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()

    class Meta:
        model = Learner
        fields = ['id', 'learner_id', 'name', 'age', 'known_language', 'learning_language', 'avatar', 'created_at', 'phone_number', 'subscription_tier', 'level']
        read_only_fields = ['id', 'learner_id', 'created_at']

    def get_phone_number(self, obj):
        return obj.phone_account.phone_number if obj.phone_account else None

    def get_level(self, obj):
        from assessments.models import LiteracyProfile
        profile, _ = LiteracyProfile.objects.get_or_create(learner=obj)
        return profile.level