// import React, { Component } from 'react';
// import { useParams } from 'react-router-dom';
// export default class Room extends Component {
//     constructor(props) {
//         super(props);
//         const { roomCode } = useParams();
//         this.state = {
//             voteToSkip : 2,
//             guestCanPause: true,
//             isHost: false,
            
//         };
        
        
//     };


//     render() {
//         return (
//             <div>
//                 <h3>{roomCode}</h3>
//                 <p>
//                     Votes = {this.state.voteToSkip}
//                 </p>
//                 <p>
//                     CanPause = {this.state.guestCanPause}
//                 </p>
//                 <p>
//                     host = {this.state.isHost}
//                 </p>
//             </div>
//         );
//     }
// }

import React from 'react';
import { useParams } from 'react-router-dom';

const Room = () => {
  const { roomCode } = useParams();

  const [state, setState] = React.useState({
    voteToSkip: 2,
    guestCanPause: true, 
    isHost: false,
  });
  

  const getRoomDetails = () => {
    fetch('/api/get-room' + '?code=' + roomCode)
      .then((response) => response.json())
      .then((data) => {
        setState({
          voteToSkip: data.vote_to_skip,
          guestCanPause: data.guest_can_pause,
          isHost: data.is_host,
        });
      });
  };

  React.useEffect(() => {
    getRoomDetails();
  }, []);

  return (
    <div>
      <h3>{roomCode}</h3>
      <p>Votes = {state.voteToSkip.toString()}</p>
      <p>CanPause = {state.guestCanPause.toString()}</p>
      <p>Host = {state.isHost.toString()}</p>
    </div>
  );
};

export default Room;
