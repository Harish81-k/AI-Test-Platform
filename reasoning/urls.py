from django.urls import path
from . import views

urlpatterns = [



    path("quiz/", views.get_quiz, name="quiz"),
    path("submit-quiz/", views.submit_quiz, name="submit_quiz"),

    path("ai-quiz/", views.ai_quiz_dashboard, name="ai_quiz"),

  
]