import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Hash, Users, X } from 'lucide-react';
import { roomService } from '../services/api';
import ChatSidebar from '../components/chat/ChatSidebar';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import { PageLoader } from '../components/common/Loading';
import { useSocket } from '../context/SocketContext';

/**
 * Chat Room Page
 * Main chat interface with messages, input, and sidebar
 */
const ChatRoom = () => {
    const { roomId } = useParams(); // This is the ID or Slug
    const navigate = useNavigate();
    const { socket, joinRoom, sendMessage, startTyping, stopTyping, typingUsers, onlineUsers } = useSocket();

    const [currentUser, setCurrentUser] = useState(null);
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSidebar, setShowSidebar] = useState(true);
    const typingTimeoutRef = useRef(null);

    // Initial Load
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('chat_user') || '{}');
        const token = localStorage.getItem('chat_token');

        if (!user.id || !token) {
            navigate('/auth');
            return;
        }

        setCurrentUser(user);
        loadRoomData();
    }, [roomId, navigate]);

    // Socket Setup
    useEffect(() => {
        if (room?.id) {
            joinRoom(room.id);

            if (socket) {
                const handleNewMessage = (newMsg) => {
                    // Check if message belongs to this room
                    if (newMsg.roomId === room.id || newMsg.room === room.id) {
                        setMessages(prev => {
                            // Avoid duplicates if we already added it via ack
                            if (prev.find(m => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        });
                    }
                };

                socket.on('receive_message', handleNewMessage);
                return () => {
                    socket.off('receive_message', handleNewMessage);
                };
            }
        }
    }, [room?.id, socket, joinRoom]);

    const loadRoomData = async () => {
        try {
            setLoading(true);
            let roomData;
            try {
                roomData = await roomService.getRoomBySlug(roomId);
            } catch {
                roomData = await roomService.getRoomById(roomId);
            }
            setRoom(roomData);
            setMessages([]); // Or fetch history from API
        } catch (error) {
            console.error("Error loading chat", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (content, type = 'text', attachmentUrl = null) => {
        try {
            // Optimistic update
            const tempId = Date.now().toString();
            const optimisticMsg = {
                id: tempId,
                roomId: room.id,
                userId: currentUser.id,
                content,
                type,
                attachment_url: attachmentUrl,
                sender: currentUser,
                createdAt: new Date().toISOString(),
                isSending: true
            };

            setMessages(prev => [...prev, optimisticMsg]);

            // Real send via socket
            const savedMsg = await sendMessage(room.id, content);

            // Update optimistic message with real one from backend
            setMessages(prev => prev.map(m => m.id === tempId ? savedMsg : m));

            // Stop typing explicitly
            stopTyping(room.id);
        } catch (error) {
            console.error("Failed to send message", error);
            // Mark as failed in UI if needed
        }
    };

    const handleTyping = () => {
        startTyping(room.id);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            stopTyping(room.id);
        }, 3000);
    };

    if (loading || !currentUser) {
        return <PageLoader />;
    }

    if (!room) {
        return (
            <div className="flex items-center justify-center h-full text-white bg-chat-dark">
                Room not found
            </div>
        );
    }

    // Extract & Parse UI Settings
    let uiSettings = room.uiSettings || {};
    if (typeof uiSettings === 'string') {
        try {
            uiSettings = JSON.parse(uiSettings);
        } catch (e) {
            console.error("Failed to parse uiSettings", e);
            uiSettings = {};
        }
    }

    const { fontSettings = { family: 'Inter', baseSize: 14, weight: 'medium' } } = uiSettings;
    const primaryColor = uiSettings.primaryColor || '#6366f1';

    // Log for debugging
    console.log("Applied UI Settings:", uiSettings);

    return (
        <div
            className="flex h-full bg-gray-50 dark:bg-chat-dark overflow-hidden transition-all duration-500"
            style={{
                fontFamily: `'${fontSettings.family}', sans-serif`,
                fontSize: `${fontSettings.baseSize}px`
            }}
        >
            <div
                className="flex-1 flex flex-col min-w-0"
                style={{
                    backgroundColor: uiSettings.bgType === 'color' ? uiSettings.bgValue : (uiSettings.bgType === 'gradient' ? 'transparent' : '#1f2937'),
                    backgroundImage: uiSettings.bgType === 'image' ? `url(${uiSettings.bgValue})` : (uiSettings.bgType === 'gradient' ? uiSettings.bgValue : 'none'),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <ChatHeader
                    room={room}
                    uiSettings={uiSettings}
                    showSidebar={showSidebar}
                    onToggleSidebar={() => setShowSidebar(!showSidebar)}
                />

                <MessageList
                    messages={messages}
                    currentUserId={currentUser.id}
                    uiSettings={uiSettings}
                />

                {/* Typing Indicator */}
                <div className="px-6 h-6">
                    {typingUsers[room.id]?.length > 0 && (
                        <div className="flex items-center gap-2 text-[10px] text-chat-light animate-pulse font-bold uppercase tracking-widest">
                            <div className="flex gap-1">
                                <span className="w-1 h-1 bg-chat-light rounded-full"></span>
                                <span className="w-1 h-1 bg-chat-light rounded-full"></span>
                                <span className="w-1 h-1 bg-chat-light rounded-full"></span>
                            </div>
                            <span>
                                {typingUsers[room.id].join(', ')} {typingUsers[room.id].length > 1 ? 'are' : 'is'} typing...
                            </span>
                        </div>
                    )}
                </div>

                <ChatInput
                    onSendMessage={handleSendMessage}
                    onTyping={handleTyping}
                    roomSlug={room.slug}
                    uiSettings={uiSettings}
                />
            </div>

            {showSidebar && (
                <ChatSidebar
                    room={room}
                    currentUser={currentUser}
                    onlineUsers={onlineUsers}
                />
            )}
        </div>
    );
};

const ChatHeader = ({ room, uiSettings, showSidebar, onToggleSidebar }) => (
    <div
        className="h-16 border-b border-chat-grey/30 flex items-center justify-between px-6 backdrop-blur bg-white/10 dark:bg-chat-dark/30"
        style={{ borderBottomColor: uiSettings?.primaryColor }}
    >
        <div className="flex items-center gap-3">
            <Hash size={24} style={{ color: uiSettings?.primaryColor || '#6366f1' }} />
            <div>
                <h2 className="font-bold text-white leading-none">
                    {room.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-chat-grey/20 text-chat-light px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                        #{room.slug}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] text-chat-light/50 font-medium">LIVE</span>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-2 text-chat-light">
            <button
                onClick={onToggleSidebar}
                className="flex items-center gap-2 px-3 py-2 hover:bg-chat-grey/20 rounded-lg transition-colors group"
            >
                {showSidebar ? <X size={20} /> : <Users size={20} className="group-hover:scale-110 transition-transform" />}
                <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">
                    {showSidebar ? 'Hide Details' : 'Details'}
                </span>
            </button>
        </div>
    </div>
);

export default ChatRoom;
