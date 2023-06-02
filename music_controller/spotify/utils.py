from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from requests import Request, post, put, get
from spotify.credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
import base64


BASE_URL = "https://api.spotify.com/v1/me/"


def get_user_token(session_key):
    user_tokens = SpotifyToken.objects.filter(user = session_key)
    if user_tokens:
        return user_tokens[0]
    return None





def update_or_create_user_tokens(session_key, access_token, token_type, expires_in, refresh_token):
    tokens = get_user_token(session_key=session_key)
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type

        tokens.save(update_fields=['access_token','refresh_token','expires_in','token_type'])
    else:
        tokens = SpotifyToken(user=session_key, access_token=access_token, token_type=token_type, expires_in=expires_in,refresh_token=refresh_token)
        tokens.save()


def renew_spoti_token(session_key):
    
    # tokens = get_user_token(session_key=session_key)
    # if tokens:
    #     refresh_token = tokens.refresh_token
    #     response = post('https://accounts.spotify.com/api/token', data = {
    #         'grant_type': 'refresh_token',
    #         'refresh_token': refresh_token,
    #         'client_id': CLIENT_ID,
    #         'client_secret': CLIENT_SECRET
    #     }).json()

    #     access_token = response.get('access_token')
    #     expires_in = response.get('expires_in')
    refresh_token = get_user_token(session_key=session_key).refresh_token

    credentials = f'{CLIENT_ID}:{CLIENT_SECRET}'
    credentials_b64 = base64.b64encode(credentials.encode()).decode()
    print(str(CLIENT_ID))
    response = post('https://accounts.spotify.com/api/token',headers={
        'Content-Type': 'application/x-www-form-urlencoded',
    }, data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': "6af527b37d4145009706d0868744bb56",
    }).json()

    print('wohwjhrwjhrw', response)
    access_token = response.get('access_token')
    token_type = response.get('token_type')
    if response.get('refresh_token') is not None:
        refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    update_or_create_user_tokens(session_key, access_token=access_token, refresh_token=refresh_token, expires_in=expires_in, token_type=token_type)


    
        

def is_spoti_authenticated(session_key):
    tokens = get_user_token(session_key=session_key)
    if tokens:
        expiring_date = tokens.expires_in
        if expiring_date > timezone.now():
            # renew_spoti_token(session_key)
            return True
        else:
            delete_entry(session_key)
            return False
    return False

def execute_spotify_requests(session_key, endpoint, post_= False, put_ = False):
    tokens = get_user_token(session_key)
    header = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+ tokens.access_token,
    }
    if post_:
        response = post(BASE_URL + endpoint, headers=header)
    elif put_:
        response = put(BASE_URL + endpoint, headers=header)
    else:
        response = get(BASE_URL + endpoint ,headers=header)
    
    try:
        return response.json()
    except:
        return {'error': 'issue with request'}



def pause_song(session_key):
    return execute_spotify_requests(session_key, 'player/pause', put_=True)

def play_song(session_key):
    return execute_spotify_requests(session_key, 'player/play', put_=True)


def delete_entry(session_key):
    tokens = get_user_token(session_key)
    if tokens:
        tokens.delete()


def skip_song(session_key):
    return execute_spotify_requests(session_key, 'player/next', post_=True)