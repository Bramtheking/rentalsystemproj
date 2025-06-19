from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(models.Model):
    """
    Custom user model that stores Firebase user information
    """
    firebase_uid = models.CharField(max_length=128, unique=True, primary_key=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Profile information
    company_name = models.CharField(max_length=200, blank=True)
    profile_picture_url = models.URLField(blank=True)
    
    class Meta:
        db_table = 'users'
        
    def __str__(self):
        return f"{self.email} ({self.firebase_uid})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
