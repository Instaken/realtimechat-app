import Avatar from 'boring-avatars';
import { Users, Calendar, Info } from 'lucide-react';

const ChatSidebar = ({ room, currentUser, onlineUsers = [] }) => {
    const ownerId = room?.ownerId || room?.owner_id || room?.owner?.id;
    const isOwner = !!currentUser?.id && !!ownerId && String(ownerId) === String(currentUser.id);
    const ui = room?.uiSettings || {};
    const primaryColor = ui.primaryColor || '#6366f1';
    const sidebarColor = ui.bgType === 'color' ? ui.bgValue : '#2d3748';

    const isLightTheme = ui.theme === 'light';
    const textColorClass = isLightTheme ? 'text-slate-900' : 'text-white';
    const subTextColorClass = isLightTheme ? 'text-slate-500' : 'text-chat-light/40';

    return (
        <div
            className={`w-64 border-l hidden lg:flex flex-col h-full shadow-2xl z-10 ${isLightTheme ? 'border-slate-200 shadow-slate-200' : 'border-white/10 shadow-black'}`}
            style={{ backgroundColor: sidebarColor, filter: isLightTheme ? 'none' : 'brightness(0.9)' }}
        >
            {/* Room Info Section */}
            <div className={`p-6 border-b ${isLightTheme ? 'border-slate-200' : 'border-white/10'}`}>
                <div className="flex items-center gap-2 mb-3">
                    <Info size={18} style={{ color: primaryColor }} />
                    <h3 className={`font-bold text-sm uppercase tracking-wider ${textColorClass}`}>Sticky Message</h3>
                </div>
                <div className={`${isLightTheme ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-chat-light/90'} border p-3 rounded-xl mb-4 shadow-inner`}>
                    <p className="text-sm leading-relaxed italic">
                        "{room?.logicConfig?.stickyMessage || room?.description || "Welcome to our room! Please be respectful to others."}"
                    </p>
                </div>

                {/* Room Details */}
                <div className="space-y-3">
                    <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-widest ${subTextColorClass}`}>
                        <div className="flex items-center gap-2">
                            <Users size={12} />
                            <span>Capacity</span>
                        </div>
                        <span className={isLightTheme ? 'text-slate-600' : 'text-chat-light/80'}>{room?.maxUsers || 50} users</span>
                    </div>
                </div>

                {/* API Key for Owner */}
                {isOwner && room?.apiKey && (
                    <div className={`mt-6 pt-6 border-t ${isLightTheme ? 'border-slate-200' : 'border-white/10'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${subTextColorClass}`}>Room API Key</p>
                        <div className={`${isLightTheme ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-black/20 border-white/10 text-chat-light/70'} border rounded-lg p-2.5 flex items-center justify-between group`}>
                            <code className="text-[10px] truncate mr-2 font-mono">
                                {room.apiKey}
                            </code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(room.apiKey);
                                    alert("API Key copied to clipboard!");
                                }}
                                className={`text-[10px] font-bold uppercase transition-colors ${isLightTheme ? 'text-slate-500 hover:text-slate-900' : 'text-chat-light hover:text-white'}`}
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Online Users Section */}
            <div className="flex-1 overflow-y-auto p-4">
                <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${isLightTheme ? 'text-slate-400' : 'text-chat-light/30'}`}>
                    Online — {onlineCount}
                </h4>
                <ul className="space-y-2">
                    {/* Render online users from socket */}
                    {onlineUsers.length > 0 ? (
                        onlineUsers.map((user) => (
                            <li key={user.socketId || user.userId} className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer group border border-transparent ${isLightTheme ? 'hover:bg-slate-100 hover:border-slate-200' : 'hover:bg-white/5 hover:border-white/5'}`}>
                                <div className="relative">
                                    <Avatar
                                        size={32}
                                        name={user.username}
                                        variant="beam"
                                        colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                                    />
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 rounded-full ${isLightTheme ? 'border-white' : 'border-[#1f2937]'}`}></span>
                                </div>
                                <span className={`text-sm font-medium truncate ${isLightTheme ? 'text-slate-700 group-hover:text-slate-900' : 'text-chat-light group-hover:text-white'}`}>
                                    {user.username} {user.userId === currentUser?.id ? '(You)' : ''}
                                </span>
                            </li>
                        ))
                    ) : (
                        currentUser && (
                            <li className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer group border border-transparent ${isLightTheme ? 'hover:bg-slate-100 hover:border-slate-200' : 'hover:bg-white/5 hover:border-white/5'}`}>
                                <div className="relative">
                                    <Avatar
                                        size={32}
                                        name={currentUser.username}
                                        variant="beam"
                                        colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                                    />
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 rounded-full ${isLightTheme ? 'border-white' : 'border-[#1f2937]'}`}></span>
                                </div>
                                <span className={`text-sm font-medium truncate ${isLightTheme ? 'text-slate-700 group-hover:text-slate-900' : 'text-chat-light group-hover:text-white'}`}>
                                    {currentUser.username} (You)
                                </span>
                            </li>
                        )
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ChatSidebar;
