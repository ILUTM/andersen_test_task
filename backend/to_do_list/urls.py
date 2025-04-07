from django.urls import path
from . import views

urlpatterns = [
    # Add a temporary empty path
    path('', views.empty_view, name='empty'),
]