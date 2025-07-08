import firebase_admin
from firebase_admin import auth, credentials
from rest_framework import authentication, exceptions
from .models import CustomUser
import os
import json


# Initialize Firebase Admin SDK with better error handling
if not firebase_admin._apps:
    try:
        # Try to use service account key from environment
        if os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY'):
            service_account_info = json.loads(os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY'))
            cred = credentials.Certificate(service_account_info)
            firebase_admin.initialize_app(cred, {
                'projectId': 'rentalapp-fd6f1'
            })
            print("✅ Firebase initialized with service account")
        else:
            # For development/production without service account, use minimal config
            print("⚠️ No Firebase service account found, using minimal config")
            firebase_admin.initialize_app(options={'projectId': 'rentalapp-fd6f1'})
    except Exception as e:
        print(f"⚠️ Firebase initialization warning: {e}")
        # Initialize with minimal config as fallback
        try:
            firebase_admin.initialize_app(options={'projectId': 'rentalapp-fd6f1'})
            print("✅ Firebase initialized with minimal config")
        except Exception as e2:
            print(f"❌ Firebase initialization failed: {e2}")


class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
            
        token = auth_header.split(' ')[1]
        
        try:
            # Skip Firebase verification if no proper setup
            if not firebase_admin._apps:
                print("⚠️ Firebase not properly initialized, skipping auth")
                return None
                
            decoded_token = auth.verify_id_token(token)
            firebase_uid = decoded_token['uid']
            
            # Get or create user
            user, created = CustomUser.objects.get_or_create(
                firebase_uid=firebase_uid,
                defaults={
                    'email': decoded_token.get('email', ''),
                    'first_name': decoded_token.get('name', '').split(' ')[0] if decoded_token.get('name') else '',
                    'last_name': ' '.join(decoded_token.get('name', '').split(' ')[1:]) if decoded_token.get('name') and len(decoded_token.get('name', '').split(' ')) > 1 else '',
                }
            )
            
            # Update user info if it changed
            if not created:
                updated = False
                if user.email != decoded_token.get('email', ''):
                    user.email = decoded_token.get('email', '')
                    updated = True
                if updated:
                    user.save()
            
            return (user, token)
            
        except Exception as e:
            print(f"⚠️ Firebase auth error: {str(e)}")
            # Don't fail completely, just return None for unauthenticated
            return None
