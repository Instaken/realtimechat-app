import React, { useState } from 'react';
import { Send, Plus, Smile, Image as ImageIcon } from 'lucide-react';

const ChatInput = ({ onSendMessage, roomSlug }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        onSendMessage(message);
        setMessage('');
    };

    return (
        <div className="p-4 px-6 mb-2">
            <div className="bg-[#565666] p-2 rounded-xl border border-chat-grey/30 focus-within:border-chat-light/50 transition-colors shadow-lg">
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                    <button type="button" className="p-2 text-chat-light/70 hover:text-white hover:bg-chat-grey/20 rounded-lg transition-colors">
                        <Plus size={20} />
                    </button>

                    <div className="flex-1 min-w-0">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={`Message #${roomSlug || 'room'}...`}
                            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-chat-grey/70 py-2.5 max-h-32 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-1">
                        <button type="button" className="p-2 text-chat-light/70 hover:text-white hover:bg-chat-grey/20 rounded-lg transition-colors hidden sm:block">
                            <ImageIcon size={20} />
                        </button>
                        <button type="button" className="p-2 text-chat-light/70 hover:text-white hover:bg-chat-grey/20 rounded-lg transition-colors hidden sm:block">
                            <Smile size={20} />
                        </button>
                        <button
                            type="submit"
                            disabled={!message.trim()}
                            className="p-2 bg-chat-light/10 text-chat-light hover:bg-chat-light hover:text-chat-dark rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-1"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
            <div className="text-center mt-2 text-xs text-chat-grey">
                <strong>Return</strong> to send, <strong>Shift + Return</strong> to add a new line
            </div>
        </div>
    );
};

export default ChatInput;
