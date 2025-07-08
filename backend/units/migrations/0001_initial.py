# Generated migration for units app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Unit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('unit_id', models.CharField(max_length=50)),
                ('name', models.CharField(max_length=200)),
                ('unit_type', models.CharField(choices=[('studio', 'Studio'), ('1-bedroom', '1 Bedroom'), ('2-bedroom', '2 Bedroom'), ('3-bedroom', '3 Bedroom'), ('4-bedroom', '4 Bedroom')], max_length=20)),
                ('status', models.CharField(choices=[('Vacant', 'Vacant'), ('Occupied', 'Occupied'), ('Under Maintenance', 'Under Maintenance')], default='Vacant', max_length=20)),
                ('rent', models.DecimalField(decimal_places=2, max_digits=10)),
                ('deposit', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('location', models.CharField(blank=True, max_length=300)),
                ('features', models.TextField(blank=True)),
                ('notes', models.TextField(blank=True)),
                ('tenant_name', models.CharField(blank=True, max_length=200)),
                ('tenant_phone', models.CharField(blank=True, max_length=20)),
                ('tenant_email', models.EmailField(blank=True, max_length=254)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='units', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'units',
            },
        ),
        migrations.CreateModel(
            name='DamageReport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('damage_id', models.CharField(max_length=50, unique=True)),
                ('damage_type', models.CharField(choices=[('plumbing', 'Plumbing'), ('electrical', 'Electrical'), ('structural', 'Structural'), ('appliance', 'Appliance'), ('other', 'Other')], max_length=20)),
                ('description', models.TextField()),
                ('priority', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')], max_length=10)),
                ('status', models.CharField(choices=[('Pending', 'Pending'), ('In Progress', 'In Progress'), ('Repaired', 'Repaired')], default='Pending', max_length=20)),
                ('reported_by', models.CharField(max_length=200)),
                ('report_date', models.DateField()),
                ('repair_details', models.TextField(blank=True)),
                ('repair_cost', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('repair_date', models.DateField(blank=True, null=True)),
                ('contractor_name', models.CharField(blank=True, max_length=200)),
                ('contractor_phone', models.CharField(blank=True, max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='damage_reports', to=settings.AUTH_USER_MODEL)),
                ('unit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='damage_reports', to='units.unit')),
            ],
            options={
                'db_table': 'damage_reports',
                'ordering': ['-report_date', '-created_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='unit',
            constraint=models.UniqueConstraint(fields=('unit_id', 'owner'), name='unique_unit_per_owner'),
        ),
    ]
