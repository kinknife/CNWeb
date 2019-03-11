import React, { Component } from 'react';
import './App.css';
import { connectionService } from './service/connection';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      peers: [],
      peerConnections: {},
      iceConfig: { 'iceServers': [] },
      stream: null,
      currentId: null,
      roomId: null,
      connected: false
    }
  }

  componentDidMount() {
    connectionService.subcribe(this.updateApp.bind(this));
    connectionService.getMessagehandler(this.handleMessage.bind(this));
  }

  updateApp(msg) {
    switch (msg.type) {
      case 'init':
        this.setState({
          roomId: msg.roomId,
          currentId: msg.id,
          connected: msg.connected
        });
        break;
      case 'new':
        this.makeOffer(msg.id);
        break;
      default:
        return;
    }
  }

  createRoom(name) {
    navigator.getUserMedia({
      video: {
        mediaSource: 'screen'
      },
      audio: true
    }, (s) => {
      this.setState({
        stream: s
      });
    }, (e) => {
      console.log(e);
    });
    connectionService.createRoom(name);
  }

  joinRoom(name) {
    navigator.getUserMedia({
      video: true,
      audio: true
    }, (s) => {
      this.setState({
        stream: s
      });
      
    connectionService.joinRoom(name);
    }, (e) => {
      console.log(e);
    })
  }

  getPeerConnection(id) {
    let self = this
    if (this.state.peerConnections[id]) {
      return this.state.peerConnections[id];
    }
    var pc = new RTCPeerConnection(this.state.iceConfig);
    this.state.peerConnections[id] = pc;
    pc.addStream(this.state.stream);
    pc.onicecandidate = function (evnt) {
      connectionService.sendMsg({ by: self.state.currentId, to: id, ice: evnt.candidate, type: 'ice' });
    };
    pc.onaddstream = function (evnt) {
      console.log('Received new stream');
      let peers = self.state.peers
      peers.push({
        id: id,
        stream: evnt.stream
      })
      self.setState({
        peers: peers
      })
      
      let video = document.createElement('video');
      video.srcObject = evnt.stream;
      video.height = 270;
      video.width = 480;
      video.key = id;
      video.id = id;
      video.autoplay = true;
      self.videosContainer.appendChild(video);
    };
    return pc;
  }

  makeOffer(id) {
    let pc = this.getPeerConnection(id);
    let self = this
    pc.createOffer(function (sdp) {
      pc.setLocalDescription(sdp);
      console.log('Creating an offer for', id);
      connectionService.sendMsg({ by: self.state.currentId, to: id, sdp: sdp, type: 'sdp-offer' });
    }, function (e) {
      console.log(e);
    },
      { mandatory: { offerToReceiveVideo: true, offerToReceiveAudio: true } });
  }

  handleMessage(data) {
    let pc = this.getPeerConnection(data.by);
    let self = this
    switch (data.type) {
      case 'sdp-offer':
        console.log(data.sdp);
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
          console.log('Setting remote description by offer');
          pc.createAnswer(function (sdp) {
            pc.setLocalDescription(sdp);
            console.log(sdp)
            connectionService.sendMsg({ by: self.state.currentId, to: data.by, sdp: sdp, type: 'sdp-answer' });
          }, function (e) {
            console.log(e);
          });
        }, function (e) {
          console.log(e);
        });
        break;
      case 'sdp-answer':
        console.log(data.sdp);
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
          console.log('Setting remote description by answer');
        }, function (e) {
          console.error(e);
        });
        break;
      case 'ice':
        if (data.ice) {
          console.log('Adding ice candidates');
          console.log('join');
          pc.addIceCandidate(new RTCIceCandidate(data.ice));
        }
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div className="App">
        <button onClick={() => { this.createRoom('abc') }}>Create Room</button>
        <button onClick={() => { this.joinRoom('abc')}}>Join Room</button>
        <div className="videoContainer" ref={(videoContainer) => {this.videosContainer = videoContainer}}></div>
      </div>
    );
  }
}

export default App;
