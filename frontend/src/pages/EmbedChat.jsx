import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Hash } from 'lucide-react';
import { roomService } from '../services/api';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import { PageLoader } from '../components/common/Loading';

/**
 * EmbedChat Component
 * A stripped-down version of ChatRoom for Iframe embedding
 */
const EmbedChat = () => {
    const { roomId } = useParams(); // Can be ID, Slug, or API Key
    const [currentUser, setCurrentUser] = useState(null);
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let user = JSON.parse(localStorage.getItem('chat_user') || '{}');

        if (!user.id) {
            user = {
                id: 'guest_' + Math.random().toString(36).substr(2, 9),
                username: 'Guest_' + Math.floor(Math.random() * 1000),
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
            };
            localStorage.setItem('chat_user', JSON.stringify(user));
        }

        setCurrentUser(user);
        loadRoomData();
    }, [roomId]);

    const loadRoomData = async () => {
        try {
            setLoading(true);
            let roomData;

            // Try different lookup methods based on the parameter type
            // Typical logic: If it's short and prefix-based, it might be an API Key
            // But let's follow the documented priority
            try {
                // If the parameter looks like an API Key (e.g. starting with 'cl')
                if (roomId.startsWith('cl')) {
                    roomData = await roomService.getRoomByApiKey(roomId);
                } else {
                    roomData = await roomService.getRoomBySlug(roomId);
                }
            } catch (err) {
                console.warn("Lookup failed, trying room ID", err);
                // Fallback to direct ID fetch if possible (if your API supports it)
                // If not, we rely on the above
            }

            if (roomData) {
                // Parse uiSettings if string
                if (typeof roomData.uiSettings === 'string') {
                    try { roomData.uiSettings = JSON.parse(roomData.uiSettings); } catch (e) { }
                }
                setRoom(roomData);
            }
            setMessages([]);
        } catch (error) {
            console.error("Error loading embedded chat", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (content, type = 'text', attachmentUrl = null) => {
        const messageData = {
            id: Date.now().toString(),
            room: roomId,
            user: currentUser.id,
            content: content,
            type: type,
            attachment_url: attachmentUrl,
            sender: currentUser,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, messageData]);
    };

    if (loading) return <PageLoader />;
    if (!room) return (
        <div className="flex items-center justify-center h-screen bg-chat-dark text-white p-4 text-center">
            <div>
                <Hash size={40} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm font-medium">Room not found or invalid API Key.</p>
            </div>
        </div>
    );

    const ui = room.uiSettings || {};
    const font = ui.fontSettings || { family: 'Inter', baseSize: 14 };
    const primaryColor = ui.primaryColor || '#6366f1';

    return (
        <div
            className="flex flex-col h-screen w-full overflow-hidden transition-all duration-500"
            style={{
                fontFamily: `'${font.family}', sans-serif`,
                fontSize: `${font.baseSize}px`,
                backgroundColor: ui.bgType === 'color' ? ui.bgValue : (ui.bgType === 'gradient' ? 'transparent' : '#1f2937'),
                backgroundImage: ui.bgType === 'image' ? `url(${ui.bgValue})` : (ui.bgType === 'gradient' ? ui.bgValue : 'none'),
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className="h-14 flex items-center px-4 border-b border-white/10 shrink-0 backdrop-blur-md bg-black/20">
                <Hash size={18} style={{ color: primaryColor }} className="mr-2" />
                <h1 className="font-bold text-white text-sm truncate uppercase tracking-wider">
                    {room.name}
                </h1>
            </div>

            <div className="flex-1 min-h-0 bg-transparent">
                <MessageList
                    messages={messages}
                    currentUserId={currentUser?.id}
                    uiSettings={ui}
                />
            </div>

            <div className="shrink-0 bg-black/10 backdrop-blur-md">
                <ChatInput
                    onSendMessage={handleSendMessage}
                    roomSlug={room.slug}
                    uiSettings={ui}
                />
            </div>
        </div>
    );
};

export default EmbedChat;
