from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Old monolithic routes removed

    # --- DECOUPLED API ENDPOINTS ---
    path('api/accounts/', include('accounts.api_urls')),
    path('api/reasoning/', include('reasoning.api_urls')),
    path('api/coding/', include('coding.api_urls')),
    path('api/results/', include('results.api_urls')),
]