// Importing all the required plugins for server
/*
 * imported http which is inbuilt in node
 * imported express which we installed using node -> npm install express
 * imported socket.io for client which we insalled using node -> npm install socket.io socket.io-client 
 */
const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const {
    Server
} = require('socket.io');
const ACTIONS = require('./src/Actions');

// basically to create a server this code is used
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build'));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const userSocketMap = {};

function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

// When a socket is connected io.on event will be triggered n call its event listener method where we have defined other method
io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({
        roomId,
        username
    }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({
            socketId
        }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({
        roomId,
        code
    }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {
            code
        });
    });

    socket.on(ACTIONS.SYNC_CODE, ({
        socketId,
        code
    }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, {
            code
        });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
});

// When the server starts, it will listen on port 5000 set by user
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));