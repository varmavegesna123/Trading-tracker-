import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_wsgi_application()
app = application

# Auto-initialize SQLite tables on Vercel ephemeral serverless instances if no external DB configured
if os.getenv('VERCEL') == '1' and not (os.getenv('DATABASE_URL') or os.getenv('POSTGRES_URL')):
    try:
        from django.core.management import call_command
        call_command('migrate', interactive=False)
    except Exception as e:
        print(f"Vercel DB auto-migration notice: {e}")


