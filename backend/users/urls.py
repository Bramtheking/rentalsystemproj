from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('sync/', views.UserSyncView.as_view(), name='user_sync'),
    path('logout/', views.logout_view, name='logout'),
]
