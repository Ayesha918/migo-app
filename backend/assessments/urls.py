# backend/assessments/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('questions', views.get_questions, name='get_questions'),
    path('submit', views.submit_assessment, name='submit_assessment'),
]