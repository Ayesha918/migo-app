"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# backend/config/urls.py
from django.contrib import admin
from django.urls import path, include
from users import analytics_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/assessments/', include('assessments.urls')),
    path('api/dashboard/', include('dashboard.urls')), 
    path('api/lessons/', include('lessons.urls')),
    path('api/rewards/', include('rewards.urls')),

    # Forecast Dashboard & Real-Time Tracking APIs
    path('api/predictions', analytics_views.get_predictions_dashboard, name='get_predictions_dashboard'),
    path('api/user-analytics', analytics_views.get_user_analytics, name='get_user_analytics'),
    path('api/session/start', analytics_views.start_session, name='start_session'),
    path('api/session/end', analytics_views.end_session, name='end_session'),
    path('api/lesson/complete', analytics_views.complete_lesson_api, name='complete_lesson_api'),
    path('api/quiz/submit', analytics_views.submit_quiz_api, name='submit_quiz_api'),
]