from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('scan/', views.scan_processes, name='scan'),
    path('system-usage/', views.system_usage_api, name='system_usage'),
]
