import React from "react";
import { TextField, Button, Grid, Typography } from "@mui/material";
import {Link} from 'react-router-dom';
import { useNavigate } from "react-router-dom";

export const RoomJoinPage = () => {
    const navigate = useNavigate();
    const [error,seterror] = React.useState("");
    const [roomCode, setroomCode] = React.useState("")


    const handleTextFieldChange = () => {
        setroomCode(event.target.value);
    }

    const handleButtonPressed = () => {
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
        fetch('/api/join-room', requestOptions)
        .then((response) => {
            if (response.ok) {
                navigate("/room/" + roomCode);
            }
            else {
                seterror("Room not found.")
            }
        }) 
    }

    
    return (
        <Grid container spacing={1} align="center">
                <Grid item xs={12} >
                    <Typography variant="h4" component="h4">
                        Join a Room
                    </Typography>
                </Grid>
                <Grid item xs={12} >
                    <TextField
                        error={error.length > 0}
                        label = "Code"
                        placeholder="Enter a Room Code"
                        value={roomCode}
                        helperText={error}
                        variant="outlined"
                        onChange={handleTextFieldChange}
                    />
                </Grid>
                <Grid item xs={12} >
                    <Button variant="contained" color="secondary" onClick={handleButtonPressed}>
                        Enter Room
                    </Button>
                </Grid>
                <Grid item xs={12} >
                    <Button variant="contained" color="primary" to="/" component = {Link}>
                        Back
                    </Button>
                </Grid>
            </Grid>
        );
    
}

export default RoomJoinPage;