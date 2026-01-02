import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
    socket = null;

    connect(token) {
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            auth: {
                token: token
            }
        });

        this.socket.on('connect', () => {
            console.log('Connected to Socket.io server');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });
    }

    joinRoom(roomId) {
        if (!this.socket) return;
        this.socket.emit('room', roomId);
    }

    sendMessage(messageData) {
        if (!this.socket) return;
        // messageData should match MessageData type in backend
        this.socket.emit('message', messageData);
    }

    onMessage(callback) {
        if (!this.socket) return;
        this.socket.on('messageReturn', callback);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new SocketService();
