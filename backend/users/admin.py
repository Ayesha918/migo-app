# backend/users/admin.py
from django.contrib import admin
from .models import Learner


@admin.register(Learner)
class LearnerAdmin(admin.ModelAdmin):
    list_display = ('learner_id', 'name', 'age', 'preferred_language', 'avatar', 'created_at')
    search_fields = ('learner_id', 'name')
    list_filter = ('preferred_language', 'avatar')