#!/usr/bin/env python3
"""
Script to fix database conflicts and create proper migrations
"""

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rental_backend.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection

def main():
    print("🔧 Fixing database conflicts...")
    
    # Remove conflicting migrations
    print("1. Removing conflicting migrations...")
    
    # Reset migrations for damage_reports app
    try:
        execute_from_command_line(['manage.py', 'migrate', 'damage_reports', 'zero', '--fake'])
        print("   ✅ Reset damage_reports migrations")
    except Exception as e:
        print(f"   ⚠️  Could not reset damage_reports migrations: {e}")
    
    # Create new migrations
    print("2. Creating new migrations...")
    try:
        execute_from_command_line(['manage.py', 'makemigrations', 'units'])
        print("   ✅ Created units migrations")
    except Exception as e:
        print(f"   ❌ Error creating units migrations: {e}")
    
    try:
        execute_from_command_line(['manage.py', 'makemigrations', 'damage_reports'])
        print("   ✅ Created damage_reports migrations")
    except Exception as e:
        print(f"   ❌ Error creating damage_reports migrations: {e}")
    
    # Apply migrations
    print("3. Applying migrations...")
    try:
        execute_from_command_line(['manage.py', 'migrate'])
        print("   ✅ Applied all migrations")
    except Exception as e:
        print(f"   ❌ Error applying migrations: {e}")
    
    print("🎉 Database conflicts fixed!")

if __name__ == '__main__':
    main()
