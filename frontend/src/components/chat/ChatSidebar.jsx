import React from 'react';
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
                    <Info size={18} className="text-chat-light" />
                    <h3 className="font-bold text-white">About Channel</h3>
                </div>
                <p className="text-sm text-chat-light/90 mb-4">
                    {room?.description || "A place to discuss everything related to this topic."}
                </p>

                {/* Room Details */}
                <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-chat-light/80">
                        <Users size={14} />
                        <span>Max Users: {room?.max_users || 50}</span>
                    </div>
                    <div className="flex items-center gap-2 text-chat-light/80">
                        <Calendar size={14} />
                        <span>Age Limit: {room?.age_limit || 13}+</span>
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
