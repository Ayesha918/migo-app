from rest_framework import serializers
from .models import Lesson, LearningPath
from .helpers import generate_dynamic_assessment_quiz

class LessonSerializer(serializers.ModelSerializer):
    quiz_bank = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = '__all__'

    def get_quiz_bank(self, obj):
        is_graduation = obj.lesson_id in [
            'BEG-ASSESS-EN', 'BEG-ASSESS-HI', 'BEG-ASSESS-KN', 'BEG-ASSESS-TA',
            'INT-ASSESS-EN', 'INT-ASSESS-HI', 'INT-ASSESS-KN', 'INT-ASSESS-TA',
            'ADV-ASSESS-EN', 'ADV-ASSESS-HI', 'ADV-ASSESS-KN', 'ADV-ASSESS-TA'
        ]
        if is_graduation:
            try:
                return generate_dynamic_assessment_quiz(obj.difficulty, obj.language)
            except Exception as e:
                print("Error generating dynamic quiz:", e)
                return obj.quiz_bank
        return obj.quiz_bank
class LearningPathSerializer(serializers.ModelSerializer):
    lesson_detail = LessonSerializer(source='lesson', read_only=True)

    class Meta:
        model = LearningPath
        fields = ['id', 'day_number', 'status', 'assigned_at', 'completed_at', 'lesson_detail']