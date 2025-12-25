import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, MessageSquare } from 'lucide-react';

const Layout = () => {
    const navigate = useNavigate();
    // Mock logout - in real app cleans state
    const handleLogout = () => {
        localStorage.removeItem('chat_user');
        navigate('/login');
    };

    return (
        <div className="flex flex-col h-screen bg-chat-dark text-chat-light antialiased font-sans">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between px-6 py-3 bg-chat-dark border-b border-chat-grey/30 shadow-md z-10">
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="p-2 bg-chat-grey/20 rounded-lg">
                            <MessageSquare size={24} className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white">DevChat</h1>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-chat-light hover:text-white hover:bg-chat-grey/20 rounded-md transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
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
