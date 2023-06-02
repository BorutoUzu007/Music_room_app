from django.urls import path
from .views import AuthURL, spoti_callback, Authenticated, CurrentSong, PauseSong, PlaySong, SkipSong

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('redirect', spoti_callback),
    path('is-authenticated', Authenticated.as_view()),
    path('current-song', CurrentSong.as_view()),
    path('pause-song', PauseSong.as_view()),
    path('play-song', PlaySong.as_view()),
    path('skip-song', SkipSong.as_view())
]
