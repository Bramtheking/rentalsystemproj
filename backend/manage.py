#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rental_backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    # Auto-create superuser for development
    if 'runserver' in sys.argv:
        try:
            from django.core.management import execute_from_command_line as exec_cmd
            from django.contrib.auth import get_user_model
            from django.db import connection
            
            # Check if database exists and is accessible
            try:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1")
                print("✅ Database connection successful")
            except Exception as e:
                print(f"❌ Database connection failed: {e}")
                
        except Exception as e:
            print(f"Database setup error: {e}")
    
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
