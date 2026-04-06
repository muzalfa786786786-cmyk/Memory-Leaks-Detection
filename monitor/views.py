from django.shortcuts import render
from django.http import JsonResponse
from .process_scanner import scan_processes as scanner_function
import psutil

def dashboard(request):
    return render(request, "monitor/dashboard.html")

def scan_processes(request):
    results = scanner_function()
    return JsonResponse({"results": results})

def system_usage_api(request):
    cpu = psutil.cpu_percent(interval=1)
    ram = psutil.virtual_memory().percent
    
    return JsonResponse({
        "cpu": cpu,
        "ram": ram
    })
