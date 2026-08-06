# backend/rewards/models.py
from django.db import models
from django.utils import timezone
from users.models import Learner


class RewardProfile(models.Model):
    """One row per learner — the running gamification totals."""
    learner = models.OneToOneField(Learner, on_delete=models.CASCADE, related_name='reward_profile')
    stars = models.PositiveIntegerField(default=0)
    xp = models.PositiveIntegerField(default=0)
    coins = models.PositiveIntegerField(default=0)
    current_streak_days = models.PositiveIntegerField(default=0)
    longest_streak_days = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)

    def register_activity_today(self):
        """Call this once per day a learner completes any lesson/assessment."""
        today = timezone.now().date()
        if self.last_activity_date == today:
            return  # already counted today
        if self.last_activity_date == today - timezone.timedelta(days=1):
            self.current_streak_days += 1
        else:
            self.current_streak_days = 1  # streak broken or first ever activity
        self.longest_streak_days = max(self.longest_streak_days, self.current_streak_days)
        self.last_activity_date = today
        self.save()

    def add_rewards(self, stars=0, xp=0, coins=0):
        self.stars += stars
        self.xp += xp
        self.coins += coins
        self.save()

    def __str__(self):
        return f"{self.learner.learner_id}: {self.stars}⭐ {self.xp}XP {self.coins}🪙"


class Achievement(models.Model):
    """Badge definitions — static catalog, not per-learner."""
    code = models.CharField(max_length=50, unique=True)  # e.g. "first_lesson"
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=200)
    icon_emoji = models.CharField(max_length=10, default='🏆')

    def __str__(self):
        return self.title


class LearnerAchievement(models.Model):
    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('learner', 'achievement')


class Goal(models.Model):
    PERIOD_CHOICES = [('weekly', 'Weekly'), ('monthly', 'Monthly')]
    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='goals')
    period = models.CharField(max_length=10, choices=PERIOD_CHOICES)
    target_lessons = models.PositiveIntegerField(default=5)
    completed_lessons = models.PositiveIntegerField(default=0)
    period_start = models.DateField()
    period_end = models.DateField()
    achieved = models.BooleanField(default=False)


class Certificate(models.Model):
    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='certificates')
    level = models.CharField(max_length=20)  # e.g. "beginner" completed
    issued_at = models.DateTimeField(auto_now_add=True)