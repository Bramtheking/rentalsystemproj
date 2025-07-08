from rest_framework import serializers
from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = CustomUser
        fields = [
            'firebase_uid',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'phone_number',
            'company_name',
            'profile_picture_url',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['firebase_uid', 'created_at', 'updated_at']


class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'firebase_uid',
            'email',
            'first_name',
            'last_name',
            'phone_number',
            'company_name',
        ]
