import React, {Component} from "react";
import CreateRoomPage from "./CreateRoomPage";
import RoomJoinPage from "./RoomJoinPage";
import { BrowserRouter as Router, Routes, Route, Link, Redirect} from "react-router-dom"

export default class HomePage extends Component {
    constructor(props) {
        super(props);


    }


    render() {
        return (
          <div>
            <p>This is the home page</p>
          </div>
        );
      };
      
}