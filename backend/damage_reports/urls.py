from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DamageReportViewSet

router = DefaultRouter()
router.register(r'damage-reports', DamageReportViewSet, basename='damage-reports')

urlpatterns = [
    path('', include(router.urls)),
]
