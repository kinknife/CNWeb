
const cors = require('cors');
const fs = require('fs');
const express = require('express'),
    expressApp = express(),
    path = require('path'),
    http = require('http'),
    server = http.createServer(expressApp),
    socketIo = require('socket.io')(server, { log: false }),
    uuid = require('node-uuid'),
    rooms = {},
    userIds = {};
const bodyParser = require("body-parser");

const userDao = require('./user/web/UserDao.js');

expressApp.use(express.static(__dirname + '../'));
expressApp.use(express.static(path.join(__dirname, '../build')));
expressApp.use(bodyParser.json());

if (process.env.REACT_APP_ENV !== 'production') {
    expressApp.use(cors());
}
exports.run = function (port) {
    server.listen(port);
    console.log(`server listening at port ${port}`);

    expressApp.get('/', function (req, res) {
        res.sendFile(path.join(__dirname, '../build', 'index.html'));
    });

    expressApp.post('/signup', (req, res) => {
        const { body } = req;
        const {
            email,
            name,
            password
        } = body;

        if (!email) {
            return res.send({
                success: false,
                message: 'Error: email cannot be blank'
            });
        }

        if (!name) {
            return res.send({
                success: false,
                message: 'Error: name cannot be blank'
            });
        }

        if (!password) {
            return res.send({
                success: false,
                message: 'Error: password cannot be blank'
            });
        }

        userDao.getUserByEmail(email, (err, previousUsers) => {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Error: Server error'
                });
            } else if (previousUsers.length > 0) {
                return res.send({
                    success: false,
                    message: 'Error: Account already exist'
                });
            }

            userDao.addUser({email, username: name, password}, (err, user) => {
                if (err) {
                    return res.send({
                        success: false,
                        message: 'Error: Server error'
                    });
                };
                userDao.createUserSession(user._id,uuid.v4(), (err, doc) => {
                    if (err) {
                        return res.send({
                            success: false,
                            message: 'Error: server error'
                        });
                    }
                    return res.send({
                        success: true,
                        message: 'Success',
                        token: doc._id
                    });
                });
            });
        });
    });

    expressApp.post('/signin', (req, res) => {
        const { body } = req;
        const {
            email,
            password
        } = body;

        if (!email) {
            return res.send({
                success: false,
                message: 'Error: email cannot be blank'
            });
        }
        if (!password) {
            return res.send({
                success: false,
                message: 'Error: password cannot be blank'
            });
        }
        userDao.getUserByEmail(email, (err, users) => {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Error: server error'
                });
            } else if (users.length != 1) {
                return res.send({
                    success: false,
                    message: 'Error: Wrong account or password'
                });
            }

            const user = users[0];
            if (password != user.password) {
                return res.send({
                    success: false,
                    message: 'Error: Wrong password'
                });
            };

            userDao.createUserSession(user._id, uuid.v4(), (err, doc) => {
                if (err) {
                    return res.send({
                        success: false,
                        message: 'Error: server error'
                    });
                }
                return res.send({
                    success: true,
                    message: 'Success',
                    token: doc._id
                });
            });
        })
    });

    expressApp.get('/verify', (req, res) => {
        const { query } = req;
        const { token } = query;
        userDao.getSessionById(token, (err, session) => {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Error: Server error'
                });
            }
            if (!session) {
                return res.send({
                    success: false,
                    message: 'Error: Invalid'
                });
            } else {
                return res.send({
                    success: true,
                    message: 'Good',
                    userId: session.userId
                });
            }
        });
    });

    expressApp.get('/logout', (req, res) => {
        const { query } = req;
        const { token } = query;
        userDao.deleteSession(token, (err, session) => {
            console.log(err);
            if (err) {
                return res.send({
                    success: false,
                    message: 'Error: Server error'
                });
            } else {
                return res.send({
                    success: true,
                    message: 'Good'
                });
            }
        });
    });

    expressApp.get('/info', (req, res) => {
        const { query } = req;
        const { userId } = query;

        userDao.getUserByID(userId, (err, users) => {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Error: Server error'
                });
            } else {
                return res.send({
                    success: true,
                    message: 'Good',
                    user: users
                });
            }
        });
    });

    expressApp.post('/update', (req, res) => {
        const { body } = req;
        const {
            id,
            email,
            name,
            password
        } = body;

        userDao.updateUser({ id, email, name, password }, (err) => {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Error: server error',
                    err: err
                });
            }
        });
    });

    socketIo.on('connection', (socket) => {
        let currentRoom, id;
        let writeSteam;

        socket.on('init', (data, fn) => {
            currentRoom = data.name;
            let room = rooms[currentRoom];
            if (!room) {
                rooms[currentRoom] = [socket];
                id = userIds[currentRoom] = 0;
                data.name = currentRoom;
                fn(currentRoom, id);
            } else {
                if (!room) {
                    return;
                }
                if (userIds[currentRoom] === 4) {
                    socket.emit('roomFull');
                }
                userIds[currentRoom] += 1;
                id = userIds[currentRoom];
                fn(currentRoom, id);
                room.forEach((s) => {
                    s.emit('peer.connected', { id: id });
                });
                room[id] = socket
                console.log('Peer connected to room', currentRoom, 'with #', id);
            }
        });

        socket.on('msg', (data) => {
            var to = parseInt(data.to, 10);
            if (rooms[currentRoom] && rooms[currentRoom][to]) {
                console.log('Redirecting message to', to, 'by', data.by);
                rooms[currentRoom][to].emit('incomeMsg', data);
            } else {
                console.warn('Invalid user');
            }
        });

        socket.on('startRecord', data => {
            writeSteam = fs.createWriteStream(path.resolve(`./test/${data.name}`));
            socket.emit('recording');
        })

        socket.on('recordDta', data => {
            writeSteam.write(data);
        })

        socket.on('disconnect', () => {
            if (!currentRoom || !rooms[currentRoom]) {
                return;
            }
            delete rooms[currentRoom][rooms[currentRoom].indexOf(socket)];
            rooms[currentRoom].forEach(function (remain) {
                if (remain) {
                    remain.emit('peerDisconnected', { id: id });
                }
            });
        });

        socket.on('leaveRoom', () => {
            if (!currentRoom || !rooms[currentRoom]) {
                return;
            }
            delete rooms[currentRoom][rooms[currentRoom].indexOf(socket)];
            rooms[currentRoom].forEach(function (remain) {
                if (remain) {
                    remain.emit('peerDisconnected', { id: id });
                }
            });
        });
    });
}