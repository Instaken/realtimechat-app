import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
    socket = null;

    connect(token) {
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling'], // Fallback options
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Connected to Socket.io server ID:', this.socket.id);
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from socket:', reason);
        });
    }

    // Room actions
    joinRoom(roomId) {
        if (!this.socket) return;
        return new Promise((resolve, reject) => {
            this.socket.emit('join_room', { roomId }, (response) => {
                if (response?.ok) {
                    resolve(response);
                } else {
                    reject(response?.error || 'Failed to join room');
                }
            });
        });
    }

    leaveRoom(roomId) {
        if (!this.socket) return;
        this.socket.emit('leave_room', { roomId });
    }

    // Messaging actions
    sendMessage(roomId, content) {
        if (!this.socket) return;
        return new Promise((resolve, reject) => {
            this.socket.emit('send_message', { roomId, content }, (response) => {
                if (response?.ok) {
                    resolve(response.messageId);
                } else {
                    reject(response?.error || 'Failed to send message');
                }
            });
        });
    }

    // Typing indicators
    startTyping(roomId) {
        if (!this.socket) return;
        this.socket.emit('typing_start', { roomId });
    }

    stopTyping(roomId) {
        if (!this.socket) return;
        this.socket.emit('typing_stop', { roomId });
    }

    // Event Listeners
    onUserJoined(callback) {
        if (!this.socket) return;
        this.socket.on('user_joined', callback);
    }

    onUserLeft(callback) {
        if (!this.socket) return;
        this.socket.on('user_left', callback);
    }

    onOnlineUsers(callback) {
        if (!this.socket) return;
        this.socket.on('online_users', callback);
    }

    onReceiveMessage(callback) {
        if (!this.socket) return;
        this.socket.on('receive_message', callback);
    }

    onUserTyping(callback) {
        if (!this.socket) return;
        this.socket.on('user_typing', callback);
    }

    onUserStoppedTyping(callback) {
        if (!this.socket) return;
        this.socket.on('user_stopped_typing', callback);
    }

    // Cleanup listeners to prevent memory leaks in components
    off(event) {
        if (!this.socket) return;
        this.socket.off(event);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new SocketService();
