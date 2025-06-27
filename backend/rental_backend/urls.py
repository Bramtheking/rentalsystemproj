"""
URL configuration for rental_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'message': 'Django backend is running'
    })

def api_health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'message': 'API is working',
        'endpoints': [
            '/api/units/',
            '/api/tenants/',
            '/api/payments/',
            '/api/damage-reports/'
        ]
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health'),
    path('api/health/', api_health_check, name='api_health'),
    path('api/', include('users.urls')),
    path('api/', include('units.urls')),
    path('api/', include('tenants.urls')),
    path('api/', include('payments.urls')),
    path('api/', include('damage_reports.urls')),
]
