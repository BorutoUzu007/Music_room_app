from django.shortcuts import render, redirect
from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
from rest_framework.views import APIView
from requests import Request, post
from rest_framework.response import Response
from rest_framework import status
from .utils import update_or_create_user_tokens, is_spoti_authenticated, execute_spotify_requests, play_song, pause_song, skip_song
from api.models import Room
from .models import Votes


class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = "user-read-playback-state user-modify-playback-state user-read-currently-playing"

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope' : scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url
        

        return Response({'url': url}, status=status.HTTP_200_OK)
    
def spoti_callback(request, format=None):
    code = request.GET.get('code', '')
    error = request.GET.get('error', '')



    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
    }).json()

    print(response)


    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    refresh_token = response.get('refresh_token')
    error = response.get('error')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(session_key=request.session.session_key, access_token=access_token, token_type=token_type, refresh_token=refresh_token,expires_in=expires_in)

    return redirect('frontend:')


class Authenticated(APIView):
    def get(self, request, format=None):
        is_auth = is_spoti_authenticated(self.request.session.session_key)
        return Response({'status': is_auth}, status=status.HTTP_200_OK)
    



class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        host = room.host
        endpoint = "player/currently-playing"
        response = execute_spotify_requests(host, endpoint=endpoint)
        if 'error' in response or 'item' not in response:
            return Response(response, status=status.HTTP_204_NO_CONTENT)
        
        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')

        is_playing = response.get('is_playing')
        song_id = item.get('id')

        votes = len(Votes.objects.filter(room=room))


        artist_string = ""
        for i, artist in enumerate(item.get('artists')):
            if i > 0:
                artist_string += ", "
            name = artist.get('name')
            artist_string += name
            
        song = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': votes,
            'vote_to_skip': room.vote_to_skip,
            'id': song_id,
        }


        self.updateSong(room, song_id)
        return Response(song, status=status.HTTP_200_OK)
    
    def updateSong(self, room, song_id):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=['current_song'])
            votes = Votes.objects.filter(room=room).delete()
        

class PlaySong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)



class PauseSong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)
    


class SkipSong(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        votes = Votes.objects.filter(room=room, song_id=room.current_song)
        votes_needed = room.vote_to_skip
        if self.request.session.session_key == room.host or len(votes) + 1 >= votes_needed:
            votes.delete(0)
            skip_song(room.host)
        else:
            vote = Votes(user = self.request.session.session_key, room=room, song_id = room.current_song)
            vote.save()

        return Response({}, status=status.HTTP_204_NO_CONTENT)


