const io = require('socket.io-client');

class ConnectionService {
    constructor() {
        let socket
        if (process.env.REACT_APP_ENV !== 'production') {
            socket = io(':4200/');
            this.server = 'http://localhost:4200';
        } else {
            socket = io('/');
            this.server = ''
        }

        socket.on('connect', () => {
            this.socket = socket;
            this.socket.on('peer.connected', (data) => {
                let id = data.id
                this.cb({ type: 'new', id })
            })
            this.socket.on('incomeMsg', (data) => {
                this.handleMessage(data)
            })
        });
    }

    createRoom(name) {
        this.socket.emit('init', { name: name }, (roomId, id) => {
            this.cb({ type: 'init', roomId, id, connected: true })
        });
    }

    joinRoom(room) {
        this.socket.emit('init', { name: room }, (roomId, id) => {
            this.cb({ type: 'init', roomId, id, connected: true })
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
        this.socket.emit('startRecord', { name: 'abc' });
        recorder.ondataavailable = (e) => {
            if(recorder.state === 'inactive') {
                recorder.start(10);
            }
            this.socket.emit('recordDta', e.data);
        }
        this.socket.on('recording', () => {
            recorder.start(10);
        })
    }

    signup(user) {
        return fetch(`${this.server}/signup`, {
            headers: {'Content-Type':'application/json'},
            method: 'POST',
            body: JSON.stringify(user),
            url: `${this.server}`,
            credentials: "same-origin"
        }).then(res => {
            return res.json();
        }).then(data => {
            return data
        });
    }

    signin(user) {
        return fetch(`${this.server}/signin`, {
            headers: {'Content-Type':'application/json'},
            method: 'POST',
            body: JSON.stringify(user),
            url: `${this.server}`,
            credentials: "same-origin"
        }).then(res => {
            return res.json();
        }).then(data => {
            return data;
        });
    }
}

export let connectionService = new ConnectionService();