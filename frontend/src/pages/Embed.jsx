import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { roomService } from '../services/api';
import { socketService } from '../services/socket';
import ChatSidebar from '../components/chat/ChatSidebar';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import ChatHeader from '../components/chat/ChatHeader';
import { PageLoader } from '../components/common/Loading';

/**
 * Embed Page
 * Chat room embedded via iframe for external websites
 * Uses API key instead of slug
 */
const Embed = () => {
    const { apiKey } = useParams();

    const [currentUser, setCurrentUser] = useState(null);
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSidebar, setShowSidebar] = useState(false); // Hidden by default in embed
    const [participants, setParticipants] = useState([]);
    const [error, setError] = useState(null);
    const [authStep, setAuthStep] = useState('auth'); // 'auth' or 'chat'
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState(null);
    
    // Chat states
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);

    // Check for existing user
    useEffect(() => {
        const existingUser = localStorage.getItem('chat_guest_user') || localStorage.getItem('chat_user');
        if (existingUser) {
            try {
                const user = JSON.parse(existingUser);
                setCurrentUser(user);
                setAuthStep('chat');
            } catch (e) {
                console.error('Failed to parse user data');
            }
        }
    }, []);

    // Handle Guest Login
    const handleGuestLogin = () => {
        const guestUser = {
            id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            username: `Guest${Math.floor(Math.random() * 10000)}`,
            email: null,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest${Date.now()}`,
            isGuest: true
        };
        localStorage.setItem('chat_guest_user', JSON.stringify(guestUser));
        setCurrentUser(guestUser);
        setAuthStep('chat');
    };

    // Handle Login
    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError(null);

        const formData = new FormData(e.target);
        const identifier = formData.get('identifier');
        const password = formData.get('password');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            localStorage.setItem('chat_token', data.accessToken);
            localStorage.setItem('chat_user', JSON.stringify(data.user));
            setCurrentUser(data.user);
            setAuthStep('chat');
        } catch (error) {
            setAuthError(error.message);
        } finally {
            setAuthLoading(false);
        }
    };

    // Handle Register
    const handleRegister = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError(null);

        const formData = new FormData(e.target);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    birthdate: new Date().toISOString(),
                    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Auto login after register
            setAuthMode('login');
            setAuthError('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        } catch (error) {
            setAuthError(error.message);
        } finally {
            setAuthLoading(false);
        }
    };

    // Load Room Data by API Key
    useEffect(() => {
        if (!currentUser || !apiKey || authStep !== 'chat') return;

        const loadRoomData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch room and participants in parallel for better performance
                const [roomData, participantsData] = await Promise.all([
                    roomService.getRoomByApiKey(apiKey),
                    roomService.getRoomByApiKey(apiKey).then(room => 
                        roomService.getRoomParticipants(room.id).catch(() => ({ participants: [] }))
                    )
                ]);
                
                if (!roomData) {
                    setError('Room not found or invalid API key');
                    return;
                }

                setRoom(roomData);
                setParticipants(participantsData.participants || []);

                // Check if guest access is allowed
                if (currentUser.isGuest && !roomData.logicConfig?.guestAccess) {
                    setError('Guest access is not allowed in this room');
                    return;
                }
            } catch (error) {
                console.error("Error loading chat", error);
                setError(error.response?.data?.message || 'Failed to load chat room');
            } finally {
                setLoading(false);
            }
        };

        loadRoomData();
    }, [apiKey, currentUser, authStep]);

    // Socket Connection and Event Handlers
    useEffect(() => {
        if (!room || !currentUser || authStep !== 'chat') return;

        // Connect socket immediately
        const token = localStorage.getItem('chat_token');
        socketService.connect(token);

        // Setup event listeners first
        socketService.onReceiveMessage((message) => {
            console.log('📩 New message:', message);
            setMessages(prev => [...prev, message]);
        });

        socketService.onUserTyping(({ username }) => {
            setTypingUsers(prev => 
                prev.includes(username) ? prev : [...prev, username]
            );
        });

        socketService.onUserStoppedTyping(({ username }) => {
            setTypingUsers(prev => prev.filter(u => u !== username));
        });

        socketService.onOnlineUsers((users) => {
            console.log('👥 Online users updated:', users);
            const userList = Array.isArray(users) ? users : [];
            setOnlineUsers(userList);
        });

        socketService.onUserJoined(({ username }) => {
            console.log('👋 User joined:', username);
        });

        socketService.onUserLeft(({ username }) => {
            console.log('👋 User left:', username);
        });

        // Join room with faster retry
        const joinRoom = () => {
            if (!socketService.socket?.connected) {
                // Retry faster - every 50ms instead of 100ms
                setTimeout(joinRoom, 50);
                return;
            }

            socketService.joinRoom(room.id)
                .then((response) => {
                    console.log('✅ Joined room:', response);
                    if (response?.messages) {
                        setMessages(response.messages);
                    }
                    if (response?.onlineUsers) {
                        const users = Array.isArray(response.onlineUsers) 
                            ? response.onlineUsers 
                            : [];
                        setOnlineUsers(users);
                    }
                })
                .catch((error) => {
                    console.error('❌ Failed to join room:', error);
                });
        };

        joinRoom();

        return () => {
            console.log('🔌 Cleaning up socket listeners');
            if (room?.id) {
                socketService.leaveRoom(room.id);
            }
            socketService.off('receive_message');
            socketService.off('new_message');
            socketService.off('user_typing');
            socketService.off('user_stopped_typing');
            socketService.off('online_users');
            socketService.off('user_joined');
            socketService.off('user_left');
        };
    }, [room, currentUser, authStep]);

    // Send Message Handler
    const sendMessage = async (content) => {
        if (!room || !currentUser) return;

        try {
            await socketService.sendMessage(room.id, content);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    // Typing Handler
    const handleTyping = (isTyping) => {
        if (!room) return;
        
        if (isTyping) {
            socketService.startTyping(room.id);
        } else {
            socketService.stopTyping(room.id);
        }
    };

    // Notify parent window about events
    useEffect(() => {
        if (window.parent !== window) {
            // Notify parent that widget is loaded
            window.parent.postMessage({ 
                type: 'WIDGET_LOADED',
                roomId: room?.id,
                roomName: room?.name 
            }, '*');
        }
    }, [room]);

    // Notify parent about new messages
    useEffect(() => {
        if (window.parent !== window && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            // Only notify if message is from someone else
            if (lastMessage.userId !== currentUser?.id) {
                window.parent.postMessage({
                    type: 'NEW_MESSAGE',
                    message: {
                        id: lastMessage.id,
                        text: lastMessage.content,
                        username: lastMessage.username,
                        timestamp: lastMessage.createdAt
                    }
                }, '*');
            }
        }
    }, [messages, currentUser]);

    // Notify parent about height changes for responsive iframe
    useEffect(() => {
        if (window.parent !== window) {
            const sendHeight = () => {
                const height = document.documentElement.scrollHeight;
                window.parent.postMessage({
                    type: 'RESIZE',
                    height: height
                }, '*');
            };

            // Send initial height
            sendHeight();

            // Observe for DOM changes
            const observer = new ResizeObserver(sendHeight);
            observer.observe(document.body);

            return () => observer.disconnect();
        }
    }, [messages, showSidebar]);

    // Listen for messages from parent
    useEffect(() => {
        const handleMessage = (event) => {
            const { type } = event.data;
            
            switch (type) {
                case 'WIDGET_OPENED':
                    console.log('Widget opened by parent');
                    break;
                case 'CLOSE_WIDGET':
                    // If parent wants to close the widget
                    if (window.parent !== window) {
                        window.parent.postMessage({ type: 'WIDGET_CLOSED' }, '*');
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Show auth screen if user is not authenticated
    if (authStep === 'auth') {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-600 to-purple-700">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">ChatUZO</h1>
                        <p className="text-gray-600">Sohbete katılmak için giriş yapın</p>
                    </div>

                    {authError && (
                        <div className={`mb-4 p-3 rounded-lg ${authError.includes('başarılı') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {authError}
                        </div>
                    )}

                    {authMode === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kullanıcı Adı veya Email
                                </label>
                                <input
                                    type="text"
                                    name="identifier"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="kullaniciadi veya email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Şifre
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={authLoading}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {authLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kullanıcı Adı
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="kullaniciadi"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Şifre
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={authLoading}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {authLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setAuthMode(authMode === 'login' ? 'register' : 'login');
                                setAuthError(null);
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            {authMode === 'login' ? 'Hesabınız yok mu? Kayıt olun' : 'Zaten hesabınız var mı? Giriş yapın'}
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <button
                            onClick={handleGuestLogin}
                            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Misafir Olarak Devam Et
                        </button>
                        <p className="text-xs text-gray-500 text-center mt-2">
                            Kayıt olmadan sohbete katılın
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return <PageLoader />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-chat-dark text-white p-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p className="text-chat-light">{error}</p>
                </div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="flex items-center justify-center h-screen bg-chat-dark text-white">
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

    return (
        <div
            className="flex h-screen bg-gray-50 dark:bg-chat-dark overflow-hidden"
            style={{
                fontFamily: `'${fontSettings.family}', sans-serif`,
                fontSize: `${fontSettings.baseSize}px`
            }}
        >
            <div
                className="flex-1 flex flex-col"
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
                    {typingUsers.length > 0 && (room?.logicConfig?.showTyping !== false) && (
                        <div className={`flex items-center gap-2 text-sm italic ${isLightTheme ? 'text-slate-500' : 'text-chat-light/50'}`}>
                            <div className="flex gap-1">
                                <span className={`w-1 h-1 ${isLightTheme ? 'bg-slate-400' : 'bg-chat-light'} rounded-full animate-bounce`}></span>
                                <span className={`w-1 h-1 ${isLightTheme ? 'bg-slate-400' : 'bg-chat-light'} rounded-full animate-bounce [animation-delay:0.2s]`}></span>
                                <span className={`w-1 h-1 ${isLightTheme ? 'bg-slate-400' : 'bg-chat-light'} rounded-full animate-bounce [animation-delay:0.4s]`}></span>
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
                    currentUser={currentUser}
                    participants={participants}
                />
            </div>

            {/* Sidebar - Mobile overlay */}
            {showSidebar && (
                <>
                    <div 
                        className="md:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={() => setShowSidebar(false)}
                    />
                    
                    <div className="md:relative fixed md:static inset-0 md:inset-auto h-full w-full md:w-auto z-50 md:z-auto">
                        <ChatSidebar
                            room={room}
                            currentUser={currentUser}
                            onlineUsers={onlineUsers}
                            participants={participants}
                            onClose={() => setShowSidebar(false)}
                        />
                    </div>
                </>
            )}

            {/* Branding (if enabled) */}
            {uiSettings.showBranding !== false && (
                <div className="absolute bottom-2 left-2 text-[10px] text-chat-light/30 hover:text-chat-light/50 transition-colors">
                    Powered by <a href="https://chatuzo.com" target="_blank" rel="noopener noreferrer" className="font-bold">ChatUZO</a>
                </div>
            )}
        </div>
    );
};

export default Embed;
