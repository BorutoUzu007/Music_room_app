from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import generics
from .models import Room
from .serializers import RoomSerializer


class RoomView(generics.CreateAPIView):
    queryset = Room.objects.all
    serializer_class = RoomSerializer


def home_page(request):
    return HttpResponse("<h1>This is the home page!</h1>")
