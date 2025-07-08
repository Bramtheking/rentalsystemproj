from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TenantViewSet, TenantHistoryViewSet

router = DefaultRouter()
router.register(r'tenants', TenantViewSet, basename='tenants')
router.register(r'tenant-history', TenantHistoryViewSet, basename='tenant-history')

urlpatterns = [
    path('', include(router.urls)),
]
