from django.db import models
from users.models import CustomUser
from tenants.models import Tenant
from units.models import Unit
from decimal import Decimal


class Payment(models.Model):
    PAYMENT_TYPES = [
        ('rent', 'Rent Payment'),
        ('deposit', 'Security Deposit'),
        ('utility', 'Utility Payment'),
        ('maintenance', 'Maintenance Fee'),
        ('late_fee', 'Late Fee'),
        ('other', 'Other'),
    ]
    
    PAYMENT_METHODS = [
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('mobile_money', 'Mobile Money'),
        ('cheque', 'Cheque'),
        ('card', 'Card Payment'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    TYPE_CHOICES = [
        ('rent', 'Rent'),
        ('deposit', 'Security Deposit'),
        ('maintenance', 'Maintenance Fee'),
        ('other', 'Other'),
    ]
    
    # Basic Information
    payment_id = models.CharField(max_length=50, unique=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='payments', null=True, blank=True)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='payments', null=True, blank=True)
    
    # Payment Details
    payment_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='rent')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Dates
    payment_date = models.DateField()
    due_date = models.DateField()
    
    # Additional Information
    description = models.TextField(blank=True)
    reference_number = models.CharField(max_length=100, blank=True)
    receipt_number = models.CharField(max_length=100, blank=True)
    
    # Owner/Manager
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='payments')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-payment_date', '-created_at']
        
    def __str__(self):
        return f"{self.payment_id} - ${self.amount}"
    
    def save(self, *args, **kwargs):
        if not self.payment_id:
            # Generate payment ID: PAY-YYYY-XXX
            from datetime import datetime
            year = datetime.now().year
            count = Payment.objects.filter(
                payment_id__startswith=f'PAY-{year}-'
            ).count() + 1
            self.payment_id = f'PAY-{year}-{count:04d}'
        
        if not self.receipt_number:
            # Generate receipt number: RCP-YYYY-XXX
            from datetime import datetime
            year = datetime.now().year
            count = Payment.objects.filter(
                receipt_number__startswith=f'RCP-{year}-'
            ).count() + 1
            self.receipt_number = f'RCP-{year}-{count:04d}'
            
        super().save(*args, **kwargs)
    
    @property
    def total_amount(self):
        """Total amount including late fees"""
        return self.amount


class PaymentReminder(models.Model):
    """Model to track payment reminders sent to tenants"""
    REMINDER_TYPES = [
        ('due_soon', 'Due Soon'),
        ('overdue', 'Overdue'),
        ('final_notice', 'Final Notice'),
    ]
    
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='payment_reminders')
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='reminders', null=True, blank=True)
    reminder_type = models.CharField(max_length=20, choices=REMINDER_TYPES)
    message = models.TextField()
    sent_date = models.DateTimeField(auto_now_add=True)
    
    # Owner/Manager
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='payment_reminders')
    
    class Meta:
        db_table = 'payment_reminders'
        ordering = ['-sent_date']
        
    def __str__(self):
        return f"{self.tenant.full_name} - {self.get_reminder_type_display()}"


class Receipt(models.Model):
    """Model to store receipt information"""
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='receipt')
    receipt_data = models.JSONField()  # Store receipt details as JSON
    generated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'receipts'
        
    def __str__(self):
        return f"Receipt for {self.payment.payment_id}"
