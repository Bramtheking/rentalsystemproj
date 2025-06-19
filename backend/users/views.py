from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse
from .models import CustomUser
from .serializers import UserSerializer


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    """Health check endpoint"""
    return JsonResponse({
        'status': 'healthy', 
        'message': 'RentPro Backend API is running',
        'version': '1.0'
    })


class UserProfileView(APIView):
    """Get or update user profile"""
    
    def get(self, request):
        try:
            serializer = UserSerializer(request.user)
            return Response({
                'success': True,
                'user': serializer.data
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Failed to get user profile',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request):
        try:
            serializer = UserSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Profile updated successfully',
                    'user': serializer.data
                })
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Failed to update user profile',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserSyncView(APIView):
    """Sync user with backend after Firebase authentication"""
    
    def post(self, request):
        try:
            # User is already created/updated by authentication middleware
            serializer = UserSerializer(request.user)
            return Response({
                'success': True,
                'message': 'User synced successfully',
                'user': serializer.data
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Failed to sync user',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def logout_view(request):
    """Logout endpoint"""
    return Response({
        'success': True,
        'message': 'Logged out successfully'
    })
