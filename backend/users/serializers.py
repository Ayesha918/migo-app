# backend/users/serializers.py
from rest_framework import serializers
from .models import Learner


class LearnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Learner
        fields = ['id', 'learner_id', 'name', 'age', 'known_language','learning_language', 'avatar', 'created_at']
        read_only_fields = ['id', 'learner_id', 'created_at']