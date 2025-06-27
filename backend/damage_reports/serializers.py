from rest_framework import serializers
from .models import DamageReport
from units.serializers import UnitSerializer
from tenants.serializers import TenantSerializer

class DamageReportSerializer(serializers.ModelSerializer):
    unit_details = UnitSerializer(source='unit', read_only=True)
    tenant_details = TenantSerializer(source='tenant', read_only=True)
    
    class Meta:
        model = DamageReport
        fields = '__all__'

class DamageReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DamageReport
        fields = '__all__'
