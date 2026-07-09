# backend/assessments/models.py
from django.db import models
from users.models import Learner


class AssessmentQuestion(models.Model):
    ASSESSMENT_TYPES = [
        ('reading', 'Reading'),
        ('writing', 'Writing'),
        ('comprehension', 'Comprehension'),
    ]
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('hi', 'Hindi'),
        ('kn', 'Kannada'),
        ('ta', 'Tamil'),
    ]
    QUESTION_TYPES = [
        ('mcq', 'Multiple Choice'),
        ('text_input', 'Text Input'),
    ]

    assessment_type = models.CharField(max_length=20, choices=ASSESSMENT_TYPES)
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES)

    # Links the SAME question across its different language versions.
    # e.g. all 4 language rows for "the cat word" share group_key='reading_word_1'
    group_key = models.CharField(max_length=50)

    # Used by Comprehension (the story) — blank for Reading/Writing
    passage_text = models.TextField(blank=True, null=True)

    question_text = models.CharField(max_length=500)
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)

    # MCQ options — blank for text_input questions
    option_a = models.CharField(max_length=200, blank=True, null=True)
    option_b = models.CharField(max_length=200, blank=True, null=True)
    option_c = models.CharField(max_length=200, blank=True, null=True)
    option_d = models.CharField(max_length=200, blank=True, null=True)

    # For mcq: 'A'/'B'/'C'/'D'. For text_input: minimum word count as a string, e.g. '3'
    correct_answer = models.CharField(max_length=200)

    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['assessment_type', 'order']

    def __str__(self):
        return f"[{self.assessment_type}/{self.language}] {self.question_text[:40]}"


class AssessmentAttempt(models.Model):
    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='assessment_attempts')
    assessment_type = models.CharField(max_length=20, choices=AssessmentQuestion.ASSESSMENT_TYPES)
    language = models.CharField(max_length=2, choices=AssessmentQuestion.LANGUAGE_CHOICES)
    score = models.FloatField()  # 0–100
    total_questions = models.PositiveIntegerField()
    correct_count = models.PositiveIntegerField()
    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.learner.learner_id} - {self.assessment_type} - {self.score}%"


class AssessmentResponse(models.Model):
    attempt = models.ForeignKey(AssessmentAttempt, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(AssessmentQuestion, on_delete=models.CASCADE)
    learner_answer = models.TextField()
    is_correct = models.BooleanField()

    def __str__(self):
        return f"{self.attempt} - Q{self.question.id}"


class LiteracyProfile(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    learner = models.OneToOneField(Learner, on_delete=models.CASCADE, related_name='literacy_profile')
    reading_score = models.FloatField(default=0)
    writing_score = models.FloatField(default=0)
    comprehension_score = models.FloatField(default=0)
    overall_score = models.FloatField(default=0)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    updated_at = models.DateTimeField(auto_now=True)

    def recalculate(self):
        """Recomputes overall score and level from the three component scores."""
        self.overall_score = round(
            (self.reading_score + self.writing_score + self.comprehension_score) / 3, 1
        )
        if self.overall_score <= 40:
            self.level = 'beginner'
        elif self.overall_score <= 70:
            self.level = 'intermediate'
        else:
            self.level = 'advanced'
        self.save()

    def __str__(self):
        return f"{self.learner.learner_id} - {self.level} ({self.overall_score}%)"
