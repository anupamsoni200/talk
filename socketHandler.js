const matchMaker = require('./matchMaker');
const activeUsers = require('./activeUsers');

module.exports = (io, socket) => {
    socket.on('join_chat', (profile) => {
        console.log('User joined with profile:', profile.username);
        activeUsers.addUser(socket.id, { ...profile, socketId: socket.id });
        io.emit('online_users_count', activeUsers.getAllUsers().length);
        io.emit('active_users_updated', activeUsers.getAllUsers());
    });

    socket.on('request_active_users', () => {
        socket.emit('active_users_list', activeUsers.getAllUsers());
    });

    socket.on('start_match', (data) => {
        const mode = (data && data.mode) || 'video';
        console.log(`User ${socket.id} joined ${mode} queue.`);
        matchMaker.addToQueue(socket, io, mode);
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

    socket.on('typing', (data) => {
        const { target } = data;
        io.to(target).emit('typing', { from: socket.id });
    });

    socket.on('stop_typing', (data) => {
        const { target } = data;
        io.to(target).emit('stop_typing', { from: socket.id });
    });

    socket.on('send_message', (data) => {
        const { target, message } = data;
        io.to(target).emit('receive_message', { from: socket.id, message, timestamp: Date.now() });
    });

    socket.on('call_ready', (data) => {
        console.log('Call ready from:', socket.id, 'to:', data.target);
        io.to(data.target).emit('peer_ready', { from: socket.id });
    });

    socket.on('disconnect', () => {
        activeUsers.removeUser(socket.id);
        matchMaker.removeFromQueue(socket.id);
        io.emit('online_users_count', activeUsers.getAllUsers().length);
        io.emit('active_users_updated', activeUsers.getAllUsers());
        console.log('User disconnected:', socket.id);
    });
};
