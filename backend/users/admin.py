from django.contrib import admin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'full_name', 'firebase_uid', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['email', 'first_name', 'last_name', 'firebase_uid']
    readonly_fields = ['firebase_uid', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Firebase Info', {
            'fields': ('firebase_uid', 'email')
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'phone_number', 'company_name')
        }),
        ('Profile', {
            'fields': ('profile_picture_url', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
