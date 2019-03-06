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
    console.log(`server listening at port ${port}`)
    socketIo.on('connection', (socket) => {
        let currentRoom,id;

        socket.on('initRoom', (data, fn) => {
            currentRoom = (data || {}).room || uuid.v4();
            let room = rooms[currentRoom];
            if(!data) {
                room[currentRoom] = [socket];
                id = userIds[currentRoom] = 0;
                fn(currentRoom, id)
            } else {
                if(!room) {
                    return;
                }

                userIds[currentRoom] += 1;
                id = userId[currentRoom];
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
                rooms[currentRoom][to].emit('msg', data);
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