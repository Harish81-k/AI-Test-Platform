from django.urls import path
from .api_views import AnalyticsDashboardAPIView

urlpatterns = [
    path('analytics/', AnalyticsDashboardAPIView.as_view(), name='api_analytics_dashboard'),
]
