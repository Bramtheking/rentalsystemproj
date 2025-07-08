from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UnitViewSet, DamageReportViewSet

router = DefaultRouter()
router.register(r'units', UnitViewSet, basename='units')
router.register(r'damage-reports', DamageReportViewSet, basename='damage-reports')

urlpatterns = [
    path('', include(router.urls)),
]
