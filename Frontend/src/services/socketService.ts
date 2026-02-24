import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private static instance: SocketService;

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public connect(url: string = 'http://localhost:5000') {
        if (this.socket?.connected) return;

        this.socket = io(url, {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('[Socket] Connected to backend');
        });

        this.socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error);
        });
    }

    public joinRoom(repoId: string, user: any) {
        if (!this.socket) return;
        this.socket.emit('join-room', {
            ...user,
            repoId
        });
    }

    public onRoomOccupancy(callback: (users: any[]) => void) {
        this.socket?.on('room-occupancy', callback);
    }

    public emitCursorMove(repoId: string, position: { line: number, ch: number }) {
        this.socket?.emit('cursor-move', { repoId, position });
    }

    public onUserCursorMove(callback: (data: { userId: string, position: any }) => void) {
        this.socket?.on('user-cursor-move', callback);
    }

    public disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }
}

export const socketService = SocketService.getInstance();
