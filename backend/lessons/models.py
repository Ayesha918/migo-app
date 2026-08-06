# backend/lessons/models.py
from django.db import models
from users.models import Learner

LANGUAGE_CHOICES = [
    ('en', 'English'), ('hi', 'Hindi'), ('kn', 'Kannada'),
    ('ta', 'Tamil'), 
]

DIFFICULTY_CHOICES = [
    ('beginner', 'Beginner'),
    ('intermediate', 'Intermediate'),
    ('advanced', 'Advanced'),
]

SKILL_CHOICES = [
    ('letter_recognition', 'Letter Recognition'),
    ('letter_sounds', 'Letter Sounds'),
    ('word_recognition', 'Word Recognition'),
    ('reading_fluency', 'Reading Fluency'),
    ('writing', 'Writing'),
    ('vocabulary', 'Vocabulary'),
    ('comprehension', 'Comprehension'),
    ('grammar', 'Grammar'),
    ('sentence_formation', 'Sentence Formation'),
]


class Lesson(models.Model):
    # lesson_id is deliberately separate from Django's internal `id` PK —
    # this is a stable, human-readable identifier used by the LLM recommender
    # later (12c), so recommendations reference something readable/auditable,
    # not just an opaque database row number.
    lesson_id = models.CharField(max_length=20, unique=True)  # e.g. "BEG-EN-001"

    title = models.CharField(max_length=200)
    module = models.CharField(max_length=100)  # e.g. "Alphabet Basics"
    difficulty = models.CharField(max_length=15, choices=DIFFICULTY_CHOICES)
    skill = models.CharField(max_length=30, choices=SKILL_CHOICES)
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES)
    estimated_time = models.PositiveIntegerField(help_text="Minutes")

    # Content fields
    audio_text = models.CharField(
        max_length=500, blank=True,
        help_text="Text to be spoken aloud via TTS for this lesson's instruction/content"
    )
    image_emoji = models.CharField(
        max_length=10, blank=True,
        help_text="Placeholder visual (emoji) until real illustrated images are designed"
    )

    # Dynamic visual-first lesson structured data fields
    lesson_type = models.CharField(max_length=50, default='tap_letters')
    internal_description = models.TextField(blank=True)
    prerequisite_id = models.CharField(max_length=20, blank=True, null=True)
    
    # Store complete interactive steps, visual options, audio text, and quiz details as database records
    activities_data = models.JSONField(default=list, blank=True)
    quiz_data = models.JSONField(default=list, blank=True)
    rewards_data = models.JSONField(default=dict, blank=True)
    visual_assets = models.JSONField(default=list, blank=True)
    audio_assets = models.JSONField(default=list, blank=True)

    # Quiz: stored as structured JSON — {question, options: [...], correct_index}
    quiz = models.JSONField(default=dict, blank=True)

    # Voice activity: what the learner should say aloud, checked via speech recognition
    voice_activity = models.CharField(
        max_length=300, blank=True,
        help_text="Word/phrase the learner is prompted to say aloud (speech recognition target)"
    )

    # Rich visual lesson fields
    concept_intro = models.TextField(blank=True, default="")
    real_life_context = models.CharField(max_length=300, blank=True, default="")
    image_visual = models.CharField(max_length=100, blank=True, default="")
    activities = models.JSONField(default=list, blank=True)
    mini_game = models.JSONField(default=dict, blank=True)
    quiz_bank = models.JSONField(default=list, blank=True)
    reward_xp = models.PositiveIntegerField(default=0)
    reward_stars = models.PositiveIntegerField(default=0)
    reward_coins = models.PositiveIntegerField(default=0)
    badge_code = models.CharField(max_length=50, blank=True, default="")
    encouragement_template = models.CharField(max_length=500, blank=True, default="")
    improvement_tip = models.CharField(max_length=500, blank=True, default="")

    order_in_level = models.PositiveIntegerField(default=0)  # sequencing within same difficulty+language

    class Meta:
        ordering = ['difficulty', 'language', 'order_in_level']

    def __str__(self):
        return f"[{self.lesson_id}] {self.title} ({self.difficulty}/{self.language})"

class LearningPath(models.Model):
    STATUS_CHOICES = [
        ('locked', 'Locked'),      # not yet reachable (previous day incomplete)
        ('available', 'Available'), # unlocked, not started
        ('completed', 'Completed'),
    ]

    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='learning_path')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='path_entries')
    day_number = models.PositiveIntegerField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='locked')
    assigned_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['learner', 'day_number']
        unique_together = ('learner', 'day_number')  # one lesson per day per learner

    def __str__(self):
        return f"{self.learner.learner_id} - Day {self.day_number} - {self.lesson.lesson_id} ({self.status})"