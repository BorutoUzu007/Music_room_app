from django.urls import path
from .views import RoomView, home_page

urlpatterns = [
    path('', RoomView.as_view()),
    path('home/', home_page)
]
