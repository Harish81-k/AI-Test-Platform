from django.urls import path
from .views import *

urlpatterns = [

    path(
        'signup/',
        signup_view,
        name='signup'
    ),

    path(
        'login/',
        login_view,
        name='login'
    ),

    path(
        'logout/',
        logout_view,
        name='logout'
    ),
    path(
        '',
        home_view,
        name='home'
    ),
    path(
        'about/',
        about_view,
        name='about'
    ),
]