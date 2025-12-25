import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { MoreVertical } from 'lucide-react';

const MessageList = ({ messages, currentUserId }) => {
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {messages.map((msg, idx) => {
                const isMe = msg.user_id === currentUserId;
                const isContinuous = idx > 0 && messages[idx - 1].user_id === msg.user_id;

                return (
                    <div
                        key={msg.id}
                        className={clsx(
                            "flex gap-4 group",
                            isContinuous ? "mt-1" : "mt-6"
                        )}
                    >
                        {/* Avatar (only show for first in group) */}
                        <div className="w-10 sm:w-12 flex-shrink-0">
                            {!isContinuous && (
                                <img
                                    src={msg.sender?.avatar_url || 'https://via.placeholder.com/40'}
                                    alt="avatar"
                                    className="w-10 h-10 rounded-lg bg-gray-600 object-cover hover:opacity-90 cursor-pointer shadow-sm"
                                />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Header (Time/Name) */}
                            {!isContinuous && (
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="font-bold text-white hover:underline cursor-pointer">
                                        {msg.sender?.username || 'Unknown'}
                                    </span>
                                    <span className="text-xs text-chat-light/60">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )}

                            {/* Message Bubble */}
                            <div className={clsx(
                                "relative text-[15px] leading-relaxed break-words",
                                "bg-[#565666] text-chat-light/90 px-4 py-2 rounded-r-xl rounded-bl-xl",
                                isMe && "!bg-[#606070] !text-white"
                            )}>
                                {msg.content}
                            </div>
                        </div>

                        {/* Message Actions (Hover) */}
                        <div className="w-8 flex items-start opacity-0 group-hover:opacity-100 transition-opacity pt-6">
                            <button className="p-1 hover:bg-chat-grey/30 rounded text-chat-light/50 hover:text-white">
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
