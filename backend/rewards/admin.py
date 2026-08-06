# backend/rewards/admin.py
from django.contrib import admin
from .models import RewardProfile, Achievement, LearnerAchievement, Goal, Certificate

admin.site.register(RewardProfile)
admin.site.register(Achievement)
admin.site.register(LearnerAchievement)
admin.site.register(Goal)
admin.site.register(Certificate)