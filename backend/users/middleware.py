from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from .authentication import FirebaseAuthentication
import json


class FirebaseAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware to handle Firebase authentication for API requests
    """
    
    def process_request(self, request):
        # Skip authentication for certain paths
        skip_paths = ['/admin/', '/api/users/health/']
        
        if any(request.path.startswith(path) for path in skip_paths):
            return None
            
        # Only apply to API requests
        if not request.path.startswith('/api/'):
            return None
            
        # Skip for OPTIONS requests (CORS preflight)
        if request.method == 'OPTIONS':
            return None
            
        try:
            firebase_auth = FirebaseAuthentication()
            result = firebase_auth.authenticate(request)
            
            if result:
                user, token = result
                request.user = user
                request.firebase_token = token
                
        except Exception as e:
            return JsonResponse({
                'error': 'Authentication failed',
                'message': str(e)
            }, status=401)
            
        return None
