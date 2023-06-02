import React from "react";
import { Grid, Typography, Card, IconButton, LinearProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PauseIcon from '@mui/icons-material/Pause';


const MediaPlayer = ({ song }) => {
    console.log("dwfwfwfwfw",song)
  const songProgress = (song.time / song.duration) * 100;

  const [songPlaying, setsongPlaying] = React.useState(song.is_playing ? true : false);

  const handlePlay = () => {
    const requestOptions = {
      method: "PUT",
      headers: {'Content-Type': 'application/json'},

    };

    fetch("/spotify/play-song", requestOptions);
  }

  const handlePause = () => {
    const requestOptions = {
      method: "PUT",
      headers: {'Content-Type': 'application/json'},

    };

    fetch("/spotify/pause-song", requestOptions);
  }

  const handleSkip = () => {
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
    };

    fetch("/spotify/skip-song", requestOptions);
  }



  return (
    <Card>
      <Grid container alignItems='center'>
        <Grid item align='center' xs={4}>
          <img src={song.image_url} height="100%" width='100%' alt={song.title} />
        </Grid>
        <Grid item align='center' xs={8}>
          <Typography component='h3' variant="h5">
            {song.title}
          </Typography>
          <Typography color='textSecondary' variant="subtitle1">
            {song.artist}
          </Typography>
          <div>
            <IconButton onClick={ () => { song.is_playing ? handlePause() : handlePlay()}}>
              {song.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton onClick={() => {handleSkip()}}>
              <SkipNextIcon /> {song.votes} / {song.vote_to_skip}
            </IconButton>
          </div>
        </Grid>
      </Grid>
      <LinearProgress variant="determinate" value={songProgress} />
    </Card>
  );
};

export default MediaPlayer;
