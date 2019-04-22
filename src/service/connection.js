const io = require('socket.io-client');
const ss = require('socket.io-stream');

class ConnectionService {
    constructor() {
        let socket
        if(process.env.REACT_APP_ENV !== 'production') {
            socket = io(':4200/');
        } else {
            socket = io('/');
        }
        
        socket.on('connect', () => {
            this.socket = socket;
            this.socket.on('peer.connected', (data) => {
                let id = data.id
                this.cb({type: 'new',id})
            })
            this.socket.on('incomeMsg', (data) => {
                console.log('msg', data)
                this.handleMessage(data)
            })
        });
    }

    createRoom(name) {
        this.socket.emit('init', {name: name}, (roomId, id) => {
            this.cb({type: 'init', roomId, id, connected: true})
        });
    }

    joinRoom(room) {
        this.socket.emit('init', {name: room}, (roomId, id) => {
            this.cb({type: 'init', roomId, id, connected: true})
        });
    }

    sendMsg(msg) {
        this.socket.emit('msg', msg);
    }

    subcribe(cb) {
        this.cb = cb;
    }

    getMessagehandler(cb) {
        this.handleMessage = cb;
    }

    saveVideo(recorder) {
        let stream = ss.createStream();
        recorder.ondataavailable = (e) => {
            stream.write(e.data);
        }
        this.socket.emit('startRecord', {name: 'abc'});
    }
}

export let connectionService = new ConnectionService()