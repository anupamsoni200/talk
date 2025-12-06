const port = process.env.PORT || 3000;
const io = require("socket.io")(port, {
    cors: { origin: "*" }
});

// We use a single array to store waiting users
let waitingUsers = [];

io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);

    socket.on("join_queue", (data) => {
        // data contains: { ageGroup, gender, preference }
        const user = {
            id: socket.id,
            ageGroup: data.ageGroup,
            gender: data.gender,         // 'Male' or 'Female'
            preference: data.preference, // 'Male', 'Female', or 'Anyone'
            socket: socket
        };

        console.log(`User joined: ${user.gender} looking for ${user.preference} in ${user.ageGroup}`);

        // TRY TO FIND A MATCH
        const matchIndex = waitingUsers.findIndex((peer) => {
            // 1. Must be in same age group
            if (peer.ageGroup !== user.ageGroup) return false;

            // 2. Check User's Preference (What I want)
            // If I want 'Anyone', I don't care what peer is. 
            // If I want Specific, peer.gender must match.
            const userIsHappy = (user.preference === "Anyone") || (user.preference === peer.gender);

            // 3. Check Peer's Preference (What they want)
            const peerIsHappy = (peer.preference === "Anyone") || (peer.preference === user.gender);

            return userIsHappy && peerIsHappy;
        });

        if (matchIndex > -1) {
            // MATCH FOUND!
            const peer = waitingUsers.splice(matchIndex, 1)[0]; // Remove peer from queue
            
            console.log(`Matched ${user.id} with ${peer.id}`);

            // Notify both
            socket.emit("match_found", { peerId: peer.id, initiator: true });
            peer.socket.emit("match_found", { peerId: user.id, initiator: false });

        } else {
            // NO MATCH, ADD TO QUEUE
            waitingUsers.push(user);
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

    socket.on("leave_room", () => {
        // Used when user clicks "Next"
        handleDisconnect(socket);
    });

    socket.on("disconnect", () => {
        handleDisconnect(socket);
    });
});

function handleDisconnect(socket) {
    // Remove user from queue if they are waiting
    const index = waitingUsers.findIndex(u => u.id === socket.id);
    if (index !== -1) {
        waitingUsers.splice(index, 1);
        console.log("Removed waiting user: " + socket.id);
    }
}

console.log(`Server running on port ${port}`);
