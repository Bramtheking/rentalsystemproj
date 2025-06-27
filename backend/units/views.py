from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q
from .models import Unit, DamageReport
from .serializers import UnitSerializer, DamageReportSerializer


class UnitViewSet(viewsets.ModelViewSet):
    serializer_class = UnitSerializer
    permission_classes = [AllowAny]  # ✅ Allow all for now

    def get_queryset(self):
        # For now, return all units (no user filtering)
        return Unit.objects.all()

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get unit statistics"""
        try:
            queryset = self.get_queryset()
            stats = {
                'total_units': queryset.count(),
                'occupied_units': queryset.filter(status='Occupied').count(),
                'vacant_units': queryset.filter(status='Vacant').count(),
                'maintenance_units': queryset.filter(status='Under Maintenance').count(),
            }
            return Response(stats)
        except Exception as e:
            print(f"❌ Error in unit stats: {e}")
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
            print(f"❌ Error in unit search: {e}")
            return Response([])


class DamageReportViewSet(viewsets.ModelViewSet):
    serializer_class = DamageReportSerializer
    permission_classes = [AllowAny]  # ✅ Allow all for now

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
            print(f"❌ Error in damage report stats: {e}")
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
            print(f"❌ Error in damage report filter: {e}")
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
            print(f"❌ Error in user units: {e}")
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
            print(f"❌ Error in record repair: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
