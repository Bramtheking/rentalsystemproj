from django.contrib import admin
from .models import Unit, DamageReport

@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ['unit_number', 'address', 'rent_amount', 'bedrooms', 'bathrooms', 'is_occupied']
    list_filter = ['is_occupied', 'bedrooms', 'bathrooms']
    search_fields = ['unit_number', 'address']
    ordering = ['unit_number']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('unit_number', 'address', 'rent_amount')
        }),
        ('Unit Details', {
            'fields': ('bedrooms', 'bathrooms', 'square_feet', 'is_occupied')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(DamageReport)
class DamageReportAdmin(admin.ModelAdmin):
    list_display = ['unit', 'damage_type', 'reported_by', 'estimated_cost', 'is_resolved', 'created_at']
    list_filter = ['damage_type', 'is_resolved', 'created_at']
    search_fields = ['unit__unit_number', 'description']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Report Information', {
            'fields': ('unit', 'reported_by', 'damage_type', 'description')
        }),
        ('Cost & Status', {
            'fields': ('estimated_cost', 'is_resolved')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
