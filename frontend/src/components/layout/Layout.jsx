import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, MessageSquare, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Avatar from 'boring-avatars';

import { useSocket } from '../../context/SocketContext';
import { useEffect } from 'react';

const Layout = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { socketService } = useSocket();
    const currentUser = JSON.parse(localStorage.getItem('chat_user') || '{}');

    // Connect to socket when layout mounts (user is authenticated)
    useEffect(() => {
        const token = localStorage.getItem('chat_token');
        if (token && currentUser.id && socketService) {
            socketService.connect(token);
        }
    }, [currentUser.id, socketService]);

    const handleLogout = () => {
        if (socketService) {
            socketService.disconnect();
        }
        localStorage.removeItem('chat_user');
        localStorage.removeItem('chat_token');
        navigate('/login');
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-chat-dark text-gray-900 dark:text-chat-light antialiased font-sans">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-chat-dark border-b border-gray-200 dark:border-chat-grey/30 shadow-md z-10">
                <div className="flex items-center gap-3">
                    <Link to="/app" className="flex items-center gap-2 hover:opacity-80 transition-colors">
                        <div className="p-2 bg-gray-100 dark:bg-chat-grey/20 rounded-lg">
                            <MessageSquare size={24} className="text-gray-900 dark:text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">ChatUZO</h1>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    {/* Profile Link */}
                    <Link
                        to="/app/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-chat-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-chat-grey/20 rounded-md transition-colors"
                    >
                        <Avatar
                            size={24}
                            name={currentUser.username || 'User'}
                            variant="beam"
                            colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                        />
                        <span className="hidden sm:inline">{currentUser.username}</span>
                    </Link>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-gray-600 dark:text-chat-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-chat-grey/20 rounded-md transition-colors"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-chat-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-chat-grey/20 rounded-md transition-colors"
                    >
                        <LogOut size={18} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
