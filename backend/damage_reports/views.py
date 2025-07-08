from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q, Sum, Count
from django.db import connection
from .models import DamageReport
from .serializers import DamageReportSerializer, DamageReportCreateSerializer
from units.models import Unit
import logging

logger = logging.getLogger(__name__)

class DamageReportViewSet(viewsets.ModelViewSet):
    serializer_class = DamageReportSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        try:
            return DamageReport.objects.all()
        except Exception as e:
            logger.error(f"Error getting damage reports queryset: {e}")
            return DamageReport.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return DamageReportCreateSerializer
        return DamageReportSerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get damage report statistics"""
        try:
            # Check if table exists
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name='damage_reports_damagereport';
                """)
                if not cursor.fetchone():
                    logger.warning("Damage reports table does not exist")
                    return Response({
                        'total_reports': 0,
                        'reported': 0,
                        'in_progress': 0,
                        'completed': 0,
                        'cancelled': 0,
                        'low_severity': 0,
                        'medium_severity': 0,
                        'high_severity': 0,
                        'critical_severity': 0,
                        'total_estimated_cost': 0,
                        'total_actual_cost': 0,
                    })

            queryset = self.get_queryset()
            
            stats = {
                'total_reports': queryset.count(),
                'reported': queryset.filter(status='reported').count(),
                'in_progress': queryset.filter(status='in_progress').count(),
                'completed': queryset.filter(status='completed').count(),
                'cancelled': queryset.filter(status='cancelled').count(),
                'low_severity': queryset.filter(severity='low').count(),
                'medium_severity': queryset.filter(severity='medium').count(),
                'high_severity': queryset.filter(severity='high').count(),
                'critical_severity': queryset.filter(severity='critical').count(),
                'total_estimated_cost': float(queryset.aggregate(total=Sum('estimated_cost'))['total'] or 0),
                'total_actual_cost': float(queryset.aggregate(total=Sum('actual_cost'))['total'] or 0),
            }
            return Response(stats)
        except Exception as e:
            logger.error(f"Error in damage report stats: {e}")
            return Response({
                'total_reports': 0,
                'reported': 0,
                'in_progress': 0,
                'completed': 0,
                'cancelled': 0,
                'low_severity': 0,
                'medium_severity': 0,
                'high_severity': 0,
                'critical_severity': 0,
                'total_estimated_cost': 0,
                'total_actual_cost': 0,
            })

    def list(self, request, *args, **kwargs):
        """Override list to handle errors gracefully"""
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error listing damage reports: {e}")
            return Response([])

    @action(detail=False, methods=['get'])
    def user_units(self, request):
        """Get units for damage report creation"""
        try:
            units = Unit.objects.all()
            unit_data = [
                {
                    'id': unit.id,
                    'unit_id': unit.unit_id,
                    'name': unit.name,
                }
                for unit in units
            ]
            return Response(unit_data)
        except Exception as e:
            logger.error(f"Error in user units: {e}")
            return Response([])

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search damage reports"""
        try:
            query = request.GET.get('q', '')
            status_filter = request.GET.get('status', '')
            severity_filter = request.GET.get('severity', '')
            
            queryset = self.get_queryset()
            
            if query:
                queryset = queryset.filter(
                    Q(report_id__icontains=query) |
                    Q(title__icontains=query) |
                    Q(description__icontains=query)
                )
            
            if status_filter and status_filter != 'All':
                queryset = queryset.filter(status=status_filter.lower())
            
            if severity_filter and severity_filter != 'All':
                queryset = queryset.filter(severity=severity_filter.lower())
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in damage report search: {e}")
            return Response([])
