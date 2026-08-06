# backend/assessments/serializers.py
from rest_framework import serializers
from .models import AssessmentQuestion, LiteracyProfile


class QuestionSerializer(serializers.ModelSerializer):
    """
    Used when SENDING questions to the frontend.
    Deliberately excludes correct_answer — the learner must never
    receive the answer key in the API response.
    """
    class Meta:
        model = AssessmentQuestion
        fields = [
            'id', 'assessment_type', 'language', 'group_key',
            'passage_text', 'question_text', 'question_type',
            'option_a', 'option_b', 'option_c', 'option_d', 'order',
            'skill_tag',   
        ]


class LiteracyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiteracyProfile
        fields = [
            'reading_score', 'writing_score', 'comprehension_score',
            'overall_score', 'level', 'updated_at',
        ]