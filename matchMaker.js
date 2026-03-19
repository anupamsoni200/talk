// Global queues categorized by mode
const queues = {
    text: [],
    video: [],
    audio: []
};

module.exports = {
    addToQueue: (socket, io, mode = 'video') => {
        const modeQueue = queues[mode] || queues.video;
        
        if (!modeQueue.includes(socket.id)) {
            modeQueue.push(socket.id);
        }

        console.log(`User ${socket.id} joined ${mode} queue. Queue size: ${modeQueue.length}`);

        if (modeQueue.length >= 2) {
            // Basic matching logic: Find two users
            // Future improvement: Check interests here
            const user1Id = modeQueue.shift();
            const user2Id = modeQueue.shift();

            const activeUsers = require('./activeUsers');
            const user1 = activeUsers.getUser(user1Id);
            const user2 = activeUsers.getUser(user2Id);

            console.log(`Match found in ${mode}: ${user1Id} <-> ${user2Id}`);

            // Notify both users
            io.to(user1Id).emit('match_found', { 
                target: user2Id, 
                targetUsername: user2 ? user2.username : 'Stranger',
                isInitiator: true,
                mode: mode
            });
            io.to(user2Id).emit('match_found', { 
                target: user1Id, 
                targetUsername: user1 ? user1.username : 'Stranger',
                isInitiator: false,
                mode: mode
            });
        }
    },

    removeFromQueue: (socketId) => {
        Object.keys(queues).forEach(mode => {
            const index = queues[mode].indexOf(socketId);
            if (index > -1) {
                queues[mode].splice(index, 1);
                console.log(`User ${socketId} removed from ${mode} queue.`);
            }
        });
    }
};
