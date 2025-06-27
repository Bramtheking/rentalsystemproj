from rest_framework import serializers
from .models import Unit, DamageReport


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_unit_id(self, value):
        """Ensure unit_id is unique for this owner"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            # Check if unit_id already exists for this owner (excluding current instance)
            queryset = Unit.objects.filter(unit_id=value, owner=request.user)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError("Unit ID already exists for your account.")
        return value


class UnitCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = [
            'unit_id',
            'name',
            'unit_type',
            'status',
            'rent',
            'deposit',
            'location',
            'features',
            'notes',
            'tenant_name',
            'tenant_phone',
            'tenant_email',
        ]
    
    def validate_unit_id(self, value):
        """Ensure unit_id is unique for this owner"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if Unit.objects.filter(unit_id=value, owner=request.user).exists():
                raise serializers.ValidationError("Unit ID already exists for your account.")
        return value


class DamageReportSerializer(serializers.ModelSerializer):
    unit_name = serializers.CharField(source='unit.name', read_only=True)
    unit_id = serializers.CharField(source='unit.unit_id', read_only=True)
    
    class Meta:
        model = DamageReport
        fields = '__all__'
        read_only_fields = ['id', 'damage_id', 'created_at', 'updated_at']
    
    def validate_unit(self, value):
        """Ensure unit belongs to the current user"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if value.owner != request.user:
                raise serializers.ValidationError("You can only create damage reports for your own units.")
        return value


class DamageReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DamageReport
        fields = [
            'unit',
            'damage_type',
            'description',
            'priority',
            'reported_by',
            'report_date',
        ]
    
    def validate_unit(self, value):
        """Ensure unit belongs to the current user"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if value.owner != request.user:
                raise serializers.ValidationError("You can only create damage reports for your own units.")
        return value


class RepairRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DamageReport
        fields = [
            'repair_details',
            'repair_cost',
            'repair_date',
            'contractor_name',
            'contractor_phone',
            'status',
        ]
    
    def validate_status(self, value):
        """Ensure status is valid for repair recording"""
        if value not in ['In Progress', 'Repaired']:
            raise serializers.ValidationError("Status must be 'In Progress' or 'Repaired' when recording repairs.")
        return value
