from django.urls import path
from . import views

urlpatterns = [

    path(
        "",
        views.coding_assessment,
        name="coding_assessment"
    ),
    path(
    "execute/",
    views.execute_code,
    name="execute_code"
    ),
    path("submit-quiz/", views.submit_coding_quiz, name="submit_coding_quiz"),
    path("get-hint/", views.get_hint, name="get_hint"),
]