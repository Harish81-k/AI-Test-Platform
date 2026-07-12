from django.urls import path
from .api_views import GenerateQuizAPIView, SubmitQuizAPIView

urlpatterns = [
    path('generate/', GenerateQuizAPIView.as_view(), name='api_generate_quiz'),
    path('submit/', SubmitQuizAPIView.as_view(), name='api_submit_quiz'),
]
