const queue = [];

module.exports = {
    addToQueue: (socket, io) => {
        if (!queue.includes(socket.id)) {
            queue.push(socket.id);
        }

        if (queue.length >= 2) {
            const user1Id = queue.shift();
            const user2Id = queue.shift();

            // Notify both users with roles
            // user1 will be the initiator
            io.to(user1Id).emit('match_found', { target: user2Id, isInitiator: true });
            io.to(user2Id).emit('match_found', { target: user1Id, isInitiator: false });
        }
    },

    removeFromQueue: (socketId) => {
        const index = queue.indexOf(socketId);
        if (index > -1) {
            queue.splice(index, 1);
        }
    }
};
