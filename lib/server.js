
const cors = require('cors');
const fs = require('fs');
const express = require('express'),
    expressApp = express().use("*",cors()),
    path = require('path'),
    http = require('http'),
    server = http.createServer(expressApp),
    socketIo = require('socket.io')(server, {log: false}),
    uuid = require('node-uuid'),
    ss = require('socket.io-stream'),
    rooms = {},
    userIds = {};
const bodyParser = require("body-parser");

const userDao = require('./user/web/UserDao.js');
const User = require('./user/web/user')
const UserSession = require('./user/web/UserSession')

expressApp.use(express.static(__dirname + '../'));
expressApp.use(express.static(path.join(__dirname, '../build')));
expressApp.use(bodyParser.json())


exports.run = function(port) {
    server.listen(port);
    console.log(`server listening at port ${port}`);
    
    expressApp.get('/', function (req, res) {
        res.sendFile(path.join(__dirname, '../build', 'index.html'));
    });

    expressApp.post('/signup', (req, res) => {
        const {body} = req;
        const {
            email,
            name,
            password
        } = body;

        if (!email){
            return res.send({
                success: false,
                message : 'Error: email cannot be blank'
            });
        }

        if (!name){
            return res.send({
                success: false,
                message : 'Error: name cannot be blank'
            });
        }

        if (!password){
            return res.send({
                success: false,
                message : 'Error: password cannot be blank'
            });
        }

        User.find({
            email: email
        }, (err, previousUsers) => {
            if(err) {
                return res.send({
                    success: false,
                    message:'Error: Server error'
                });
            } else if (previousUsers.length > 0) {
                return res.send({
                    success: false,
                    message: 'Error: Account already exist'
                });
            }

            const newUser = new User();
            newUser.email = email;
            newUser.name = name;
            newUser.password = password;
            newUser.save((err, user) => {
                if(err) {
                    return res.send({
                        success: false,
                        message:'Error: Server error'
                    });
                }
                /*return res.send({
                    success: true,
                    message: 'Success',
                    data: newUser
                });*/
            });

            const userSession = new UserSession();
            userSession.userId = newUser._id;
            userSession.save((err, doc) => {
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
            })
        });
    });

    expressApp.post('/signin', (req, res) => {
        const {body} = req;
        const {
            email,
            password
        } = body;

        if (!email){
            return res.send({
                success: false,
                message : 'Error: email cannot be blank'
            });
        }
        if (!password){
            return res.send({
                success: false,
                message : 'Error: password cannot be blank'
            });
        }

        User.find({
            email: email
        }, (err, users) => {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Error: server error'
                });
            } else if (users.length != 1){
                return res.send({
                    success: false,
                    message: 'Error: Wrong account or password'
                });
            }

            const user = users[0];
            if(password != user.password){
                return res.send({
                    success: false,
                    message: 'Error: Wrong password'
                });
            }

            const userSession = new UserSession();
            userSession.userId = user._id;
            userSession.save((err, doc) => {
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
            })
        });
    });

    expressApp.get('/verify', (req, res) => {
        const { query } = req;
        const { token } = query;

        UserSession.find({
            _id: token,
        }, (err, sessions) => {
            if(err) {
                return res.send({
                    success: false,
                    message: 'Error: Server error'
                });
            }
            if(sessions.length != 1) {
                return res.send({
                    success: false,
                    message: 'Error: Invalid'
                });
            } else {
                return res.send({
                    success: true,
                    message: 'Good',
                    userId: sessions[0].userId
                });
            }
        });
    });

    expressApp.get('/logout', (req, res) => {
        const { query } = req;
        const { token } = query;

        UserSession.findOneAndDelete({
            _id: token,
        }, (err, sessions) => {
            if(err) {
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

        User.find({
            _id: userId,
        }, (err, users) => {
            if(err) {
                return res.send({
                    success: false,
                    message: 'Error: Server error'
                });
            }
            if(users.length != 1) {
                return res.send({
                    success: false,
                    message: 'Error: Invalid'
                });
            } else {
                return res.send({
                    success: true,
                    message: 'Good',
                    user: users[0]
                });
            }
        });
    });

    expressApp.post('/update', (req, res) => {
        const { body } = req;
        const {
            email,
            name,
            password
        } = body;

        User.find({
            email: email
        }, (err, users) => {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Error: server error'
                });
            } else if (users.length != 1){
                return res.send({
                    success: false,
                    message: 'Error: server error'
                });
            }

            const user = users[0];
            if(email==user.email && password==user.password){
            return res.send({
                success: false,
                message: 'Nothing changed'
            });
        }
        });

        User.findOneAndUpdate({
            email: email,
        }, {
            $set:{
                name: name,
                password: password
            }
        }, {new: true}, (err, users) => {
            if(err) {
                return res.send({
                    success: false,
                    message: 'Error: Server error'
                });
            } else {
                return res.send({
                    success: true,
                    message: 'Success'
                });
            }
        });
    });

    let roomIndex = {}
    socketIo.on('connection', (socket) => {
        let currentRoom,id;
        let writeSteam;

        socket.on('init', (data, fn) => {
            currentRoom = roomIndex[data.name] || uuid.v4();
            let room = rooms[currentRoom];
            if(!roomIndex[data.name]) {
                rooms[currentRoom] = [socket];
                id = userIds[currentRoom] = 0;
                roomIndex[data.name] = currentRoom;
                fn(currentRoom, id);
            } else {
                if(!room) {
                    return;
                }
                if(userIds[currentRoom] === 5) {
                    socket.emit('roomFull');
                }
                userIds[currentRoom] += 1;
                id = userIds[currentRoom];
                fn(currentRoom, id);
                room.forEach( (s) => {
                    s.emit('peer.connected', {id: id});
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
            rooms[currentRoom].forEach(function (socket) {
              if (socket) {
                socket.emit('peer.disconnected', { id: id });
              }
            });
        });
    });
}