import React from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import {
  Grid,Button,Typography
} from '@mui/material'
import CreateRoomPage from './CreateRoomPage';
import MediaPlayer from './MediaPlayer';


const Room = ({clearRoomCode}) => {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const [voteToSkip, setvoteToSkip] = React.useState(0);
  const [guestCanPause, setguestCanPause] = React.useState(true);
  const [isHost, setisHost] = React.useState(false);
  const [showSettings, setshowSettings] = React.useState(false);
  const [spotifyAuthenticated, setspotifyAuthenticated] = React.useState(false);
  const [song, setsong] = React.useState({})
  

  const getRoomDetails = () => {
    fetch('/api/get-room' + '?code=' + roomCode)
      .then((response) => {
        if (!response.ok) {
          clearRoomCode();
          navigate('/');
        }
        return response.json();
      })
      .then((data) => {
        setvoteToSkip(data.vote_to_skip);
        setguestCanPause(data.guest_can_pause);
        setisHost(data.is_host);

        if (data.is_host) {
          console.log("HI")
          authenticatSpotify()
        }

      });
      
  };

  React.useEffect(() => {
    getRoomDetails();
    const interval = setInterval(() => {
      getCurrentSong();
    }, 1000);
  
    return () => {
      clearInterval(interval);
    };
  }, []);


  const authenticatSpotify = () => {
    fetch('/spotify/is-authenticated').then((response) => response.json())
    .then((data) => {setspotifyAuthenticated(data.status)
      if (!data.status){
        fetch('/spotify/get-auth-url').then((response) => response.json())
        .then((data) => {
          window.location.replace(data.url);
        })
      }
  })
  }

  const leaveButtonPressed = () => {
    const cookieHeader = document.cookie
    const csrfToken = cookieHeader.split('=')
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'X-CSRFToken': csrfToken[1],
        },
        body: JSON.stringify({
            code: roomCode
        }),
    }
    fetch('/api/leave-room', requestOptions).then((_response) => {
      
        
      clearRoomCode();
      navigate('/');
    });
  }
    
  
  const updateShowSettings = (value) => {
    setshowSettings(value)
    if (value == false) {
      getRoomDetails();
    }
  }
  const renderSettingsButton = () => {
    return (
      <Grid item xs={12} align='center' >
        <Button variant='contained' color='primary' onClick={() => updateShowSettings(true)}>
          Settings
        </Button>
      </Grid>
    )
  }


  const getCurrentSong = () => {
    fetch('/spotify/current-song')
    .then((response) => {
      if (!response.ok) {
        return {};
      }
      else {
        return response.json();
      }
    })
    .then((data) => {
      setsong(data)
    })
  }




  const renderSettings = () => {
    
    return (
    <Grid container spacing={1}>
      <Grid item xs={12} align='center'>
      <CreateRoomPage 
        upd = {true} 
        vote = {voteToSkip} 
        canPause = {guestCanPause} 
        code = {roomCode}  
        updateCallback = {null}
        />
      </Grid>
      <Grid item xs={12} align='center'>
      <Button variant='contained' color='primary' onClick={() => updateShowSettings(false)}>
          Close
        </Button>
      </Grid>
    </Grid>
    );
  }

  if (showSettings) {
    return (
      renderSettings()
    )
  }
  else
    return (

      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography variant='h4' component='h4'>
            Code : {roomCode} 
          </Typography>
        </Grid>
        < Grid item xs={12} align="center">
        {song && Object.keys(song).length !== 0 ? (
        <Typography variant="h6">
          Song: {song.title} - {song.artist}
          <MediaPlayer song={song} />
        </Typography>
      ) : (
        <Typography variant="h6">Loading song...</Typography>
      )}
        </Grid>
        
        {isHost ? renderSettingsButton() : null }
        <Grid item xs={12} align="center">
          <Button variant='contained' color = 'secondary' onClick={leaveButtonPressed}>
            Leave Room
          </Button>

        </Grid>
      </Grid>
    );
};

export default Room;


{/* <Grid item xs={12} align="center">
        <Typography variant='h6' component='h6'>
          Votes : {voteToSkip !== undefined ? voteToSkip.toString() : ''} 
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant='h6' component='h6'>
          CanPause : {guestCanPause !== undefined ? guestCanPause.toString() : ''}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant='h6' component='h6'>
            Host : {isHost !== undefined ? isHost.toString() : ''}
          </Typography>
        </Grid> */}