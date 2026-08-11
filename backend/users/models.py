# backend/users/models.py
from django.db import models


class PhoneAccount(models.Model):
    phone_number = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.phone_number


class DeviceSession(models.Model):
    phone_account = models.ForeignKey(PhoneAccount, on_delete=models.CASCADE, related_name='devices')
    device_id = models.CharField(max_length=255)
    verified_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('phone_account', 'device_id')

    def __str__(self):
        return f"{self.phone_account.phone_number} - {self.device_id}"


class Learner(models.Model):
    LANGUAGE_CHOICES = [
        ('en', 'English'), ('hi', 'Hindi'), ('kn', 'Kannada'), ('ta', 'Tamil'),
    ]
    # ... existing fields ...
    known_language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='en')     # RENAMED from preferred_language
    learning_language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='en')   # NEW

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
    phone_account = models.ForeignKey(PhoneAccount, on_delete=models.SET_NULL, null=True, blank=True, related_name='learners')
    subscription_tier = models.CharField(max_length=20, default='Free') # Free, Pro, Premium

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


class StudySession(models.Model):
    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='study_sessions')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.learner.learner_id} - Session {self.id} ({self.duration_seconds}s)"


class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    pages = models.PositiveIntegerField()
    category = models.CharField(max_length=100) # Literature, Business, Science, Fiction
    level = models.CharField(max_length=50) # Beginner, Intermediate, Advanced
    emoji = models.CharField(max_length=10)
    content = models.TextField() # Paragraph content of the book for reading

    def __str__(self):
        return self.title


class SupportTicket(models.Model):
    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='tickets')
    subject = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.learner.name} - {self.subject}"


class CommunityPost(models.Model):
    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(Learner, blank=True, related_name='liked_posts')

    def __str__(self):
        return f"{self.learner.name}: {self.content[:30]}..."


class Notification(models.Model):
    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    description = models.TextField()
    unread = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    notification_type = models.CharField(max_length=50) # placement, welcome, milestone, payment

    def __str__(self):
        return f"{self.learner.name} - {self.title}"
