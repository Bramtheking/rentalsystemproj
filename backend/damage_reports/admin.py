from django.contrib import admin
from .models import DamageReport

@admin.register(DamageReport)
class DamageReportAdmin(admin.ModelAdmin):
    list_display = ['title', 'severity', 'status', 'reported_by', 'assigned_to', 'estimated_cost', 'created_at']
    list_filter = ['severity', 'status', 'created_at']
    search_fields = ['title', 'description', 'location']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'location')
        }),
        ('Classification', {
            'fields': ('severity', 'status')
        }),
        ('Assignment', {
            'fields': ('reported_by', 'assigned_to')
        }),
        ('Cost Information', {
            'fields': ('estimated_cost', 'actual_cost')
        }),
        ('Dates', {
            'fields': ('completed_at',)
        }),
    )
