import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {connectionService} from './service/connection';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      peerConnection: {},
      iceConfig: { 'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }]},
      stream: null,
      currentId: null
    }
  }

  componentDidMount() {
    connectionService.subcribe(this.makeOffer.bind(this))
  }

  getPeerConnection(id) {
    if (this.state.peerConnections[id]) {
      return this.state.peerConnections[id];
    }
    var pc = new RTCPeerConnection(this.state.iceConfig);
    this.state.peerConnections[id] = pc;
    pc.addStream(this.state.stream);
    pc.onicecandidate = function (evnt) {
      connectionService.sendMsg({ by: this.state.currentId, to: id, ice: evnt.candidate, type: 'ice' });
    };
    pc.onaddstream = function (evnt) {
      console.log('Received new stream');
      // api.trigger('peer.stream', [{
      //   id: id,
      //   stream: evnt.stream
      // }]);
      // if (!$rootScope.$$digest) {
      //   $rootScope.$apply();
      // }
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
    { mandatory: { offerToReceiveVideo: true, offerToReceiveAudio: true }});
  }

  handleMessage(data) {
    let pc = this.getPeerConnection(data.by);
    let self = this
    switch (data.type) {
      case 'sdp-offer':
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
          console.log('Setting remote description by offer');
          pc.createAnswer(function (sdp) {
            pc.setLocalDescription(sdp);
            connectionService.sendMsg({ by: self.state.currentId, to: data.by, sdp: sdp, type: 'sdp-answer' });
          }, function (e) {
            console.log(e);
          });
        }, function (e) {
          console.log(e);
        });
        break;
      case 'sdp-answer':
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
          console.log('Setting remote description by answer');
        }, function (e) {
          console.error(e);
        });
        break;
      case 'ice':
        if (data.ice) {
          console.log('Adding ice candidates');
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
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
