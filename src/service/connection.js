const io = require('socket.io-client');

class ConnectionService {
    constructor() {
        let socket = io('localhost:4200');
        
        socket.on('connect', () => {
            this.socket = socket;
            this.socket.on('peer.connected', (data) => {
                let id = data.id
                this.cb(id)
            })
        });
    }

    createRoom() {
        this.socket.emit('init', null, (roomId, id) => {
            return {roomId, id, connected: true}
        });
    }

    joinRoom(room) {
        this.socket.emit('init', {room: room}, (roomId, id) => {
            return {roomId, id, connected: true}
        });
    }

    sendMsg(msg) {
        this.socket.emit('msg', msg);
    }

    subcribe(cb) {
        this.cb = cb;
    }
}

export let connectionService = new ConnectionService()