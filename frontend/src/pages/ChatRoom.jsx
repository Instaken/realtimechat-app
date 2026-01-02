import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Hash, Users, X } from 'lucide-react';
import { getRoomById, getMessages, sendMessage } from '../services/mockData';
import ChatSidebar from '../components/chat/ChatSidebar';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import { PageLoader } from '../components/common/Loading';

/**
 * Chat Room Page
 * Main chat interface with messages, input, and sidebar
 */
const ChatRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSidebar, setShowSidebar] = useState(true);

    // Load user and room data on mount
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('chat_user') || '{}');
        if (!user.id) {
            navigate('/login');
            return;
        }
        setCurrentUser(user);
        loadRoomData(user.id);
    }, [roomId, navigate]);

    const loadRoomData = async (userId) => {
        try {
            const roomData = await getRoomById(roomId);
            setRoom(roomData);

            // Load messages
            const msgs = await getMessages(roomId);
            setMessages(msgs);
        } catch (error) {
            console.error("Error loading chat", error);
            navigate('/app');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (content, type = 'text', attachmentUrl = null) => {
        try {
            const msg = await sendMessage(roomId, currentUser.id, content, type, attachmentUrl);
            setMessages([...messages, msg]);
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    if (loading || !currentUser) {
        return <PageLoader />;
    }

    const chatColor = room?.colors?.chatColor || '#464655';
    const roomInfoColor = room?.colors?.roomInfoColor || '#464655';

    return (
        <div className="flex h-full bg-gray-50 dark:bg-chat-dark">
            {/* Main Chat Area */}
            <div
                className="flex-1 flex flex-col min-w-0"
                style={{ backgroundColor: chatColor }}
            >
                {/* Chat Header */}
                <ChatHeader
                    room={room}
                    roomInfoColor={roomInfoColor}
                    showSidebar={showSidebar}
                    onToggleSidebar={() => setShowSidebar(!showSidebar)}
                />

                {/* Messages */}
                <MessageList
                    messages={messages}
                    currentUserId={currentUser.id}
                />

                {/* Input */}
                <ChatInput
                    onSendMessage={handleSendMessage}
                    roomSlug={room.slug}
                />
            </div>

            {/* Sidebar */}
            {showSidebar && (
                <ChatSidebar
                    room={room}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
};

/**
 * Chat Header Component
 * Shows room name and controls
 */
const ChatHeader = ({ room, roomInfoColor, showSidebar, onToggleSidebar }) => (
    <div
        className="h-16 border-b border-chat-grey/30 flex items-center justify-between px-6 backdrop-blur"
        style={{ backgroundColor: roomInfoColor }}
    >
        <div className="flex items-center gap-3">
            <Hash size={24} className="text-chat-grey" />
            <div>
                <h2 className="font-bold text-white leading-none">
                    {room.name}
                </h2>
                <p className="text-xs text-chat-light mt-1">
                    {room.slug ? `#${room.slug}` : 'Private Channel'}
                </p>
            </div>
        </div>

        <div className="flex items-center gap-2 text-chat-light">
            <button
                onClick={onToggleSidebar}
                className="flex items-center gap-2 px-3 py-2 hover:bg-chat-grey/20 rounded-lg transition-colors"
            >
                {showSidebar ? <X size={20} /> : <Users size={20} />}
                <span className="hidden md:inline text-sm font-medium">
                    {showSidebar ? 'Hide Details' : 'Show Details'}
                </span>
            </button>
        </div>
    </div>
);

export default ChatRoom;
