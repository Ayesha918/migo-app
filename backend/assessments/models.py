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
        ('te', 'Telugu'),      
        ('ml', 'Malayalam'),
    ]

    QUESTION_TYPES = [
        ('mcq', 'Multiple Choice'),
        ('text_input', 'Text Input'),
    ]

    SKILL_TAGS = [
        ('letter_recognition', 'Letter Recognition'),
        ('word_recognition', 'Word Recognition'),
        ('literal_comprehension', 'Literal Comprehension'),
        ('inferential_comprehension', 'Inferential Comprehension'),
        ('writing_fluency', 'Writing Fluency'),
        ('writing_vocabulary', 'Writing Vocabulary'),
    ]

    assessment_type = models.CharField(
        max_length=20,
        choices=ASSESSMENT_TYPES
    )

    language = models.CharField(
        max_length=2,
        choices=LANGUAGE_CHOICES
    )

    # Links the SAME question across its different language versions.
    group_key = models.CharField(max_length=50)

    # Used by Comprehension (the story) — blank for Reading/Writing
    passage_text = models.TextField(blank=True, null=True)

    question_text = models.CharField(max_length=500)

    question_type = models.CharField(
        max_length=20,
        choices=QUESTION_TYPES
    )

    skill_tag = models.CharField(
        max_length=30,
        choices=SKILL_TAGS,
        blank=True,
        null=True
    )

    # MCQ options — blank for text_input questions
    option_a = models.CharField(max_length=200, blank=True, null=True)
    option_b = models.CharField(max_length=200, blank=True, null=True)
    option_c = models.CharField(max_length=200, blank=True, null=True)
    option_d = models.CharField(max_length=200, blank=True, null=True)

    # For MCQ: 'A'/'B'/'C'/'D'
    # For text_input: minimum word count as a string, e.g. '3'
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
    is_initial = models.BooleanField(default=False)
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

    def recalculate_from_skills(self):
        breakdowns = {sb.skill_tag: sb.score for sb in self.learner.skill_breakdowns.all()}

        reading_components = [breakdowns.get('letter_recognition'), breakdowns.get('word_recognition')]
        reading_components = [v for v in reading_components if v is not None]
        if reading_components:
            self.reading_score = round(sum(reading_components) / len(reading_components), 1)

        comprehension_components = [breakdowns.get('literal_comprehension'), breakdowns.get('inferential_comprehension')]
        comprehension_components = [v for v in comprehension_components if v is not None]
        if comprehension_components:
            self.comprehension_score = round(sum(comprehension_components) / len(comprehension_components), 1)

        writing_components = [breakdowns.get('writing_fluency'), breakdowns.get('writing_vocabulary')]
        writing_components = [v for v in writing_components if v is not None]
        if writing_components:
            self.writing_score = round(sum(writing_components) / len(writing_components), 1)

        self.recalculate()

    def recalculate(self):
        self.overall_score = round((self.reading_score + self.writing_score + self.comprehension_score) / 3, 1)
        if self.overall_score <= 40:
            self.level = 'beginner'
        elif self.overall_score <= 70:
            self.level = 'intermediate'
        else:
            self.level = 'advanced'
        self.save()

    def __str__(self):
        return f"{self.learner.learner_id} - {self.level} ({self.overall_score}%)"

class SeenQuestion(models.Model):
    """
    Tracks which specific AssessmentQuestion rows a learner has already
    received, per assessment type + language, so we can avoid repeats
    until the pool is exhausted.
    """
    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='seen_questions')
    question = models.ForeignKey(AssessmentQuestion, on_delete=models.CASCADE)
    seen_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('learner', 'question')  # never record the same pair twice

    def __str__(self):
        return f"{self.learner.learner_id} saw Q{self.question.id}"
    
class SkillBreakdown(models.Model):
    BAND_CHOICES = [
        ('weak', 'Weak'),
        ('average', 'Average'),
        ('strong', 'Strong'),
    ]
    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='skill_breakdowns')
    skill_tag = models.CharField(max_length=30)
    score = models.FloatField()
    band = models.CharField(max_length=10, choices=BAND_CHOICES)
    attempts_counted = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('learner', 'skill_tag')

    def update_with(self, new_score):
        if self.attempts_counted == 0:
            self.score = new_score
        else:
            self.score = round((self.score * 0.6) + (new_score * 0.4), 1)
        self.attempts_counted += 1
        self.band = self._band_for(self.score)
        self.save()

    @staticmethod
    def _band_for(score):
        if score < 40:
            return 'weak'
        elif score < 70:
            return 'average'
        return 'strong'

    def __str__(self):
        return f"{self.learner.learner_id} - {self.skill_tag} - {self.band}"