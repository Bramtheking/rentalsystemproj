#!/usr/bin/env python3
"""
Safe database migration script for Units module
This script creates the units and damage_reports tables safely
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

# Add the backend directory to Python path
backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_dir)

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rental_backend.settings')

# Setup Django
django.setup()

from django.db import connection
from django.core.management import call_command

def check_table_exists(table_name):
    """Check if a table exists in the database"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_name = %s
        """, [table_name])
        return cursor.fetchone()[0] > 0

def main():
    print("🚀 Starting Units Module Database Migration...")
    
    try:
        # Check if tables already exist
        units_exists = check_table_exists('units')
        damage_reports_exists = check_table_exists('damage_reports')
        
        if units_exists and damage_reports_exists:
            print("✅ Units tables already exist. No migration needed.")
            return
        
        print("📋 Creating database migrations...")
        
        # Make migrations for units app
        call_command('makemigrations', 'units', verbosity=1)
        
        print("🔄 Applying migrations...")
        
        # Apply migrations
        call_command('migrate', verbosity=1)
        
        print("✅ Units module database migration completed successfully!")
        print("📊 Tables created:")
        print("   - units (for property units)")
        print("   - damage_reports (for damage tracking)")
        
        # Verify tables were created
        if check_table_exists('units') and check_table_exists('damage_reports'):
            print("✅ All tables verified successfully!")
        else:
            print("⚠️  Warning: Some tables may not have been created properly.")
            
    except Exception as e:
        print(f"❌ Error during migration: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
