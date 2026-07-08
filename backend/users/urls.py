# backend/users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('register', views.register_learner, name='register_learner'),
    path('search', views.search_learner, name='search_learner'),
]