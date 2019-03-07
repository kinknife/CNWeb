const express = require('express'),
    expressApp = express(),
    http = require('http'),
    server = http.createServer(expressApp),
    socketIo = require('socket.io')(server, {log: false}),
    uuid = require('node-uuid'),
    rooms = {},
    userIds = {};


expressApp.use(express.static(__dirname + '../dist/'))

exports.run = function(port) {
    server.listen(port);
    console.log(`server listening at port ${port}`);
    let roomIndex = {}
    socketIo.on('connection', (socket) => {
        let currentRoom,id;

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

        socket.on('msg', function (data) {
            var to = parseInt(data.to, 10);
            if (rooms[currentRoom] && rooms[currentRoom][to]) {
                console.log('Redirecting message to', to, 'by', data.by);
                rooms[currentRoom][to].emit('incomeMsg', data);
            } else {
                console.warn('Invalid user');
            }
        });
    
        socket.on('disconnect', function () {
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