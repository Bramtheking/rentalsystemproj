from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'message': 'RentPro API',
        'version': '1.0',
        'endpoints': {
            'users': '/api/users/',
            'health': '/api/users/health/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api_root'),
    path('api/users/', include('users.urls')),
]
