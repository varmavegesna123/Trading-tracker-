from django.urls import path
from . import views

urlpatterns = [
    path('auth/signup', views.signup_view, name='signup'),
    path('auth/signup/', views.signup_view, name='signup_slash'),
    path('auth/login', views.login_view, name='login'),
    path('auth/login/', views.login_view, name='login_slash'),
    path('auth/social', views.social_auth_view, name='social_auth'),
    path('auth/social/', views.social_auth_view, name='social_auth_slash'),
    path('auth/verify-otp', views.verify_otp_view, name='verify_otp'),
    path('auth/verify-otp/', views.verify_otp_view, name='verify_otp_slash'),
    path('auth/resend-otp', views.resend_otp_view, name='resend_otp'),
    path('auth/resend-otp/', views.resend_otp_view, name='resend_otp_slash'),
    path('data', views.data_sync_view, name='data_sync'),
    path('data/', views.data_sync_view, name='data_sync_slash'),
]
