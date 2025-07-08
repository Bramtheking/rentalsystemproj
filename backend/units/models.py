from django.db import models
from django.contrib.auth.models import User

class Unit(models.Model):
    unit_number = models.CharField(max_length=20, unique=True)
    address = models.TextField()
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2)
    bedrooms = models.IntegerField()
    bathrooms = models.IntegerField()
    square_feet = models.IntegerField(null=True, blank=True)
    is_occupied = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Unit {self.unit_number}"

    class Meta:
        ordering = ['unit_number']

class DamageReport(models.Model):
    DAMAGE_TYPES = [
        ('minor', 'Minor'),
        ('major', 'Major'),
        ('critical', 'Critical'),
    ]
    
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='unit_damage_reports')
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_unit_damages')
    damage_type = models.CharField(max_length=20, choices=DAMAGE_TYPES)
    description = models.TextField()
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Damage Report for {self.unit.unit_number}"

    class Meta:
        ordering = ['-created_at']
