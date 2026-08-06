# backend/lessons/admin.py
from django.contrib import admin
from .models import Lesson
from .models import Lesson, LearningPath

@admin.register(LearningPath)
class LearningPathAdmin(admin.ModelAdmin):
    list_display = ('learner', 'day_number', 'lesson', 'status', 'assigned_at', 'completed_at')
    list_filter = ('status',)
    search_fields = ('learner__learner_id', 'lesson__lesson_id')

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('lesson_id', 'title', 'module', 'difficulty', 'skill', 'language', 'estimated_time', 'order_in_level')
    list_filter = ('difficulty', 'skill', 'language')
    search_fields = ('lesson_id', 'title', 'module')