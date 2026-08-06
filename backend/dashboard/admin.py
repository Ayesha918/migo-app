from django.contrib import admin
from .models import SpeechAttempt, PronunciationScore

@admin.register(SpeechAttempt)
class SpeechAttemptAdmin(admin.ModelAdmin):
    list_display = ('attempt_id', 'learner', 'lesson_id', 'confidence', 'created_at')
    list_filter = ('lesson_id', 'created_at')
    search_fields = ('learner__learner_id', 'transcript')

@admin.register(PronunciationScore)
class PronunciationScoreAdmin(admin.ModelAdmin):
    list_display = ('score_id', 'learner', 'lesson_id', 'overall_score', 'created_at')
    list_filter = ('lesson_id', 'created_at')
    search_fields = ('learner__learner_id', 'expected_text', 'transcribed_text')
