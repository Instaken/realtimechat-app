import { MoreVertical } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';
import { useTheme } from '../../context/ThemeContext';

/**
 * Single Message Component
 * Displays a chat message with avatar, username, timestamp and content
 */
const Message = ({ message, isCurrentUser, showAvatar, uiSettings }) => {
    const { theme } = useTheme();
    const bubbleStyle = uiSettings?.bubbleStyle || 'rounded';
    const primaryColor = uiSettings?.primaryColor || '#6366f1';
    
    // Username için daha belirgin bir renk - koyu cyan/teal
    const usernameColor = '#0891b2'; // cyan-600 - hem light hem dark'ta okunaklı

    const isMedia = message.type === 'image' || message.type === 'gif';

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

    // Determine bubble classes based on style
    const getBubbleRadius = () => {
        if (bubbleStyle === 'sharp') return 'rounded-none';
        if (bubbleStyle === 'modern') return isCurrentUser ? 'rounded-2xl rounded-tr-none' : 'rounded-2xl rounded-tl-none';
        // default 'rounded'
        return 'rounded-[1.25rem]';
    };

    const weightMap = {
        'light': 300,
        'regular': 400,
        'medium': 500,
        'bold': 700
    };
    const fontFamily = uiSettings?.fontSettings?.family ? `'${uiSettings.fontSettings.family}', sans-serif` : 'inherit';
    const fontWeight = weightMap[uiSettings?.fontSettings?.weight] || 500;

    const isLightTheme = theme === 'light';
    // Username her zaman primaryColor ile göster - daha okunaklı ve belirgin
    const usernameColorClass = 'font-semibold';
    const bubbleBgClass = isLightTheme ? 'bg-white border-gray-200' : 'bg-[#2a3942] border-gray-600';
    const bubbleTextColorClass = isLightTheme ? 'text-slate-900' : 'text-white';

    return (
        <div className={`flex gap-4 group ${isCurrentUser ? 'flex-row-reverse text-right' : ''}`}>
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
            <div className={`flex-1 min-w-0 max-w-[80%] ${isCurrentUser ? 'flex flex-col items-end' : ''}`}>
                {/* Header */}
                {/* Header - Always show username/time as requested */}
                <div className={`flex items-baseline gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                    <span 
                        className={`font-bold hover:underline cursor-pointer text-sm ${usernameColorClass}`} 
                        style={{ fontFamily, color: usernameColor }}
                    >
                        {message.sender?.username || 'Unknown'}
                    </span>
                    <span className="text-[10px] text-chat-light/50">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>

                {/* Message Bubble */}
                <div
                    className={`
                        relative leading-relaxed break-words shadow-sm border
                        ${isMedia ? 'bg-transparent p-0 border-none' : 'px-4 py-2.5'}
                        ${getBubbleRadius()}
                        ${isCurrentUser && !isMedia ? 'text-white border-none' : `${bubbleBgClass} ${bubbleTextColorClass}`}
                    `}
                    style={{
                        backgroundColor: (isCurrentUser && !isMedia) ? primaryColor : undefined,
                        fontFamily: fontFamily,
                        fontWeight: fontWeight
                    }}
                >
                    {renderContent()}
                </div>
            </div>

            {/* Message Actions */}
            {!isMedia && (
                <div className={`w-8 flex items-start opacity-0 group-hover:opacity-100 transition-opacity ${showAvatar ? 'pt-6' : 'pt-1'} ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                    <button className="p-1 hover:bg-white/10 rounded transition-colors text-chat-light/50">
                        <MoreVertical size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Message;
