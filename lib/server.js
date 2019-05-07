
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
        userDao.checkUsername(req.body.email, (err, data) => {
            if(!err) {
                if(!data) {
                    userDao.addUser(req.body, (err) => {
                        if(!err) {
                            res.status(200).send({message: 'succeed'});
                        } else {
                            console.log(err);
                        }
                    });
                } else {
                    res.status(200).send({message: 'existed'});
                }
            } else {
                console.log(err);
            }
        });
    })

    expressApp.post('/signin', (req, res) => {
        userDao.getUserByID(req.body.email, (err, data) => {
            if(!err) {
                if(data.password === req.body.password) {
                    res.status(200).send({message: 'login succeed'});
                } else {
                    res.status(403).send({message: 'not correct password or email'});
                }
            } else {
                res.status(500).send({err: err});
            }
        })
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