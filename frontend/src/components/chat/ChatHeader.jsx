import React from 'react';
import { Hash, Users, X } from 'lucide-react';

const ChatHeader = ({ room, uiSettings, showSidebar, onToggleSidebar, isLightTheme }) => (
    <div
        className={`h-16 border-b border-chat-grey/30 flex items-center justify-between px-6 backdrop-blur ${isLightTheme ? 'bg-white/80' : 'bg-white/10 dark:bg-chat-dark/30'}`}
        style={{ borderBottomColor: uiSettings?.primaryColor }}
    >
        <div className="flex items-center gap-3">
            <Hash size={24} style={{ color: uiSettings?.primaryColor || '#6366f1' }} />
            <div>
                <h2 className={`font-bold leading-none ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>
                    {room.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] ${isLightTheme ? 'bg-slate-200 text-slate-600' : 'bg-chat-grey/20 text-chat-light'} px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter`}>
                        #{room.slug}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                    <span className={`text-[10px] font-medium ${isLightTheme ? 'text-slate-400' : 'text-chat-light/50'}`}>LIVE</span>
                </div>
            </div>
        </div>

        <div className={`flex items-center gap-2 ${isLightTheme ? 'text-slate-600' : 'text-chat-light'}`}>
            <button
                onClick={onToggleSidebar}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors group ${isLightTheme ? 'hover:bg-slate-100' : 'hover:bg-chat-grey/20'}`}
            >
                {showSidebar ? <X size={20} /> : <Users size={20} className="group-hover:scale-110 transition-transform" />}
                <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">
                    {showSidebar ? 'Hide Details' : 'Details'}
                </span>
            </button>
        </div>
    </div>
);

export default ChatHeader;
