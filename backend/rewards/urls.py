# backend/rewards/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('summary', views.get_rewards_summary, name='get_rewards_summary'),
]