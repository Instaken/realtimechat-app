import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState({}); // { roomId: [username1, username2] }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    useEffect(() => {
        const token = localStorage.getItem('chat_token');
        if (!token) return;

        const newSocket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from socket server');
            setIsConnected(false);
        });

        newSocket.on('online_users', (users) => {
            setOnlineUsers(users);
        });

        newSocket.on('user_joined', (user) => {
            setOnlineUsers(prev => {
                if (prev.find(u => u.userId === user.userId)) return prev;
                return [...prev, user];
            });
        });

        newSocket.on('user_left', (userId) => {
            setOnlineUsers(prev => prev.filter(u => u.userId !== userId));
        });

        newSocket.on('user_typing', ({ roomId, username }) => {
            setTypingUsers(prev => {
                const roomTyping = prev[roomId] || [];
                if (roomTyping.includes(username)) return prev;
                return { ...prev, [roomId]: [...roomTyping, username] };
            });
        });

        newSocket.on('user_stopped_typing', ({ roomId, username }) => {
            setTypingUsers(prev => {
                const roomTyping = prev[roomId] || [];
                return { ...prev, [roomId]: roomTyping.filter(u => u !== username) };
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [SOCKET_URL]);

    const joinRoom = useCallback((roomId) => {
        if (socket && isConnected) {
            socket.emit('join_room', { roomId }, (response) => {
                if (response?.ok) {
                    console.log(`Successfully joined room: ${roomId}`);
                }
            });
        }
    }, [socket, isConnected]);

    const sendMessage = useCallback((roomId, content) => {
        return new Promise((resolve, reject) => {
            if (socket && isConnected) {
                socket.emit('send_message', { roomId, content }, (ack) => {
                    if (ack?.ok) {
                        resolve(ack.message);
                    } else {
                        reject(new Error(ack?.error || 'Failed to send message'));
                    }
                });
            } else {
                reject(new Error('Socket not connected'));
            }
        });
    }, [socket, isConnected]);

    const startTyping = useCallback((roomId) => {
        if (socket && isConnected) {
            socket.emit('typing_start', { roomId });
        }
    }, [socket, isConnected]);

    const stopTyping = useCallback((roomId) => {
        if (socket && isConnected) {
            socket.emit('typing_stop', { roomId });
        }
    }, [socket, isConnected]);

    const value = {
        socket,
        isConnected,
        onlineUsers,
        typingUsers,
        joinRoom,
        sendMessage,
        startTyping,
        stopTyping
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
