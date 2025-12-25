import React from 'react';

const ChatSidebar = ({ room, onlineCount = 12 }) => {
    return (
        <div className="w-64 bg-[#3b3b4d] border-l border-chat-grey/20 hidden lg:flex flex-col h-full">
            <div className="p-6 border-b border-chat-grey/20">
                <h3 className="font-bold text-white mb-1">About Channel</h3>
                <p className="text-sm text-chat-light/80">
                    {room?.description || "A place to discuss everything related to this topic."}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <h4 className="text-xs font-bold text-chat-grey uppercase tracking-wider mb-4">
                    Online — {onlineCount}
                </h4>
                <ul className="space-y-1">
                    {/* Mock Sidebar Users */}
                    {[1, 2, 3, 4, 5].map((u) => (
                        <li key={u} className="flex items-center gap-3 p-2 hover:bg-chat-grey/10 rounded-lg transition-colors cursor-pointer group">
                            <div className="relative">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${u}`}
                                    className="w-8 h-8 rounded-lg bg-gray-700"
                                    alt=""
                                />
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-chat-dark rounded-full"></span>
                            </div>
                            <span className="text-chat-light group-hover:text-white text-sm font-medium truncate">
                                User_{u * 123}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ChatSidebar;
