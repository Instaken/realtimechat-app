import Avatar from 'boring-avatars';
import { Users, Calendar, Info } from 'lucide-react';

const ChatSidebar = ({ room, currentUser }) => {
    const sidebarColor = room?.colors?.usersSectionColor || '#3b3b4d';
    const onlineCount = currentUser ? 1 : 0;

    return (
        <div
            className="w-64 border-l border-chat-grey/20 hidden lg:flex flex-col h-full"
            style={{ backgroundColor: sidebarColor }}
        >
            {/* Room Info Section */}
            <div className="p-6 border-b border-chat-grey/20">
                <div className="flex items-center gap-2 mb-3">
                    <Info size={18} style={{ color: room?.uiSettings?.primaryColor || '#6366f1' }} />
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Sticky Message</h3>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl mb-4 shadow-inner">
                    <p className="text-sm text-chat-light/90 leading-relaxed italic">
                        "{room?.logicConfig?.stickyMessage || room?.description || "Welcome to our room! Please be respectful to others."}"
                    </p>
                </div>

                {/* Room Details */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-chat-light/40">
                        <div className="flex items-center gap-2">
                            <Users size={12} />
                            <span>Capacity</span>
                        </div>
                        <span className="text-chat-light/80">{room?.maxUsers || 50} users</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-chat-light/40">
                        <div className="flex items-center gap-2">
                            <Calendar size={12} />
                            <span>Retention</span>
                        </div>
                        <span className="text-chat-light/80">{room?.logicConfig?.historyRetentionDays || 30} Days</span>
                    </div>
                </div>
            </div>

            {/* Online Users Section */}
            <div className="flex-1 overflow-y-auto p-4">
                <h4 className="text-xs font-bold text-chat-grey uppercase tracking-wider mb-4">
                    Online — {onlineCount}
                </h4>
                <ul className="space-y-2">
                    {currentUser && (
                        <li className="flex items-center gap-3 p-2 hover:bg-black/10 rounded-lg transition-colors cursor-pointer group">
                            <div className="relative">
                                <Avatar
                                    size={32}
                                    name={currentUser.username}
                                    variant="beam"
                                    colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                                />
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-chat-dark rounded-full"></span>
                            </div>
                            <span className="text-chat-light group-hover:text-white text-sm font-medium truncate">
                                {currentUser.username} (You)
                            </span>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ChatSidebar;
