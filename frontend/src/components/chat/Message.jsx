import React from 'react';
import { MoreVertical } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';

/**
 * Single Message Component
 * Displays a chat message with avatar, username, timestamp and content
 */
const Message = ({ message, isCurrentUser, showAvatar }) => {
    const renderContent = () => {
        // Image message
        if (message.type === 'image' && message.attachment_url) {
            return (
                <div className="max-w-md">
                    <img
                        src={message.attachment_url}
                        alt="Uploaded"
                        className="rounded-lg max-h-96 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(message.attachment_url, '_blank')}
                    />
                    {message.content && message.content !== '[Image]' && (
                        <p className="mt-2 text-sm">{message.content}</p>
                    )}
                </div>
            );
        }

        // GIF message
        if (message.type === 'gif' && message.attachment_url) {
            return (
                <div className="max-w-md">
                    <img
                        src={message.attachment_url}
                        alt="GIF"
                        className="rounded-lg max-h-96 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(message.attachment_url, '_blank')}
                    />
                </div>
            );
        }

        // Text message
        return message.content;
    };

    const isMedia = message.type === 'image' || message.type === 'gif';

    return (
        <div className="flex gap-4 group">
            {/* Avatar */}
            <div className="w-10 sm:w-12 flex-shrink-0">
                {showAvatar && (
                    <UserAvatar
                        username={message.sender?.username}
                        size={40}
                    />
                )}
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
                {/* Header */}
                {showAvatar && (
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-bold text-white hover:underline cursor-pointer">
                            {message.sender?.username || 'Unknown'}
                        </span>
                        <span className="text-xs text-chat-light/60">
                            {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                )}

                {/* Message Bubble */}
                <div className={`
                    relative text-[15px] leading-relaxed break-words
                    ${isMedia
                        ? 'bg-transparent p-0'
                        : 'bg-[#565666] dark:bg-[#565666] bg-gray-200 text-chat-light/90 dark:text-chat-light/90 text-gray-800 px-4 py-2 rounded-r-xl rounded-bl-xl'
                    }
                    ${isCurrentUser && !isMedia
                        ? '!bg-[#606070] dark:!bg-[#606070] !bg-blue-500 !text-white'
                        : ''
                    }
                `}>
                    {renderContent()}
                </div>
            </div>

            {/* Message Actions */}
            <div className="w-8 flex items-start opacity-0 group-hover:opacity-100 transition-opacity pt-6">
                <button className="p-1 hover:bg-chat-grey/30 rounded text-chat-light/50 hover:text-white">
                    <MoreVertical size={16} />
                </button>
            </div>
        </div>
    );
};

export default Message;
