from rest_framework import serializers
from .models import Tenant, TenantHistory
from units.models import Unit


class TenantSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    unit_name = serializers.CharField(source='current_unit.name', read_only=True)
    unit_id = serializers.CharField(source='current_unit.unit_id', read_only=True)
    
    class Meta:
        model = Tenant
        fields = '__all__'
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']
    
    def validate_current_unit(self, value):
        """Ensure unit belongs to the current user and is available"""
        if value:
            request = self.context.get('request')
            if request and hasattr(request, 'user'):
                if value.owner != request.user:
                    raise serializers.ValidationError("You can only assign your own units to tenants.")
                
                # Check if unit is already occupied (excluding current tenant)
                if self.instance:
                    # Editing existing tenant
                    if value.status == 'Occupied' and value.current_tenant and value.current_tenant != self.instance:
                        raise serializers.ValidationError("This unit is already occupied by another tenant.")
                else:
                    # Creating new tenant
                    if value.status == 'Occupied' and value.current_tenant:
                        raise serializers.ValidationError("This unit is already occupied.")
        return value


class TenantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'national_id',
            'date_of_birth',
            'gender',
            'permanent_address',
            'emergency_contact_name',
            'emergency_contact_phone',
            'emergency_contact_relationship',
            'occupation',
            'employer_name',
            'employer_phone',
            'monthly_income',
            'current_unit',
            'status',
            'move_in_date',
            'lease_start_date',
            'lease_end_date',
            'security_deposit',
            'monthly_rent',
            'notes',
        ]
    
    def validate_current_unit(self, value):
        """Ensure unit belongs to the current user and is available"""
        if value:
            request = self.context.get('request')
            if request and hasattr(request, 'user'):
                if value.owner != request.user:
                    raise serializers.ValidationError("You can only assign your own units to tenants.")
                if value.status == 'Occupied' and value.current_tenant:
                    raise serializers.ValidationError("This unit is already occupied.")
        return value


class TenantHistorySerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.full_name', read_only=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True)
    unit_id = serializers.CharField(source='unit.unit_id', read_only=True)
    
    class Meta:
        model = TenantHistory
        fields = [
            'id',
            'tenant',
            'tenant_name',
            'unit',
            'unit_name',
            'unit_id',
            'move_in_date',
            'move_out_date',
            'monthly_rent',
            'security_deposit',
            'move_out_reason',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MoveInOutSerializer(serializers.Serializer):
    """Serializer for move-in/move-out operations"""
    unit = serializers.PrimaryKeyRelatedField(queryset=Unit.objects.none())
    move_date = serializers.DateField()
    monthly_rent = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    security_deposit = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    lease_start_date = serializers.DateField(required=False)
    lease_end_date = serializers.DateField(required=False)
    move_out_reason = serializers.CharField(required=False, allow_blank=True)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            self.fields['unit'].queryset = Unit.objects.filter(owner=request.user)
