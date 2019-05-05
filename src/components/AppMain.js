import React, { Component } from 'react';
import { connectionService } from './service/connection';

class AppMain extends Component {
    constructor(props) {
      super(props);
  
      this.state = {
        peers: [],
        peerConnections: {},
        iceConfig: {
          'iceServers': [
            {
              'url': 'stun:stun.l.google.com:19302'
            },
            {
              'url': 'turn:192.158.29.39:3478?transport=udp',
              'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
              'username': '28224511:1379330808'
            },
            {
              'url': 'turn:192.158.29.39:3478?transport=tcp',
              'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
              'username': '28224511:1379330808'
            }
          ]
        },
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
      let isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
      window.getScreenId((e, sourceId,screen_constraints) => {
        if(!isChrome) {
          screen_constraints.audio = true;
        }
        navigator.getUserMedia(screen_constraints, (s) => {
          if(isChrome) {
            navigator.getUserMedia({audio: true}, (audioStream) => {
              s.addTrack(audioStream.getAudioTracks()[0]);
              this.setState({
                stream: s
              });
              connectionService.createRoom(name);
            }, (e) => {
              console.log(e)
            })
          } else {
            this.setState({
              stream: s
            });
            connectionService.createRoom(name);
          }
          this.startRecord(s);
        }, (e) => {
          console.log(e);
        });
      })
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

    startRecord(s) {
      let options = {mimeType: 'video/webm;codecs=vp9'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not Supported`);
        options = {mimeType: 'video/webm;codecs=vp8'};
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.error(`${options.mimeType} is not Supported`);
          options = {mimeType: 'video/webm'};
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.error(`${options.mimeType} is not Supported`);
            options = {mimeType: ''};
          }
        }
      }
      let mediaRecorder = new MediaRecorder(s, options);
      connectionService.saveVideo(mediaRecorder);
    }
  
    render() {
      return (
        <div className="FormMain">
          <div className="videoContainer" ref={(videoContainer) => { this.videosContainer = videoContainer }}></div>
          <button className="Button" onClick={() => { this.createRoom('abc') }}>Create Room</button>
          <button className="Button" onClick={() => { this.joinRoom('abc') }}>Join Room</button>
        </div>        
      );
    }
  }
  
  export default AppMain;