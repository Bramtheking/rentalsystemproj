from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count
from django.db import transaction, connection
from .models import Tenant, TenantHistory
from .serializers import (
    TenantSerializer, 
    TenantCreateSerializer,
    TenantHistorySerializer,
    MoveInOutSerializer
)
from units.models import Unit
import logging

logger = logging.getLogger(__name__)

class TenantViewSet(viewsets.ModelViewSet):
    """ViewSet for managing tenants"""
    permission_classes = [permissions.AllowAny]
    serializer_class = TenantSerializer
    
    def get_queryset(self):
        """Return tenants for the current user only"""
        try:
            return Tenant.objects.all()
        except Exception as e:
            logger.error(f"Error getting tenants queryset: {e}")
            return Tenant.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TenantCreateSerializer
        elif self.action in ['move_in', 'move_out']:
            return MoveInOutSerializer
        return TenantSerializer
    
    def perform_create(self, serializer):
        """Set the owner to the current user and handle unit assignment"""
        try:
            with transaction.atomic():
                # For now, don't require user authentication
                tenant = serializer.save()
                
                # If assigned to a unit, update unit status and tenant
                if tenant.current_unit:
                    unit = tenant.current_unit
                    unit.status = 'Occupied'
                    unit.tenant_name = tenant.full_name
                    unit.tenant_phone = tenant.phone
                    unit.tenant_email = tenant.email
                    unit.save()
                    
                    # Create tenant history record
                    TenantHistory.objects.create(
                        tenant=tenant,
                        unit=unit,
                        move_in_date=tenant.move_in_date or tenant.created_at.date(),
                        monthly_rent=tenant.monthly_rent or unit.rent,
                        security_deposit=tenant.security_deposit,
                    )
        except Exception as e:
            logger.error(f"Error in perform_create: {e}")
            raise
    
    def perform_update(self, serializer):
        """Handle unit changes during updates"""
        try:
            old_tenant = self.get_object()
            old_unit = old_tenant.current_unit
            
            with transaction.atomic():
                tenant = serializer.save()
                new_unit = tenant.current_unit
                
                # If unit changed
                if old_unit != new_unit:
                    # Clear old unit
                    if old_unit:
                        old_unit.status = 'Vacant'
                        old_unit.tenant_name = ''
                        old_unit.tenant_phone = ''
                        old_unit.tenant_email = ''
                        old_unit.save()
                    
                    # Set new unit
                    if new_unit:
                        new_unit.status = 'Occupied'
                        new_unit.tenant_name = tenant.full_name
                        new_unit.tenant_phone = tenant.phone
                        new_unit.tenant_email = tenant.email
                        new_unit.save()
        except Exception as e:
            logger.error(f"Error in perform_update: {e}")
            raise
    
    def perform_destroy(self, instance):
        """Clean up unit when tenant is deleted"""
        try:
            with transaction.atomic():
                if instance.current_unit:
                    unit = instance.current_unit
                    unit.status = 'Vacant'
                    unit.tenant_name = ''
                    unit.tenant_phone = ''
                    unit.tenant_email = ''
                    unit.save()
                instance.delete()
        except Exception as e:
            logger.error(f"Error in perform_destroy: {e}")
            raise
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get tenant statistics"""
        try:
            # Check if table exists
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name='tenants_tenant';
                """)
                if not cursor.fetchone():
                    logger.warning("Tenants table does not exist")
                    return Response({
                        'total_tenants': 0,
                        'active_tenants': 0,
                        'inactive_tenants': 0,
                        'moved_out_tenants': 0,
                    })

            queryset = self.get_queryset()
            stats = {
                'total_tenants': queryset.count(),
                'active_tenants': queryset.filter(status='Active').count(),
                'inactive_tenants': queryset.filter(status='Inactive').count(),
                'moved_out_tenants': queryset.filter(status='Moved Out').count(),
            }
            return Response(stats)
        except Exception as e:
            logger.error(f"Error in tenant stats: {e}")
            return Response({
                'total_tenants': 0,
                'active_tenants': 0,
                'inactive_tenants': 0,
                'moved_out_tenants': 0,
            })
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search tenants by various fields"""
        try:
            query = request.GET.get('q', '')
            status_filter = request.GET.get('status', '')
            
            queryset = self.get_queryset()
            
            if query:
                queryset = queryset.filter(
                    Q(tenant_id__icontains=query) |
                    Q(first_name__icontains=query) |
                    Q(last_name__icontains=query) |
                    Q(email__icontains=query)
                )
            
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in tenant search: {e}")
            return Response([])
    
    def list(self, request, *args, **kwargs):
        """Override list to handle errors gracefully"""
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error listing tenants: {e}")
            return Response([])

    @action(detail=False, methods=['get'])
    def available_units(self, request):
        """Get available units for tenant assignment"""
        try:
            units = Unit.objects.filter(status='Vacant')
            unit_data = [
                {
                    'id': unit.id,
                    'unit_id': unit.unit_id,
                    'name': unit.name,
                    'rent': float(unit.rent),
                }
                for unit in units
            ]
            return Response(unit_data)
        except Exception as e:
            logger.error(f"Error in available units: {e}")
            return Response([])


class TenantHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing tenant history"""
    permission_classes = [permissions.AllowAny]
    serializer_class = TenantHistorySerializer
    
    def get_queryset(self):
        """Return tenant history"""
        try:
            return TenantHistory.objects.all().select_related('tenant', 'unit')
        except Exception as e:
            logger.error(f"Error getting tenant history queryset: {e}")
            return TenantHistory.objects.none()
