import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomById, getMessages, sendMessage } from '../services/mockData';
import { Phone, Video, Hash, Users } from 'lucide-react';
import ChatSidebar from '../components/chat/ChatSidebar';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';

const ChatRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentUser = JSON.parse(localStorage.getItem('chat_user') || '{}');

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            try {
                const roomData = await getRoomById(roomId);
                setRoom(roomData);

                const msgs = await getMessages(roomId);
                setMessages(msgs);
            } catch (error) {
                console.error("Error loading chat", error);
                navigate('/'); // Redirect if room not found
            } finally {
                setLoading(false);
            }
        };

        if (roomId && currentUser.id) {
            loadData();
        } else if (!currentUser.id) {
            navigate('/login');
        }
    }, [roomId, navigate]);

    const handleSendMessage = async (content) => {
        try {
            const msg = await sendMessage(roomId, currentUser.id, content);
            setMessages([...messages, msg]);
        } catch (error) {
            console.error("Failed to send", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-chat-light">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-chat-dark">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Chat Header */}
                <div className="h-16 border-b border-chat-grey/30 flex items-center justify-between px-6 bg-chat-dark/95 backdrop-blur">
                    <div className="flex items-center gap-3">
                        <Hash size={24} className="text-chat-grey" />
                        <div>
                            <h2 className="font-bold text-white leading-none">{room.name}</h2>
                            <p className="text-xs text-chat-light mt-1">{room.slug ? `#${room.slug}` : 'Private Channel'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-chat-light">
                        <button className="p-2 hover:bg-chat-grey/20 rounded-full transition-colors">
                            <Phone size={20} />
                        </button>
                        <button className="p-2 hover:bg-chat-grey/20 rounded-full transition-colors">
                            <Video size={20} />
                        </button>
                        <div className="w-px h-6 bg-chat-grey/30 mx-2"></div>
                        <button className="p-2 hover:bg-chat-grey/20 rounded-full transition-colors">
                            <Users size={20} className="md:hidden" /> {/* Show on mobile only */}
                            <span className="hidden md:inline text-sm font-medium">Details</span>
                        </button>
                    </div>
                </div>

                {/* Message List Component */}
                <MessageList messages={messages} currentUserId={currentUser.id} />

                {/* Input Component */}
                <ChatInput onSendMessage={handleSendMessage} roomSlug={room.slug} />
            </div>

            {/* Sidebar Component */}
            <ChatSidebar room={room} />
        </div>
    );
};

export default ChatRoom;
