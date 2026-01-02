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
    const { roomId } = useParams(); // Could be ID or Slug
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
            try {
                roomData = await roomService.getRoomBySlug(roomId);
            } catch {
                roomData = await roomService.getRoomById(roomId);
            }
            setRoom(roomData);
            setMessages([]); // Real history logic can be added later
        } catch (error) {
            console.error("Error loading embedded chat", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (content, type = 'text', attachmentUrl = null) => {
        // Embed relies on guest socket or existing session
        const messageData = {
            room: roomId,
            user: currentUser.id,
            content: content,
            type: type,
            attachment_url: attachmentUrl,
            sender: currentUser,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, messageData]);
        // socketService call would go here if socket is initialized for embed
    };

    if (loading || !room) {
        return <PageLoader />;
    }

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-white dark:bg-chat-dark">
            <div
                className="h-14 flex items-center px-4 border-b border-chat-grey/20 shrink-0"
                style={{ backgroundColor: room.colors?.roomInfoColor || '#2d3748' }}
            >
                <Hash size={18} className="text-chat-light mr-2" />
                <h1 className="font-bold text-white text-sm truncate">
                    {room.name}
                </h1>
            </div>

            <div className="flex-1 min-h-0 bg-opacity-10" style={{ backgroundColor: room.colors?.chatColor }}>
                <MessageList
                    messages={messages}
                    currentUserId={currentUser?.id}
                />
            </div>

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
