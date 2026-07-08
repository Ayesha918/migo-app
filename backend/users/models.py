# backend/users/models.py
from django.db import models


class Learner(models.Model):
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('hi', 'Hindi'),
        ('kn', 'Kannada'),
        ('ar', 'Arabic'),
    ]

    AVATAR_CHOICES = [
        ('boy', 'Boy'),
        ('girl', 'Girl'),
        ('grandmother', 'Grandmother'),
        ('grandfather', 'Grandfather'),
        ('teacher', 'Teacher'),
        ('book', 'Book'),
        ('lion', 'Lion'),
        ('tiger', 'Tiger'),
        ('apple', 'Apple'),
        ('flower', 'Flower'),
        ('star', 'Star'),
        ('migo', 'MiGo Mascot'),
    ]

    learner_id = models.CharField(max_length=10, unique=True, editable=False)
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    preferred_language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES)
    avatar = models.CharField(max_length=20, choices=AVATAR_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.learner_id:
            self.learner_id = self._generate_learner_id()
        super().save(*args, **kwargs)

    def _generate_learner_id(self):
        """
        Generates sequential IDs like MG000001, MG000002, ...
        Based on the current highest existing numeric suffix, not row count,
        so deletions never cause ID collisions.
        """
        last_learner = Learner.objects.order_by('-id').first()
        if last_learner and last_learner.learner_id:
            last_number = int(last_learner.learner_id.replace('MG', ''))
        else:
            last_number = 0
        new_number = last_number + 1
        return f"MG{new_number:06d}"

    def __str__(self):
        return f"{self.learner_id} - {self.name}"