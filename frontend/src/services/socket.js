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

        // Debug: Listen to ALL events to find the correct message event name
        this.socket.onAny((eventName, ...args) => {
            console.log('🔍 [DEBUG] Socket event received:', eventName, args);
        });
    }

    // Room actions
    joinRoom(roomId) {
        if (!this.socket) {
            console.error('❌ Socket not initialized!');
            return Promise.reject('Socket not initialized');
        }
        return new Promise((resolve, reject) => {
            console.log('📤 Emitting join_room for:', roomId);
            console.log('📤 Socket connected:', this.socket.connected);
            console.log('📤 Socket ID:', this.socket.id);
            
            this.socket.emit('join_room', { roomId }, (response) => {
                console.log('📥 join_room callback response (full):', JSON.stringify(response, null, 2));
                
                if (response?.ok) {
                    resolve(response);
                } else {
                    const errorMsg = response?.error || 'Failed to join room';
                    const errorDetails = response?.message || response?.msg || 'No error details provided';
                    console.error('❌ Join room error:', errorMsg);
                    console.error('❌ Error message:', errorDetails);
                    console.error('❌ Full error response:', response);
                    reject(new Error(`${errorMsg}: ${errorDetails}`));
                }
            });
        });
    }

    // Request online users for a room
    requestOnlineUsers(roomId) {
        if (!this.socket) return;
        console.log('🔍 Requesting online users for room:', roomId);
        this.socket.emit('get_online_users', { roomId });
    }

    leaveRoom(roomId) {
        if (!this.socket) return;
        this.socket.emit('leave_room', { roomId });
    }

    // Messaging actions
    sendMessage(roomId, content) {
        if (!this.socket) return;
        console.log('📤 [sendMessage] Sending message:', { roomId, content });
        console.log('📤 [sendMessage] Socket connected:', this.socket.connected);
        
        return new Promise((resolve, reject) => {
            this.socket.emit('send_message', { roomId, content }, (response) => {
                console.log('📥 [sendMessage] Response:', response);
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
        console.log('⌨️ [Frontend] Emitting typing_start for room:', roomId);
        this.socket.emit('typing_start', { roomId });
    }

    stopTyping(roomId) {
        if (!this.socket) return;
        console.log('⌨️ [Frontend] Emitting typing_stop for room:', roomId);
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
        console.log('👂 [Frontend] Listening for receive_message and new_message events');
        // Listen to both possible event names from backend
        this.socket.on('receive_message', (data) => {
            console.log('📨 [Frontend] Received receive_message:', data);
            callback(data);
        });
        this.socket.on('new_message', (data) => {
            console.log('📨 [Frontend] Received new_message:', data);
            callback(data);
        });
    }

    onUserTyping(callback) {
        if (!this.socket) return;
        console.log('👂 [Frontend] Listening for user_typing events');
        this.socket.on('user_typing', (data) => {
            console.log('📨 [Frontend] Received user_typing event:', data);
            callback(data);
        });
    }

    onUserStoppedTyping(callback) {
        if (!this.socket) return;
        console.log('👂 [Frontend] Listening for user_stopped_typing events');
        this.socket.on('user_stopped_typing', (data) => {
            console.log('📨 [Frontend] Received user_stopped_typing event:', data);
            callback(data);
        });
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
