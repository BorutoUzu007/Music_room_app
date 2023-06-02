from django.urls import path, include
from .views import index


app_name = 'frontend'
urlpatterns = [
    path('', index, name=''),
    path('home', index, name='home'),
    path('join', index, name='join'),
    path('create', index, name='create'),
    path('room/<uuid:roomCode>', index, name='room_code')
]
