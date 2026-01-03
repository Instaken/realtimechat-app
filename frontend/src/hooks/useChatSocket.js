import { useState, useEffect, useRef } from 'react';
import { socketService } from '../services/socket';

export const useChatSocket = (roomId, room, participants = []) => {
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        if (!roomId) return;

        // Socket bağlantısını bekle
        const waitForSocket = () => {
            if (!socketService.socket) {
                console.log('⏳ Waiting for socket connection...');
                const token = localStorage.getItem('chat_token');
                if (token) {
                    socketService.connect(token);
                }
                // Socket bağlanana kadar bekle
                setTimeout(waitForSocket, 100);
                return;
            }

            if (!socketService.socket.connected) {
                console.log('⏳ Socket exists but not connected, waiting...');
                setTimeout(waitForSocket, 100);
                return;
            }

            console.log('✅ Socket connected, joining room...');
            join();
        };

        const join = async () => {
            try {
                const response = await socketService.joinRoom(roomId);
                console.log('🚪 Join room response:', response);
                
                // Backend'den online users listesi gelirse set et
                if (response?.onlineUsers && Array.isArray(response.onlineUsers)) {
                    console.log('📋 Setting initial online users from join response:', response.onlineUsers);
                    console.log('📋 First user from response:', response.onlineUsers[0]);
                    
                    setOnlineUsers(response.onlineUsers.map(u => ({
                        userId: u.userId || u.id || u.user?.id,
                        username: u.username || u.user?.username || u.name,
                        socketId: u.socketId || u.socket_id || u.id
                    })));
                } else {
                    // Eğer join response'unda online users yoksa, manuel request et
                    console.log('⚠️ No online users in join response, requesting manually...');
                    setTimeout(() => {
                        socketService.requestOnlineUsers(roomId);
                    }, 500);
                }
            } catch (err) {
                console.error("❌ Failed to join room:", err);
                console.error("❌ Error details:", JSON.stringify(err));
                console.error("❌ RoomId:", roomId);
                // Devam et, socket event listener'ları kurulmalı
            }
        };

        waitForSocket();

        const handleReceiveMessage = (newMsg) => {
            console.log('📩 [handleReceiveMessage] New message received:', newMsg);
            console.log('📩 [handleReceiveMessage] Message roomId:', newMsg.roomId);
            console.log('📩 [handleReceiveMessage] Current roomId (slug):', roomId);
            console.log('📩 [handleReceiveMessage] Current room.id (UUID):', room?.id);
            
            // Backend UUID gönderiyor, frontend slug kullanıyor - ikisini de kontrol et
            const isMatchingRoom = 
                newMsg.roomId === roomId || 
                newMsg.room_id === roomId ||
                newMsg.roomId === room?.id ||
                newMsg.room_id === room?.id;
            
            console.log('📩 [handleReceiveMessage] Room match:', isMatchingRoom);
            
            if (isMatchingRoom) {
                setMessages(prev => {
                    if (prev.some(m => m.id === newMsg.id)) {
                        console.log('📩 [handleReceiveMessage] Duplicate message, skipping');
                        return prev;
                    }
                    console.log('📩 [handleReceiveMessage] Adding message to state');
                    return [...prev, newMsg];
                });
            } else {
                console.log('📩 [handleReceiveMessage] Room mismatch, ignoring message');
            }
        };

        const handleUserJoined = (data) => {
            console.log("👋 User joined:", data);
            
            // Backend: { userId, username, roomId }
            // Sadece bu room için ekle
            if (data.roomId && String(data.roomId) !== String(roomId) && String(data.roomId) !== String(room?.id)) {
                return;
            }
            
            setOnlineUsers(prev => {
                const userId = data.userId || data.user?.id || data.id;
                let username = data.username || data.user?.username || data.name;
                const socketId = data.socketId || data.socket_id;
                
                // Username yoksa participants'tan bul
                if (!username && userId && participants.length > 0) {
                    const participant = participants.find(p => 
                        String(p.user?.id || p.userId) === String(userId)
                    );
                    username = participant?.user?.username || participant?.username;
                }
                
                if (prev.some(u => String(u.userId) === String(userId))) return prev;
                
                console.log('➕ Adding user to online list:', { userId, username, socketId });
                return [...prev, { userId, username, socketId }];
            });
        };

        const handleUserLeft = (data) => {
            console.log("👋 User left:", data);
            
            // Backend: { userId, username, roomId }
            // Sadece bu room için çıkar
            if (data.roomId && String(data.roomId) !== String(roomId) && String(data.roomId) !== String(room?.id)) {
                return;
            }
            
            setOnlineUsers(prev => prev.filter(u => String(u.userId) !== String(data.userId)));
        };

        const handleOnlineUsers = (data) => {
            console.log('📡 Online users event received:', data);
            console.log('📡 Data type:', typeof data, 'Is array:', Array.isArray(data));
            
            // Backend obje olarak gönderiyorsa users field'ına bak
            let usersArray = [];
            if (Array.isArray(data)) {
                usersArray = data;
            } else if (data && Array.isArray(data.users)) {
                usersArray = data.users;
            }
            
            console.log('📡 Users array:', usersArray);
            console.log('📡 First user structure:', usersArray?.[0]);
            
            const mappedUsers = usersArray.map(u => {
                // Backend'den farklı yapılarda data gelebilir
                const userId = u.userId || u.id || u.user?.id;
                let username = u.username || u.user?.username || u.name;
                const socketId = u.socketId || u.socket_id || u.id;
                
                // Eğer username yoksa participants'tan bulmaya çalış
                if (!username && userId && participants.length > 0) {
                    const participant = participants.find(p => 
                        String(p.user?.id || p.userId) === String(userId)
                    );
                    username = participant?.user?.username || participant?.username;
                }
                
                console.log('🔄 Mapping user:', { original: u, mapped: { userId, username, socketId } });
                
                return {
                    userId,
                    username,
                    socketId
                };
            });
            
            console.log('📋 Mapped online users:', mappedUsers);
            setOnlineUsers(mappedUsers);
        };

        const handleUserTyping = (data) => {
            console.log('⌨️ User typing event:', data);
            console.log('⌨️ Current roomId:', roomId, 'Room ID from room obj:', room?.id);
            console.log('⌨️ Current participants:', participants);
            console.log('⌨️ Current onlineUsers:', onlineUsers);
            
            // Backend'den gelen roomId ile mevcut roomId'yi karşılaştır
            if (data.roomId) {
                const targetRoomId = String(data.roomId);
                const currentRoomSlug = String(roomId);
                const currentRoomId = room ? String(room.id) : null;

                if (targetRoomId !== currentRoomSlug && targetRoomId !== currentRoomId) {
                    console.log('⌨️ Room mismatch, ignoring typing event');
                    return;
                }
            }

            // Username'i bul - öncelik sırası: event data > participants > onlineUsers
            let username = null;
            
            // 1. Event'ten gelen username (eğer "Anonymous" değilse)
            if (data.username && data.username !== 'Anonymous') {
                username = data.username;
            }
            
            // 2. Participants'tan userId ile eşleştir
            if (!username && data.userId && participants.length > 0) {
                const participant = participants.find(p => {
                    const pUserId = p.user?.id || p.userId;
                    return String(pUserId) === String(data.userId);
                });
                
                if (participant) {
                    username = participant.user?.username || participant.username;
                    console.log('⌨️ Found username from participants:', username);
                }
            }
            
            // 3. OnlineUsers'tan userId ile eşleştir
            if (!username && data.userId && onlineUsers.length > 0) {
                const onlineUser = onlineUsers.find(u => String(u.userId) === String(data.userId));
                if (onlineUser && onlineUser.username !== 'Anonymous') {
                    username = onlineUser.username;
                    console.log('⌨️ Found username from onlineUsers:', username);
                }
            }
            
            // 4. Fallback
            if (!username) {
                username = data.username || 'Anonymous';
            }
            
            console.log('⌨️ Final username for typing:', username);

            setTypingUsers(prev => {
                const newList = prev.includes(username) ? prev : [...prev, username];
                console.log('⌨️ Updated typing users:', newList);
                return newList;
            });
        };

        const handleUserStoppedTyping = (data) => {
            console.log('⌨️ User stopped typing event:', data);
            
            // Backend'den gelen roomId ile mevcut roomId'yi karşılaştır
            if (data.roomId) {
                const targetRoomId = String(data.roomId);
                const currentRoomSlug = String(roomId);
                const currentRoomId = room ? String(room.id) : null;

                if (targetRoomId !== currentRoomSlug && targetRoomId !== currentRoomId) {
                    console.log('⌨️ Room mismatch, ignoring stopped typing event');
                    return;
                }
            }

            // Username'i bul - aynı mantık
            let username = null;
            
            if (data.username && data.username !== 'Anonymous') {
                username = data.username;
            }
            
            if (!username && data.userId && participants.length > 0) {
                const participant = participants.find(p => {
                    const pUserId = p.user?.id || p.userId;
                    return String(pUserId) === String(data.userId);
                });
                
                if (participant) {
                    username = participant.user?.username || participant.username;
                }
            }
            
            if (!username && data.userId && onlineUsers.length > 0) {
                const onlineUser = onlineUsers.find(u => String(u.userId) === String(data.userId));
                if (onlineUser && onlineUser.username !== 'Anonymous') {
                    username = onlineUser.username;
                }
            }
            
            if (!username) {
                username = data.username || 'Anonymous';
            }

            console.log('⌨️ Removing typing user:', username);
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
            socketService.off('new_message');
            socketService.off('user_joined');
            socketService.off('user_left');
            socketService.off('online_users');
            socketService.off('user_typing');
            socketService.off('user_stopped_typing');
        };
    }, [roomId, room, participants]); // Added participants to dependency array

    const handleSendMessage = async (content) => {
        try {
            await socketService.sendMessage(roomId, content);
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const handleTyping = () => {
        console.log('⌨️ [Hook] handleTyping called for room:', roomId);
        socketService.startTyping(roomId);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            console.log('⌨️ [Hook] Typing timeout, stopping typing');
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
