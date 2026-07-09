# backend/dashboard/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('summary', views.get_dashboard, name='get_dashboard'),
]