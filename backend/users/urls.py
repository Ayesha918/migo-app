# backend/users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('register', views.register_learner, name='register_learner'),
    path('search', views.search_learner, name='search_learner'),
    path('signup', views.signup_account, name='signup_account'),
    path('login', views.login_account, name='login_account'),
    path('check-device', views.check_device, name='check_device'),
    path('phone-learners', views.get_phone_learners, name='get_phone_learners'),
    path('books', views.list_books, name='list_books'),
    path('support/ticket', views.create_support_ticket, name='create_support_ticket'),
    path('community/posts', views.community_posts, name='community_posts'),
    path('community/posts/<int:post_id>/like', views.like_post, name='like_post'),
    path('notifications', views.manage_notifications, name='manage_notifications'),
    path('notifications/read-all', views.manage_notifications, name='read_all_notifications'),
    path('subscription/upgrade', views.upgrade_subscription, name='upgrade_subscription'),
    path('google-login', views.google_login, name='google_login'),
    path('tts', views.tts_proxy, name='tts_proxy'),
]