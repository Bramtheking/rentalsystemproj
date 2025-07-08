from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q
from django.db import connection
from .models import Unit, DamageReport
from .serializers import UnitSerializer, DamageReportSerializer
import logging

logger = logging.getLogger(__name__)

class UnitViewSet(viewsets.ModelViewSet):
    serializer_class = UnitSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        try:
            return Unit.objects.all()
        except Exception as e:
            logger.error(f"Error getting units queryset: {e}")
            return Unit.objects.none()

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get unit statistics"""
        try:
            # Check if table exists
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name='units_unit';
                """)
                if not cursor.fetchone():
                    logger.warning("Units table does not exist")
                    return Response({
                        'total_units': 0,
                        'occupied_units': 0,
                        'vacant_units': 0,
                        'maintenance_units': 0,
                    })

            queryset = self.get_queryset()
            stats = {
                'total_units': queryset.count(),
                'occupied_units': queryset.filter(status='Occupied').count(),
                'vacant_units': queryset.filter(status='Vacant').count(),
                'maintenance_units': queryset.filter(status='Under Maintenance').count(),
            }
            logger.info(f"Unit stats: {stats}")
            return Response(stats)
        except Exception as e:
            logger.error(f"Error in unit stats: {e}")
            return Response({
                'total_units': 0,
                'occupied_units': 0,
                'vacant_units': 0,
                'maintenance_units': 0,
            })

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search units"""
        try:
            query = request.GET.get('q', '')
            status_filter = request.GET.get('status', '')
            
            queryset = self.get_queryset()
            
            if query:
                queryset = queryset.filter(
                    Q(unit_id__icontains=query) |
                    Q(name__icontains=query) |
                    Q(description__icontains=query)
                )
            
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in unit search: {e}")
            return Response([])

    def list(self, request, *args, **kwargs):
        """Override list to handle errors gracefully"""
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error listing units: {e}")
            return Response([])

    def create(self, request, *args, **kwargs):
        """Override create to handle errors gracefully"""
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error creating unit: {e}")
            return Response(
                {'error': 'Failed to create unit'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DamageReportViewSet(viewsets.ModelViewSet):
    serializer_class = DamageReportSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # For now, return all damage reports (no user filtering)
        return DamageReport.objects.all()

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get damage report statistics"""
        try:
            queryset = self.get_queryset()
            stats = {
                'total_reports': queryset.count(),
                'pending_reports': queryset.filter(status='Pending').count(),
                'in_progress_reports': queryset.filter(status='In Progress').count(),
                'repaired_reports': queryset.filter(repair_completed=True).count(),
                'unrepaired_reports': queryset.filter(repair_completed=False).count(),
            }
            return Response(stats)
        except Exception as e:
            logger.error(f"Error in damage report stats: {e}")
            return Response({
                'total_reports': 0,
                'pending_reports': 0,
                'in_progress_reports': 0,
                'repaired_reports': 0,
                'unrepaired_reports': 0,
            })

    @action(detail=False, methods=['get'])
    def filter(self, request):
        """Filter damage reports by status"""
        try:
            status_filter = request.GET.get('status', '')
            queryset = self.get_queryset()
            
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in damage report filter: {e}")
            return Response([])

    @action(detail=False, methods=['get'])
    def user_units(self, request):
        """Get units for damage report dropdown"""
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

    @action(detail=True, methods=['patch'])
    def record_repair(self, request, pk=None):
        """Record repair completion"""
        try:
            damage_report = self.get_object()
            damage_report.repair_completed = True
            damage_report.repair_date = request.data.get('repair_date')
            damage_report.repair_cost = request.data.get('repair_cost', 0)
            damage_report.repair_notes = request.data.get('repair_notes', '')
            damage_report.status = 'Completed'
            damage_report.save()
            
            serializer = self.get_serializer(damage_report)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in record repair: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
