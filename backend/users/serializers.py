# backend/users/serializers.py
from rest_framework import serializers
from .models import Learner


class LearnerSerializer(serializers.ModelSerializer):
    phone_number = serializers.SerializerMethodField()

    class Meta:
        model = Learner
        fields = ['id', 'learner_id', 'name', 'age', 'known_language', 'learning_language', 'avatar', 'created_at', 'phone_number']
        read_only_fields = ['id', 'learner_id', 'created_at']

    def get_phone_number(self, obj):
        return obj.phone_account.phone_number if obj.phone_account else None