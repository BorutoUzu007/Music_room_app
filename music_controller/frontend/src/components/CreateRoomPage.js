import React, {useState} from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import  Typography  from "@mui/material/Typography";
import  TextField  from "@mui/material/TextField";
import  FormHelperText  from "@mui/material/FormHelperText";
import  FormControl  from "@mui/material/FormControl";
import  {Link}   from "react-router-dom";
import  Radio  from "@mui/material/Radio";
import  RadioGroup  from "@mui/material/RadioGroup";
import  FormControlLabel  from "@mui/material/FormControlLabel";
import { useNavigate } from "react-router-dom";
import { Collapse } from "@mui/material";
import {Alert} from "@mui/material"


export const CreateRoomPage = ({vote, canPause, upd, code, updateCallback}) => { 
    const navigate = useNavigate();
    const [defaultVotes, setdefaultVotes] = useState(0);
    const [guestCanPause, setguestCanPause] = useState(canPause || true);
    const [votesToSkip, setvotesToSkip] = useState(vote || defaultVotes);
    const [update, setupdate] = useState(upd || false);
    const [roomCode, setroomCode] = useState(code || '');
    const [callBack, setcallBack] = useState(updateCallback || "");
    const [msg, setmsg] = useState({});


    const handleVotesChanged = () => {
        setvotesToSkip(event.target.value);
    }

    const handleGuestCanPauseChange = () => {
        setguestCanPause(event.target.value);
    }
    
    const resetUpdate = (val) => {
        setupdate = val;
    }

    
    const handleRoomButtonPressed = () => {
        const cookieHeader = document.cookie
        const csrfToken = cookieHeader.split('=')
    

        const requestOptions = {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken[1],   
            },
            body: JSON.stringify({
            vote_to_skip: votesToSkip,
            guest_can_pause: guestCanPause,
            }),
        };

        fetch('/api/create-room', requestOptions)
            .then((response) => response.json())
            .then((data) => navigate("/room/" + data.code));
    }

    const handleUpdatePressed = () => {
        const cookieHeader = document.cookie
        const csrfToken = cookieHeader.split('=')
    

        const requestOptions = {
            method: 'PATCH',
            headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken[1],   
            },
            body: JSON.stringify({
            vote_to_skip: votesToSkip,
            guest_can_pause: guestCanPause,
            code: roomCode,
            }),
        };

        fetch('/api/update-room', requestOptions)
            .then((response) => {
                if (response.ok) {
                    setmsg({"success":"Successfully Updated!"});
                }
                else {
                    setmsg({"error":"Some error occured. Please Try again"});
                }
                
                return response.json()
            })
            .then((data) => navigate('/room/' + roomCode));
    }

    const createButtons = () => {
        if (!update) 
            return (
                <Grid container spacing={1}>
                    
                    <Grid item xs={12} align="center" >
                        <Button color= "primary" variant="contained" onClick={handleRoomButtonPressed}>
                            Create a room
                        </Button>
                    </Grid>
                    <Grid item xs={12} align="center" >
                        <Button color= "secondary" variant="contained" to = "/" component={Link}>
                            Back
                        </Button>
                    </Grid>
                </Grid>
            )
        return (
            <Grid item xs={12} align="center" >
                <Button color= "secondary" variant="contained" onClick={handleUpdatePressed}>
                    Update Room
                </Button> 
            </Grid>
        )
    }

    const pageTitle = update ? "Update Room" : "Create a Room";
    
        return (
            

            <Grid container spacing={1} >
                <Grid item xs={12} align="center">
                    <Collapse in={Object.keys(msg).length > 0}>
                        {"success" in msg ? <Alert severity="success" onClose={() => {setmsg({})}}>
                            {msg["success"]}
                        </Alert> : <Alert severity="error" onClose={() => {setmsg({})}} >
                            {msg["error"]}
                        </Alert>}
                    </Collapse>
                </Grid>
                <Grid item xs={12} align="center" >
                    <Typography component="h4" variant="h4">
                        {pageTitle}
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center" >
                    <FormControl component="fieldset">
                        <FormHelperText component='div'>
                            <div align="center">
                                Guest Control of Playback State
                            </div>
                        </FormHelperText>
                    <RadioGroup row value={guestCanPause} onChange={handleGuestCanPauseChange}>
                        <FormControlLabel 
                            value="true" 
                            control={<Radio color="primary"/>}
                            label = "Play/Pause"
                            labelPlacement="bottom"
                        />
                        <FormControlLabel 
                            value="False" 
                            control={<Radio color="secondary"/>}
                            label = "No Control"
                            labelPlacement="bottom"
                        />
                    </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12} align="center" >
                    <FormControl>
                        <TextField 
                            required={true} 
                            type="number" 
                            onChange={handleVotesChanged}
                            defaultValue={votesToSkip} 
                            inputProps={{
                                min: 1,
                                style: {textAlign: "center"}
                            }} />
                        <FormHelperText component='div'>
                            <div align="center" >
                                Votes to Skip a song
                            </div>
                        </FormHelperText>
                    </FormControl>
                </Grid>
                
                {createButtons()}
            </Grid>

        );
    }
    export default CreateRoomPage;
