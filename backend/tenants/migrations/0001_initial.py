# Generated migration for tenants app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('units', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Tenant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tenant_id', models.CharField(max_length=50, unique=True)),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(max_length=20)),
                ('national_id', models.CharField(blank=True, max_length=20)),
                ('date_of_birth', models.DateField(blank=True, null=True)),
                ('gender', models.CharField(blank=True, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')], max_length=10)),
                ('permanent_address', models.TextField(blank=True)),
                ('emergency_contact_name', models.CharField(blank=True, max_length=200)),
                ('emergency_contact_phone', models.CharField(blank=True, max_length=20)),
                ('emergency_contact_relationship', models.CharField(blank=True, max_length=100)),
                ('occupation', models.CharField(blank=True, max_length=200)),
                ('employer_name', models.CharField(blank=True, max_length=200)),
                ('employer_phone', models.CharField(blank=True, max_length=20)),
                ('monthly_income', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('status', models.CharField(choices=[('Active', 'Active'), ('Inactive', 'Inactive'), ('Moved Out', 'Moved Out')], default='Active', max_length=20)),
                ('move_in_date', models.DateField(blank=True, null=True)),
                ('move_out_date', models.DateField(blank=True, null=True)),
                ('lease_start_date', models.DateField(blank=True, null=True)),
                ('lease_end_date', models.DateField(blank=True, null=True)),
                ('security_deposit', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('monthly_rent', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('current_unit', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='current_tenant', to='units.unit')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tenants', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'tenants',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='TenantHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('move_in_date', models.DateField()),
                ('move_out_date', models.DateField(blank=True, null=True)),
                ('monthly_rent', models.DecimalField(decimal_places=2, max_digits=10)),
                ('security_deposit', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('move_out_reason', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tenant_history', to=settings.AUTH_USER_MODEL)),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='history', to='tenants.tenant')),
                ('unit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tenant_history', to='units.unit')),
            ],
            options={
                'db_table': 'tenant_history',
                'ordering': ['-move_in_date'],
            },
        ),
    ]
