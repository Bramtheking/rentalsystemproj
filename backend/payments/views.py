from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q, Sum
from django.db import connection
from datetime import date
from .models import Payment
from .serializers import PaymentSerializer
from tenants.models import Tenant
import logging

logger = logging.getLogger(__name__)

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        try:
            return Payment.objects.all()
        except Exception as e:
            logger.error(f"Error getting payments queryset: {e}")
            return Payment.objects.none()

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get payment statistics"""
        try:
            # Check if table exists
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name='payments_payment';
                """)
                if not cursor.fetchone():
                    logger.warning("Payments table does not exist")
                    return Response({
                        'total_payments': 0,
                        'completed_payments': 0,
                        'pending_payments': 0,
                        'failed_payments': 0,
                        'overdue_payments': 0,
                        'total_amount': 0,
                        'pending_amount': 0,
                        'overdue_amount': 0,
                        'this_month_amount': 0,
                    })

            queryset = self.get_queryset()
            
            total_amount = queryset.filter(status='completed').aggregate(
                total=Sum('amount')
            )['total'] or 0
            
            pending_amount = queryset.filter(status='pending').aggregate(
                total=Sum('amount')
            )['total'] or 0
            
            overdue_amount = queryset.filter(
                status='pending',
                due_date__lt=date.today()
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            stats = {
                'total_payments': queryset.count(),
                'completed_payments': queryset.filter(status='completed').count(),
                'pending_payments': queryset.filter(status='pending').count(),
                'failed_payments': queryset.filter(status='failed').count(),
                'overdue_payments': queryset.filter(
                    status='pending',
                    due_date__lt=date.today()
                ).count(),
                'total_amount': float(total_amount),
                'pending_amount': float(pending_amount),
                'overdue_amount': float(overdue_amount),
                'this_month_amount': float(total_amount),  # Simplified
            }
            return Response(stats)
        except Exception as e:
            logger.error(f"Error in payment stats: {e}")
            return Response({
                'total_payments': 0,
                'completed_payments': 0,
                'pending_payments': 0,
                'failed_payments': 0,
                'overdue_payments': 0,
                'total_amount': 0,
                'pending_amount': 0,
                'overdue_amount': 0,
                'this_month_amount': 0,
            })

    @action(detail=False, methods=['get'])
    def monthly_stats(self, request):
        """Get monthly payment statistics"""
        try:
            # Return empty array for now
            return Response([])
        except Exception as e:
            logger.error(f"Error in monthly stats: {e}")
            return Response([])

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search payments"""
        try:
            query = request.GET.get('q', '')
            status_filter = request.GET.get('status', '')
            
            queryset = self.get_queryset()
            
            if query:
                queryset = queryset.filter(
                    Q(payment_id__icontains=query) |
                    Q(reference_number__icontains=query) |
                    Q(description__icontains=query)
                )
            
            if status_filter and status_filter != 'All':
                if status_filter == 'Overdue':
                    queryset = queryset.filter(
                        status='pending',
                        due_date__lt=date.today()
                    )
                else:
                    queryset = queryset.filter(status=status_filter.lower())
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in payment search: {e}")
            return Response([])

    def list(self, request, *args, **kwargs):
        """Override list to handle errors gracefully"""
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error listing payments: {e}")
            return Response([])

    @action(detail=False, methods=['get'])
    def tenant_units(self, request):
        """Get tenants and their units for payment creation"""
        try:
            tenants = Tenant.objects.filter(
                status='Active',
                current_unit__isnull=False
            ).select_related('current_unit')
            
            tenant_data = [
                {
                    'id': tenant.id,
                    'tenant_id': tenant.tenant_id,
                    'first_name': tenant.first_name,
                    'last_name': tenant.last_name,
                    'current_unit__id': tenant.current_unit.id if tenant.current_unit else None,
                    'current_unit__unit_id': tenant.current_unit.unit_id if tenant.current_unit else '',
                    'current_unit__name': tenant.current_unit.name if tenant.current_unit else '',
                }
                for tenant in tenants
            ]
            return Response(tenant_data)
        except Exception as e:
            logger.error(f"Error in tenant units: {e}")
            return Response([])
