from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse


# Create your views here.


class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code is not None:
            room = Room.objects.filter(code=code)
            if len(room):
                data = RoomSerializer(room[0]).data
                data["is_host"] = self.request.session.session_key == room[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response({"Room not Found": "Invalid Code"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"Bad Request": "No Code Given"}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class JoinRoom(APIView):

    lookup_url_kwarg = 'code'

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        code = request.data.get(self.lookup_url_kwarg)
        if code is not None:
            room_result = Room.objects.filter(code=code)
            if len(room_result):
                room = room_result[0]
                self.request.session['room_code'] = code
                return Response({'message': "Room Joined"}, status=status.HTTP_200_OK)
            return Response({'Bad Request': 'Invalid room code'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request': 'Invalid post data'}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            vote_to_skip = serializer.data.get('vote_to_skip')
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.vote_to_skip = vote_to_skip
                room.save(update_fields=['guest_can_pause', 'vote_to_skip'])
                self.request.session['room_code'] = str(room.code)
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK, content_type='application/json')
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause,
                            vote_to_skip=vote_to_skip)
                room.save()
                self.request.session['room_code'] = str(room.code)
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED,content_type='application/json')

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST, content_type='application/json')
    

class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        data = {
            "code": self.request.session.get('room_code')
        }

        return JsonResponse(data, status=status.HTTP_200_OK)
    
class LeaveRoom(APIView):
    def post(self, request, format=None):
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            host_id = self.request.session.session_key
            rooms = Room.objects.filter(host=host_id)
            if rooms:
                rooms[0].delete()
        

        return Response({"message" :"success"}, status=status.HTTP_200_OK)
    

class UpdateRoom(APIView):

    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            vote_to_skip = serializer.data.get('vote_to_skip')
            code = serializer.data.get('code')

            qs = Room.objects.filter(code=code)
            if not qs.exists():
                return Response({'Message': 'No Room Found'}, status=status.HTTP_404_NOT_FOUND, content_type='application/json')
            room = qs[0]
            user_id = self.request.session.session_key
            if user_id != room.host:
                return Response({'Bad Request': 'Not the Host'}, status=status.HTTP_400_BAD_REQUEST, content_type='application/json')
            room.guest_can_pause = guest_can_pause
            room.vote_to_skip = vote_to_skip
            room.save(update_fields=['guest_can_pause', 'vote_to_skip'])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK, content_type='application/json')



        return Response({'Bad Request': 'Invalid Request'}, status=status.HTTP_400_BAD_REQUEST, content_type='application/json')
    