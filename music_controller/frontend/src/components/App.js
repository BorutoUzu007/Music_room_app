import React, {Component} from "react";
import { render } from "react-dom";
import HomePage from "./HomePage";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import { BrowserRouter as Router, Routes, Route, Link, Redirect, Outlet} from "react-router-dom"
import Room from "./Room";


export default class App extends Component{
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
              
            <Router>
              <Routes>
              

                <Route exact path="/" element = {<HomePage />} />
                  
                
                <Route path="/join" element={<RoomJoinPage />} />
                <Route path="/create" element={<CreateRoomPage />} />

                <Route path = "/room/:roomCode" element={<Room />} />
                
              </Routes>
            </Router>
          </div>
        
        );
    }
}

const appDiv = document.getElementById("app");
render(<App />, appDiv);