import os
import django
import time
import psutil
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'memoryleak_tool.settings')
django.setup()

from dashboard_app.models import MemoryRecord

while True:
    mem = psutil.virtual_memory()
    used = mem.used / (1024 * 1024)

    # Save in DB
    MemoryRecord.objects.create(
        time=datetime.now(),
        used_memory=used
    )

    print(f"Saved: {used:.2f} MB")
    time.sleep(5)
