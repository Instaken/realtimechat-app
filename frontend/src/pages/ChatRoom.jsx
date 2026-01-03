import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomService } from '../services/api';
import ChatSidebar from '../components/chat/ChatSidebar';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import ChatHeader from '../components/chat/ChatHeader';
import { PageLoader } from '../components/common/Loading';
import { useChatSocket } from '../hooks/useChatSocket';

/**
 * Chat Room Page
 * Main chat interface with messages, input, and sidebar
 */
const ChatRoom = () => {
    const { roomId } = useParams(); // This is the ID or Slug
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSidebar, setShowSidebar] = useState(true);

    // Initial Load User
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('chat_user') || '{}');
        const token = localStorage.getItem('chat_token');

        if (!user.id || !token) {
            navigate('/auth');
            return;
        }
        setCurrentUser(user);
    }, [navigate]);

    // Load Room Data
    useEffect(() => {
        if (!currentUser) return;

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

                // Fetch history from DB
                try {
                    const msgs = await roomService.getRoomMessages(roomId);
                    // We need to set initial messages in the hook or simple state? 
                    // The hook manages 'messages' state. We can expose setMessages from hook.
                    // WAITING for hook initialization below.
                    setInitialMessages(msgs);
                } catch (err) {
                    console.error("Failed to load messages", err);
                }
            } catch (error) {
                console.error("Error loading chat", error);
            } finally {
                setLoading(false);
            }
        };

        loadRoomData();
    }, [roomId, currentUser]);

    // We store initial messages here to pass to hook or update hook state
    const [initialMessages, setInitialMessages] = useState([]);

    // Custom Hook for Socket Logic
    const {
        messages,
        setMessages,
        onlineUsers,
        typingUsers,
        sendMessage,
        handleTyping
    } = useChatSocket(roomId, room);

    // Sync initial DB messages with Hook state when loaded
    useEffect(() => {
        if (initialMessages.length > 0) {
            setMessages(prev => {
                // Avoid overwriting if socket already added real-time messages
                if (prev.length > 0) return prev;
                return initialMessages;
            });
        }
    }, [initialMessages, setMessages]);


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
    const isLightTheme = uiSettings.theme === 'light';
    const subTextColorClass = isLightTheme ? 'text-slate-600' : 'text-chat-light';

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
                    isLightTheme={isLightTheme}
                />

                <MessageList
                    messages={messages}
                    currentUserId={currentUser.id}
                    uiSettings={uiSettings}
                />

                {/* Typing Indicator */}
                <div className="px-6 h-6">
                    {typingUsers.length > 0 && (
                        <div className={`flex items-center gap-2 text-[10px] ${subTextColorClass} animate-pulse font-bold uppercase tracking-widest`}>
                            <div className="flex gap-1">
                                <span className={`w-1 h-1 ${isLightTheme ? 'bg-slate-400' : 'bg-chat-light'} rounded-full`}></span>
                                <span className={`w-1 h-1 ${isLightTheme ? 'bg-slate-400' : 'bg-chat-light'} rounded-full`}></span>
                                <span className={`w-1 h-1 ${isLightTheme ? 'bg-slate-400' : 'bg-chat-light'} rounded-full`}></span>
                            </div>
                            <span>
                                {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
                            </span>
                        </div>
                    )}
                </div>

                <ChatInput
                    onSendMessage={sendMessage}
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

export default ChatRoom;
