import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Hash, Users, X } from 'lucide-react';
import { roomService } from '../services/api';
import ChatSidebar from '../components/chat/ChatSidebar';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import { PageLoader } from '../components/common/Loading';
import { socketService } from '../services/socket';

/**
 * Chat Room Page
 * Main chat interface with messages, input, and sidebar
 */
const ChatRoom = () => {
    const { roomId } = useParams(); // This could be an ID or a Slug
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSidebar, setShowSidebar] = useState(true);

    // Initialize socket and load data
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('chat_user') || '{}');
        const token = localStorage.getItem('chat_token');

        if (!user.id || !token) {
            navigate('/auth');
            return;
        }

        setCurrentUser(user);
        loadRoomData();

        // Socket logic
        socketService.connect(token);
        socketService.joinRoom(roomId);

        socketService.onMessage((newMsg) => {
            if (newMsg.room === roomId) {
                setMessages(prev => [...prev, newMsg]);
            }
        });

        return () => {
            // Optional: socketService.disconnect();
        };
    }, [roomId, navigate]);

    const loadRoomData = async () => {
        try {
            setLoading(true);
            // Try fetching by slug first as per backend routes
            let roomData;
            try {
                roomData = await roomService.getRoomBySlug(roomId);
            } catch {
                roomData = await roomService.getRoomById(roomId);
            }

            setRoom(roomData);

            // Fetch history if endpoint exists, otherwise empty
            // const msgs = await roomService.getMessages(roomId);
            // setMessages(msgs);
            setMessages([]);
        } catch (error) {
            console.error("Error loading chat", error);
            // navigate('/app');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (content, type = 'text', attachmentUrl = null) => {
        const messageData = {
            room: roomId,
            user: currentUser.id,
            content: content,
            type: type,
            attachment_url: attachmentUrl,
            sender: currentUser,
            created_at: new Date().toISOString()
        };

        try {
            socketService.sendMessage(messageData);
            setMessages(prev => [...prev, messageData]);
        } catch (error) {
            console.error("Failed to send message", error);
        }
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

                <ChatInput
                    onSendMessage={handleSendMessage}
                    roomSlug={room.slug}
                    uiSettings={uiSettings}
                />
            </div>

            {showSidebar && (
                <ChatSidebar
                    room={room}
                    currentUser={currentUser}
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
