const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const matchMaker = require('./matchMaker');
const socketHandler = require('./socketHandler');

const config = require('./config');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

const PORT = config.PORT;

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socketHandler(io, socket);
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
