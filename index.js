const port = process.env.PORT || 3000;
const io = require("socket.io")(port, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let queue = {
    "18-25": [],
    "26-35": [],
    "36+": []
};

io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);

    socket.on("join_queue", (ageGroup) => {
        if (!queue[ageGroup]) ageGroup = "18-25"; // Default safety

        console.log(`User ${socket.id} joined ${ageGroup} queue`);

        if (queue[ageGroup].length > 0) {
            const peerId = queue[ageGroup].shift();
            console.log(`Matching ${socket.id} with ${peerId}`);
            
            // Notify both to start calling
            socket.emit("match_found", { peerId: peerId, initiator: true });
            io.to(peerId).emit("match_found", { peerId: socket.id, initiator: false });
        } else {
            queue[ageGroup].push(socket.id);
            socket.ageGroup = ageGroup;
        }
    });

    socket.on("signal", (data) => {
        io.to(data.target).emit("signal", {
            sender: socket.id,
            type: data.type,
            sdp: data.sdp,
            candidate: data.candidate
        });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected: " + socket.id);
        if (socket.ageGroup && queue[socket.ageGroup]) {
            queue[socket.ageGroup] = queue[socket.ageGroup].filter(id => id !== socket.id);
        }
    });
});

console.log(`Server running on port ${port}`);