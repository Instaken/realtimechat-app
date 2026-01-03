import { useState, useEffect, useRef } from 'react';
import { socketService } from '../services/socket';

export const useChatSocket = (roomId, room) => {
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        if (!roomId) return;

        const join = async () => {
            try {
                await socketService.joinRoom(roomId);
            } catch (err) {
                console.error("Failed to join room:", err);
            }
        };
        join();

        const handleReceiveMessage = (newMsg) => {
            if (newMsg.roomId === roomId || newMsg.room_id === roomId) {
                setMessages(prev => {
                    if (prev.some(m => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });
            }
        };

        const handleUserJoined = (data) => {
            console.log("User joined:", data);
            setOnlineUsers(prev => {
                if (prev.some(u => u.userId === data.userId || u.id === data.userId)) return prev;
                return [...prev, {
                    userId: data.userId || data.user?.id,
                    username: data.username || data.user?.username,
                    socketId: data.socketId
                }];
            });
        };

        const handleUserLeft = (data) => {
            console.log("User left:", data);
            setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId && u.socketId !== data.socketId));
        };

        const handleOnlineUsers = (users) => {
            console.log("Online users sync:", users);
            setOnlineUsers(users.map(u => ({
                userId: u.userId || u.id,
                username: u.username,
                socketId: u.socketId
            })));
        };

        const handleUserTyping = (data) => {
            const targetRoomId = String(data.roomId);
            const currentRoomSlug = String(roomId);
            const currentRoomId = room ? String(room.id) : null;

            if (targetRoomId !== currentRoomSlug && targetRoomId !== currentRoomId) return;

            const username = data.username || data.user?.username;
            if (!username) return;

            setTypingUsers(prev => {
                if (!prev.includes(username)) return [...prev, username];
                return prev;
            });
        };

        const handleUserStoppedTyping = (data) => {
            const targetRoomId = String(data.roomId);
            const currentRoomSlug = String(roomId);
            const currentRoomId = room ? String(room.id) : null;

            if (targetRoomId !== currentRoomSlug && targetRoomId !== currentRoomId) return;

            const username = data.username || data.user?.username;
            setTypingUsers(prev => prev.filter(u => u !== username));
        };

        socketService.onReceiveMessage(handleReceiveMessage);
        socketService.onUserJoined(handleUserJoined);
        socketService.onUserLeft(handleUserLeft);
        socketService.onOnlineUsers(handleOnlineUsers);
        socketService.onUserTyping(handleUserTyping);
        socketService.onUserStoppedTyping(handleUserStoppedTyping);

        return () => {
            socketService.leaveRoom(roomId);
            socketService.off('receive_message');
            socketService.off('user_joined');
            socketService.off('user_left');
            socketService.off('online_users');
            socketService.off('user_typing');
            socketService.off('user_stopped_typing');
        };
    }, [roomId, room]);

    const handleSendMessage = async (content) => {
        try {
            await socketService.sendMessage(roomId, content);
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const handleTyping = () => {
        socketService.startTyping(roomId);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socketService.stopTyping(roomId);
        }, 3000);
    };

    return {
        messages,
        setMessages, // Exported if needed for initial load
        onlineUsers,
        typingUsers,
        sendMessage: handleSendMessage,
        handleTyping
    };
};
