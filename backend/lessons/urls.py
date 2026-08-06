# backend/lessons/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_lessons, name='list_lessons'),
    path('path', views.get_learning_path, name='get_learning_path'),
    path('path/generate', views.generate_learning_path, name='generate_learning_path'),
    path('path/complete', views.complete_lesson, name='complete_lesson'),
    path('by-level', views.get_lessons_by_level, name='get_lessons_by_level'),
    path('<str:lesson_id>', views.get_lesson_detail, name='get_lesson_detail'),  # MUST be last
]