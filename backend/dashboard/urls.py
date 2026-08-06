# backend/dashboard/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('summary', views.get_dashboard, name='get_dashboard'),
    path('speech/upload', views.upload_speech, name='upload_speech'),
    path('speech/history/<str:learner_id>/', views.get_speech_history, name='get_speech_history'),
]