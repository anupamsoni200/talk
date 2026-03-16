const queue = [];

module.exports = {
    addToQueue: (socket, io) => {
        if (!queue.includes(socket.id)) {
            queue.push(socket.id);
        }

        if (queue.length >= 2) {
            const user1Id = queue.shift();
            const user2Id = queue.shift();

            const user1 = require('./activeUsers').getUser(user1Id);
            const user2 = require('./activeUsers').getUser(user2Id);

            // Notify both users with roles and names
            io.to(user1Id).emit('match_found', { 
                target: user2Id, 
                targetUsername: user2 ? user2.username : 'Stranger',
                isInitiator: true 
            });
            io.to(user2Id).emit('match_found', { 
                target: user1Id, 
                targetUsername: user1 ? user1.username : 'Stranger',
                isInitiator: false 
            });
        }
    },

    removeFromQueue: (socketId) => {
        const index = queue.indexOf(socketId);
        if (index > -1) {
            queue.splice(index, 1);
        }
    }
};
