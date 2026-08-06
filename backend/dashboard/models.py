from django.db import models
from users.models import Learner

class SpeechAttempt(models.Model):
    attempt_id = models.AutoField(primary_key=True)
    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='speech_attempts')
    lesson_id = models.CharField(max_length=100, default='custom_practice')
    audio_path = models.CharField(max_length=255, blank=True, null=True)
    transcript = models.TextField(blank=True, null=True)
    confidence = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attempt {self.attempt_id} by {self.learner.learner_id} for {self.lesson_id}"

class PronunciationScore(models.Model):
    score_id = models.AutoField(primary_key=True)
    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='pronunciation_scores')
    lesson_id = models.CharField(max_length=100, default='custom_practice')
    expected_text = models.TextField()
    transcribed_text = models.TextField(blank=True, null=True)
    content_score = models.FloatField(default=0.0)
    pronunciation_score = models.FloatField(default=0.0)
    fluency_score = models.FloatField(default=0.0)
    speech_rate = models.FloatField(default=0.0)  # words per minute
    pause_count = models.IntegerField(default=0)
    overall_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Score {self.score_id} ({self.overall_score}%) for {self.learner.learner_id}"
