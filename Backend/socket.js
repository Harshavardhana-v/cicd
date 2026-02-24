import { Server } from 'socket.io';

export const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    console.log('[Socket] Initialized');

    const users = new Map();

    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        socket.on('join-room', ({ userId, userName, userAvatar, userColor, repoId }) => {
            socket.join(repoId);
            users.set(socket.id, { userId, userName, userAvatar, userColor, repoId });

            // Broadcast occupancy to the room
            const roomUsers = Array.from(users.values()).filter(u => u.repoId === repoId);
            io.to(repoId).emit('room-occupancy', roomUsers);

            console.log(`[Socket] User ${userName} joined room: ${repoId}`);
        });

        socket.on('cursor-move', ({ position, repoId }) => {
            const user = users.get(socket.id);
            if (user) {
                socket.to(repoId).emit('user-cursor-move', {
                    userId: user.userId,
                    position
                });
            }
        });

        socket.on('disconnect', () => {
            const user = users.get(socket.id);
            if (user) {
                const repoId = user.repoId;
                users.delete(socket.id);
                const roomUsers = Array.from(users.values()).filter(u => u.repoId === repoId);
                io.to(repoId).emit('room-occupancy', roomUsers);
                console.log(`[Socket] User ${user.userName} disconnected`);
            }
        });
    });

    return io;
};
