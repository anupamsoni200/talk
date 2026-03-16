const activeUsers = new Map(); // socket.id -> profile

module.exports = {
    addUser: (socketId, profile) => {
        activeUsers.set(socketId, profile);
    },
    removeUser: (socketId) => {
        activeUsers.delete(socketId);
    },
    getAllUsers: () => {
        return Array.from(activeUsers.values());
    },
    getUser: (socketId) => {
        return activeUsers.get(socketId);
    }
};
