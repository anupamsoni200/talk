const matchMaker = require('./matchMaker');
const activeUsers = require('./activeUsers');

module.exports = (io, socket) => {
    socket.on('join_chat', (profile) => {
        console.log('User joined with profile:', profile.username);
        activeUsers.addUser(socket.id, { ...profile, socketId: socket.id });
        io.emit('active_users_updated', activeUsers.getAllUsers());
    });

    socket.on('request_active_users', () => {
        socket.emit('active_users_list', activeUsers.getAllUsers());
    });

    socket.on('start_match', () => {
        console.log('User joined queue:', socket.id);
        matchMaker.addToQueue(socket, io);
    });

    socket.on('offer', (data) => {
        const { target, sdp } = data;
        io.to(target).emit('offer', { from: socket.id, sdp });
    });

    socket.on('answer', (data) => {
        const { target, sdp } = data;
        io.to(target).emit('answer', { from: socket.id, sdp });
    });

    socket.on('ice_candidate', (data) => {
        const { target, candidate } = data;
        io.to(target).emit('ice_candidate', { from: socket.id, candidate });
    });

    socket.on('send_message', (data) => {
        const { target, message } = data;
        io.to(target).emit('receive_message', { from: socket.id, message, timestamp: Date.now() });
    });

    socket.on('disconnect', () => {
        activeUsers.removeUser(socket.id);
        matchMaker.removeFromQueue(socket.id);
        io.emit('active_users_updated', activeUsers.getAllUsers());
        console.log('User disconnected:', socket.id);
    });
};
