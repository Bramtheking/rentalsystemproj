from django.contrib import admin
from .models import Payment, PaymentReminder, Receipt


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['payment_id', 'tenant', 'unit', 'payment_type', 'amount', 'status', 'payment_date', 'owner']
    list_filter = ['status', 'payment_type', 'payment_method', 'payment_date', 'owner']
    search_fields = ['payment_id', 'tenant__first_name', 'tenant__last_name', 'unit__unit_id', 'reference_number']
    readonly_fields = ['payment_id', 'receipt_number', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('payment_id', 'tenant', 'unit', 'owner')
        }),
        ('Payment Details', {
            'fields': ('payment_type', 'amount', 'payment_method', 'status', 'payment_date', 'due_date')
        }),
        ('Additional Information', {
            'fields': ('description', 'reference_number', 'receipt_number')
        }),
        ('Late Fee Information', {
            'fields': ('late_fee_amount', 'days_late'),
            'classes': ('collapse',)
        }),
        ('Period Information', {
            'fields': ('period_start', 'period_end'),
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


@admin.register(PaymentReminder)
class PaymentReminderAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'reminder_type', 'sent_date', 'owner']
    list_filter = ['reminder_type', 'sent_date', 'owner']
    search_fields = ['tenant__first_name', 'tenant__last_name', 'message']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(owner=request.user)


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ['payment', 'generated_at']
    list_filter = ['generated_at']
    search_fields = ['payment__payment_id', 'payment__tenant__first_name', 'payment__tenant__last_name']
    readonly_fields = ['generated_at']
