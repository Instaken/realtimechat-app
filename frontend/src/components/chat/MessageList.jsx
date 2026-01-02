import React, { useEffect, useRef } from 'react';
import { MoreVertical } from 'lucide-react';
import Message from './Message';

/**
 * Message List Component
 * Displays a scrollable list of chat messages
 * Auto-scrolls to bottom when new messages arrive
 */
const MessageList = ({ messages, currentUserId }) => {
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {messages.map((msg, idx) => {
                const isCurrentUser = msg.user_id === currentUserId;
                const isContinuous = idx > 0 && messages[idx - 1].user_id === msg.user_id;
                const showAvatar = !isContinuous;

                return (
                    <div
                        key={msg.id}
                        className={isContinuous ? "mt-1" : "mt-6"}
                    >
                        <Message
                            message={msg}
                            isCurrentUser={isCurrentUser}
                            showAvatar={showAvatar}
                        />
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
