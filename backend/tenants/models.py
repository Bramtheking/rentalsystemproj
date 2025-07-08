from django.db import models
from users.models import CustomUser
from units.models import Unit


class Tenant(models.Model):
    """Simple Tenant model"""
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Moved Out', 'Moved Out'),
    ]
    
    # Basic Information
    tenant_id = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    national_id = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)
    
    # Address Information
    permanent_address = models.TextField(blank=True)
    emergency_contact_name = models.CharField(max_length=200, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    emergency_contact_relationship = models.CharField(max_length=100, blank=True)
    
    # Employment Information
    occupation = models.CharField(max_length=200, blank=True)
    employer_name = models.CharField(max_length=200, blank=True)
    employer_phone = models.CharField(max_length=20, blank=True)
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Tenancy Information
    current_unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True, blank=True, related_name='current_tenant')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    move_in_date = models.DateField(null=True, blank=True)
    move_out_date = models.DateField(null=True, blank=True)
    lease_start_date = models.DateField(null=True, blank=True)
    lease_end_date = models.DateField(null=True, blank=True)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Additional Information
    notes = models.TextField(blank=True)
    
    # Owner/Manager
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='tenants')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tenants'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.tenant_id} - {self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def save(self, *args, **kwargs):
        if not self.tenant_id:
            # Generate tenant ID: TNT-YYYY-XXX
            from datetime import datetime
            year = datetime.now().year
            count = Tenant.objects.filter(
                tenant_id__startswith=f'TNT-{year}-'
            ).count() + 1
            self.tenant_id = f'TNT-{year}-{count:03d}'
        super().save(*args, **kwargs)


class TenantHistory(models.Model):
    """Track tenant move-in/move-out history"""
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='history')
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='tenant_history')
    move_in_date = models.DateField()
    move_out_date = models.DateField(null=True, blank=True)
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    move_out_reason = models.TextField(blank=True)
    
    # Owner/Manager
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='tenant_history')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tenant_history'
        ordering = ['-move_in_date']
        
    def __str__(self):
        return f"{self.tenant.full_name} - {self.unit.unit_id}"
