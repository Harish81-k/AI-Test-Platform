from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .api_views import RegisterView, UserProfileView, GoogleLoginAPIView

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='api_login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='api_token_refresh'),
    path('google/', GoogleLoginAPIView.as_view(), name='api_google_login'),
    path('register/', RegisterView.as_view(), name='api_register'),
    path('profile/', UserProfileView.as_view(), name='api_profile'),
]
