# backend/assessments/admin.py
from django.contrib import admin
from .models import AssessmentQuestion, AssessmentAttempt, AssessmentResponse, LiteracyProfile
from .models import AssessmentQuestion, AssessmentAttempt, AssessmentResponse, LiteracyProfile, SkillBreakdown

@admin.register(SkillBreakdown)
class SkillBreakdownAdmin(admin.ModelAdmin):
    list_display = ('learner', 'skill_tag', 'score', 'band', 'attempts_counted', 'updated_at')
    list_filter = ('skill_tag', 'band')

@admin.register(AssessmentQuestion)
class AssessmentQuestionAdmin(admin.ModelAdmin):
    list_display = ('group_key', 'assessment_type', 'language', 'question_text', 'order')
    list_filter = ('assessment_type', 'language')
    search_fields = ('group_key', 'question_text')


@admin.register(AssessmentAttempt)
class AssessmentAttemptAdmin(admin.ModelAdmin):
    list_display = ('learner', 'assessment_type', 'language', 'score', 'completed_at')
    list_filter = ('assessment_type', 'language')


@admin.register(AssessmentResponse)
class AssessmentResponseAdmin(admin.ModelAdmin):
    list_display = ('attempt', 'question', 'learner_answer', 'is_correct')


@admin.register(LiteracyProfile)
class LiteracyProfileAdmin(admin.ModelAdmin):
    list_display = ('learner', 'reading_score', 'writing_score', 'comprehension_score', 'overall_score', 'level')