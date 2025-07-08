from django.contrib import admin
from .models import Tenant, TenantHistory


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ['tenant_id', 'full_name', 'email', 'phone', 'current_unit', 'status', 'owner', 'created_at']
    list_filter = ['status', 'gender', 'owner', 'created_at']
    search_fields = ['tenant_id', 'first_name', 'last_name', 'email', 'phone', 'national_id']
    readonly_fields = ['tenant_id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('tenant_id', 'first_name', 'last_name', 'email', 'phone', 'national_id', 'date_of_birth', 'gender', 'owner')
        }),
        ('Address & Emergency Contact', {
            'fields': ('permanent_address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship')
        }),
        ('Employment Information', {
            'fields': ('occupation', 'employer_name', 'employer_phone', 'monthly_income'),
            'classes': ('collapse',)
        }),
        ('Tenancy Information', {
            'fields': ('current_unit', 'status', 'move_in_date', 'move_out_date', 'lease_start_date', 'lease_end_date', 'security_deposit', 'monthly_rent')
        }),
        ('Additional Information', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(owner=request.user)


@admin.register(TenantHistory)
class TenantHistoryAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'unit', 'move_in_date', 'move_out_date', 'monthly_rent', 'owner']
    list_filter = ['move_in_date', 'move_out_date', 'owner']
    search_fields = ['tenant__first_name', 'tenant__last_name', 'unit__unit_id']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(owner=request.user)
