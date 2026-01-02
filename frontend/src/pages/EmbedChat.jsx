import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Hash } from 'lucide-react';
import { getRoomById, getMessages, sendMessage } from '../services/mockData';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import { PageLoader } from '../components/common/Loading';

/**
 * EmbedChat Component
 * A stripped-down version of ChatRoom for Iframe embedding
 */
const EmbedChat = () => {
    const { roomId } = useParams();
    const [currentUser, setCurrentUser] = useState(null);
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // For embed, we can either check for existing user or create a guest session
        let user = JSON.parse(localStorage.getItem('chat_user') || '{}');

        if (!user.id) {
            // Auto-generate a guest user if none exists for the embed
            user = {
                id: 'guest_' + Math.random().toString(36).substr(2, 9),
                username: 'Guest_' + Math.floor(Math.random() * 1000),
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
            };
            localStorage.setItem('chat_user', JSON.stringify(user));
        }

        setCurrentUser(user);
        loadRoomData();
    }, [roomId]);

    const loadRoomData = async () => {
        try {
            const roomData = await getRoomById(roomId);
            setRoom(roomData);

            const msgs = await getMessages(roomId);
            setMessages(msgs);
        } catch (error) {
            console.error("Error loading embedded chat", error);
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

    if (loading || !room) {
        return <PageLoader />;
    }

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-white dark:bg-chat-dark">
            {/* Simple Header */}
            <div
                className="h-14 flex items-center px-4 border-b border-chat-grey/20 shrink-0"
                style={{ backgroundColor: room.colors?.roomInfoColor || '#2d3748' }}
            >
                <Hash size={18} className="text-chat-light mr-2" />
                <h1 className="font-bold text-white text-sm truncate">
                    {room.name}
                </h1>
            </div>

            {/* Messages Area - flex-1 makes it take available space */}
            <div className="flex-1 min-h-0 bg-opacity-10" style={{ backgroundColor: room.colors?.chatColor }}>
                <MessageList
                    messages={messages}
                    currentUserId={currentUser?.id}
                />
            </div>

            {/* Input Area */}
            <div className="shrink-0">
                <ChatInput
                    onSendMessage={handleSendMessage}
                    roomSlug={room.slug}
                />
            </div>
        </div>
    );
};

export default EmbedChat;
