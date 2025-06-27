from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count
from django.db import transaction
from .models import Tenant, TenantHistory
from .serializers import (
    TenantSerializer, 
    TenantCreateSerializer,
    TenantHistorySerializer,
    MoveInOutSerializer
)
from units.models import Unit


class TenantViewSet(viewsets.ModelViewSet):
    """ViewSet for managing tenants"""
    permission_classes = [permissions.AllowAny]
    serializer_class = TenantSerializer
    
    def get_queryset(self):
        """Return tenants for the current user only"""
        return Tenant.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TenantCreateSerializer
        elif self.action in ['move_in', 'move_out']:
            return MoveInOutSerializer
        return TenantSerializer
    
    def perform_create(self, serializer):
        """Set the owner to the current user and handle unit assignment"""
        with transaction.atomic():
            tenant = serializer.save(owner=self.request.user)
            
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
                    owner=self.request.user
                )
    
    def perform_update(self, serializer):
        """Handle unit changes during updates"""
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
    
    def perform_destroy(self, instance):
        """Clean up unit when tenant is deleted"""
        with transaction.atomic():
            if instance.current_unit:
                unit = instance.current_unit
                unit.status = 'Vacant'
                unit.tenant_name = ''
                unit.tenant_phone = ''
                unit.tenant_email = ''
                unit.save()
            instance.delete()
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get tenant statistics"""
        try:
            queryset = self.get_queryset()
            stats = {
                'total_tenants': queryset.count(),
                'active_tenants': queryset.filter(status='Active').count(),
                'inactive_tenants': queryset.filter(status='Inactive').count(),
                'moved_out_tenants': queryset.filter(status='Moved Out').count(),
            }
            return Response(stats)
        except Exception as e:
            print(f"❌ Error in tenant stats: {e}")
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
            print(f"❌ Error in tenant search: {e}")
            return Response([])
    
    @action(detail=True, methods=['post'])
    def move_in(self, request, pk=None):
        """Move tenant into a unit"""
        tenant = self.get_object()
        serializer = MoveInOutSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            with transaction.atomic():
                unit = serializer.validated_data['unit']
                move_date = serializer.validated_data['move_date']
                monthly_rent = serializer.validated_data.get('monthly_rent', unit.rent)
                security_deposit = serializer.validated_data.get('security_deposit')
                lease_start_date = serializer.validated_data.get('lease_start_date')
                lease_end_date = serializer.validated_data.get('lease_end_date')
                
                # Check if unit is available
                if unit.status == 'Occupied' and unit.current_tenant != tenant:
                    return Response({
                        'success': False,
                        'message': 'Unit is already occupied'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Clear previous unit if any
                if tenant.current_unit and tenant.current_unit != unit:
                    old_unit = tenant.current_unit
                    old_unit.status = 'Vacant'
                    old_unit.tenant_name = ''
                    old_unit.tenant_phone = ''
                    old_unit.tenant_email = ''
                    old_unit.save()
                
                # Update tenant
                tenant.current_unit = unit
                tenant.status = 'Active'
                tenant.move_in_date = move_date
                tenant.monthly_rent = monthly_rent
                tenant.security_deposit = security_deposit
                tenant.lease_start_date = lease_start_date
                tenant.lease_end_date = lease_end_date
                tenant.save()
                
                # Update unit
                unit.status = 'Occupied'
                unit.tenant_name = tenant.full_name
                unit.tenant_phone = tenant.phone
                unit.tenant_email = tenant.email
                unit.save()
                
                # Create history record
                TenantHistory.objects.create(
                    tenant=tenant,
                    unit=unit,
                    move_in_date=move_date,
                    monthly_rent=monthly_rent,
                    security_deposit=security_deposit,
                    owner=request.user
                )
                
                return Response({
                    'success': True,
                    'message': 'Tenant moved in successfully',
                    'data': TenantSerializer(tenant).data
                })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def move_out(self, request, pk=None):
        """Move tenant out of current unit"""
        tenant = self.get_object()
        
        if not tenant.current_unit:
            return Response({
                'success': False,
                'message': 'Tenant is not currently assigned to any unit'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = MoveInOutSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            with transaction.atomic():
                move_date = serializer.validated_data['move_date']
                move_out_reason = serializer.validated_data.get('move_out_reason', '')
                
                # Update unit
                unit = tenant.current_unit
                unit.status = 'Vacant'
                unit.tenant_name = ''
                unit.tenant_phone = ''
                unit.tenant_email = ''
                unit.save()
                
                # Update tenant history
                history = TenantHistory.objects.filter(
                    tenant=tenant,
                    unit=unit,
                    move_out_date__isnull=True
                ).first()
                
                if history:
                    history.move_out_date = move_date
                    history.move_out_reason = move_out_reason
                    history.save()
                
                # Update tenant
                tenant.current_unit = None
                tenant.status = 'Moved Out'
                tenant.move_out_date = move_date
                tenant.save()
                
                return Response({
                    'success': True,
                    'message': 'Tenant moved out successfully',
                    'data': TenantSerializer(tenant).data
                })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
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
            print(f"❌ Error in available units: {e}")
            return Response([])


class TenantHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing tenant history"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TenantHistorySerializer
    
    def get_queryset(self):
        """Return tenant history for the current user only"""
        return TenantHistory.objects.filter(owner=self.request.user).select_related('tenant', 'unit')
