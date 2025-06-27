#!/usr/bin/env python3
"""
Simple database setup script for the rental management system
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append('/opt/render/project/src/backend')

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rental_backend.settings')

# Setup Django
django.setup()

from django.core.management import execute_from_command_line
from units.models import Unit, DamageReport
from tenants.models import Tenant
from payments.models import Payment

def create_database():
    """Create database tables and sample data"""
    print("🔄 Creating database tables...")
    
    try:
        # Run migrations
        execute_from_command_line(['manage.py', 'makemigrations'])
        execute_from_command_line(['manage.py', 'migrate'])
        
        print("✅ Database tables created successfully!")
        
        # Create sample data
        print("🔄 Creating sample data...")
        
        # Create sample units
        if not Unit.objects.exists():
            units_data = [
                {'unit_id': 'A101', 'name': 'Apartment A101', 'unit_type': '1-bedroom', 'status': 'Vacant', 'rent': 1200},
                {'unit_id': 'A102', 'name': 'Apartment A102', 'unit_type': '2-bedroom', 'status': 'Occupied', 'rent': 1500},
                {'unit_id': 'B201', 'name': 'Apartment B201', 'unit_type': '1-bedroom', 'status': 'Vacant', 'rent': 1100},
            ]
            
            for unit_data in units_data:
                Unit.objects.create(**unit_data)
            
            print("✅ Sample units created!")
        
        # Create sample tenants
        if not Tenant.objects.exists():
            occupied_unit = Unit.objects.filter(status='Occupied').first()
            if occupied_unit:
                Tenant.objects.create(
                    tenant_id='T001',
                    first_name='John',
                    last_name='Doe',
                    email='john.doe@example.com',
                    phone='555-0123',
                    current_unit=occupied_unit,
                    status='Active',
                    monthly_rent=occupied_unit.rent,
                    security_deposit=occupied_unit.rent
                )
                print("✅ Sample tenant created!")
        
        print("🎉 Database setup completed successfully!")
        
    except Exception as e:
        print(f"❌ Error setting up database: {e}")
        return False
    
    return True

if __name__ == '__main__':
    create_database()
