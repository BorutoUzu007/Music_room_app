import React from "react";
import ReactDOM from "react-dom";
import HomePage from "./HomePage";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Room from "./Room";
import {
  Grid,
  Button,
  ButtonGroup,
  Typography
} from "@mui/material";
import { Navigate } from "react-router-dom";


const App = () => {
  const [roomCode, setRoomCode] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/user-in-room');
      const data = await response.json();
      setRoomCode(data.code);
    };

    fetchData();
  }, []);


  const RenderHomePage = () => {

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} align="center">
          <Typography variant="h3" component="h3" >
            House Party
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <ButtonGroup disableElevation variant="contained" color="primary">
            <Button color="primary" to='/join' component={Link} >
              Join a Room
            </Button>
            <Button color="secondary" to='/create' component={Link} >
              Create a Room
            </Button>
          </ButtonGroup>
        </Grid>
        <Grid item xs={12} align="center"></Grid>
      </Grid>
    );
  }

  const clearRoomCode = () => {
    setRoomCode(null);
    
  }

  return (
    <div className="center">
      <Router>
        <Routes>
          <Route exact path="/" element={
            roomCode ? <Navigate to={"/room/" + roomCode} /> : <RenderHomePage />
          } />
          <Route path="/join" element={<RoomJoinPage />} />
          <Route path="/create" element={<CreateRoomPage />} />
          <Route path="/room/:roomCode" element={<Room clearRoomCode={clearRoomCode}/>} />
        </Routes>
      </Router>
    </div>
  );
};

const rootElement = document.getElementById('app');
ReactDOM.render(<App />, rootElement);
