from rest_framework import serializers
from .models import Payment, PaymentReminder, Receipt
from tenants.models import Tenant
from units.models import Unit


class PaymentSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.full_name', read_only=True)
    tenant_id = serializers.CharField(source='tenant.tenant_id', read_only=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True)
    unit_id = serializers.CharField(source='unit.unit_id', read_only=True)
    total_amount = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'payment_id', 'receipt_number', 'created_at', 'updated_at']
    
    def validate_tenant(self, value):
        """Ensure tenant belongs to the current user"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if value.owner != request.user:
                raise serializers.ValidationError("You can only create payments for your own tenants.")
        return value
    
    def validate_unit(self, value):
        """Ensure unit belongs to the current user"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if value.owner != request.user:
                raise serializers.ValidationError("You can only create payments for your own units.")
        return value
    
    def validate(self, data):
        """Validate that tenant is assigned to the unit"""
        tenant = data.get('tenant')
        unit = data.get('unit')
        
        if tenant and unit and tenant.current_unit != unit:
            raise serializers.ValidationError("The selected tenant is not assigned to the selected unit.")
        
        return data


class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'tenant',
            'unit',
            'payment_type',
            'amount',
            'payment_method',
            'status',
            'payment_date',
            'due_date',
            'description',
            'reference_number',
            'late_fee_amount',
            'days_late',
            'period_start',
            'period_end',
        ]
    
    def validate_tenant(self, value):
        """Ensure tenant belongs to the current user"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if value.owner != request.user:
                raise serializers.ValidationError("You can only create payments for your own tenants.")
        return value
    
    def validate_unit(self, value):
        """Ensure unit belongs to the current user"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if value.owner != request.user:
                raise serializers.ValidationError("You can only create payments for your own units.")
        return value


class PaymentReminderSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.full_name', read_only=True)
    
    class Meta:
        model = PaymentReminder
        fields = [
            'id',
            'tenant',
            'tenant_name',
            'payment',
            'reminder_type',
            'message',
            'sent_date',
        ]
        read_only_fields = ['id', 'sent_date']


class ReceiptSerializer(serializers.ModelSerializer):
    payment_details = PaymentSerializer(source='payment', read_only=True)
    
    class Meta:
        model = Receipt
        fields = [
            'id',
            'payment',
            'payment_details',
            'receipt_data',
            'generated_at',
        ]
        read_only_fields = ['id', 'generated_at']
