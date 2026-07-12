from django.urls import path
from .api_views import GenerateCodingQuestionsAPIView, SubmitCodingQuizAPIView, ExecuteCodeAPIView, GetHintAPIView

urlpatterns = [
    path('generate/', GenerateCodingQuestionsAPIView.as_view(), name='api_generate_coding'),
    path('submit/', SubmitCodingQuizAPIView.as_view(), name='api_submit_coding'),
    path('execute/', ExecuteCodeAPIView.as_view(), name='api_execute_code'),
    path('hint/', GetHintAPIView.as_view(), name='api_get_hint'),
]
