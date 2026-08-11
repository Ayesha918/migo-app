# backend/users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('register', views.register_learner, name='register_learner'),
    path('search', views.search_learner, name='search_learner'),
    path('otp/send', views.send_otp, name='send_otp'),
    path('otp/verify', views.verify_otp, name='verify_otp'),
    path('check-device', views.check_device, name='check_device'),
    path('phone-learners', views.get_phone_learners, name='get_phone_learners'),
]