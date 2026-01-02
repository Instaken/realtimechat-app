import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, FileImage } from 'lucide-react';

const ChatInput = ({ onSendMessage, roomSlug }) => {
    const [message, setMessage] = useState('');
    const [showGifInput, setShowGifInput] = useState(false);
    const [gifUrl, setGifUrl] = useState('');
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        onSendMessage(message);
        setMessage('');
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Create a preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            const imageUrl = reader.result;
            onSendMessage(`[Image: ${file.name}]`, 'image', imageUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleGifSubmit = () => {
        if (!gifUrl.trim()) return;
        onSendMessage(`[GIF]`, 'gif', gifUrl);
        setGifUrl('');
        setShowGifInput(false);
    };

    return (
        <div className="p-4 px-6 mb-2">
            {/* GIF Input Modal */}
            {showGifInput && (
                <div className="mb-3 bg-[#565666] p-4 rounded-xl border border-chat-grey/30">
                    <div className="flex items-center gap-2 mb-2">
                        <FileImage size={20} className="text-chat-light" />
                        <h4 className="text-white font-semibold">Add GIF</h4>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={gifUrl}
                            onChange={(e) => setGifUrl(e.target.value)}
                            placeholder="Paste GIF URL (e.g., from Giphy, Tenor)"
                            className="flex-1 bg-chat-dark/50 border border-chat-grey/50 rounded-lg py-2 px-3 text-white placeholder-chat-grey focus:outline-none focus:border-chat-light"
                            autoFocus
                        />
                        <button
                            onClick={handleGifSubmit}
                            className="px-4 py-2 bg-chat-light text-chat-dark rounded-lg font-semibold hover:bg-white transition-colors"
                        >
                            Send
                        </button>
                        <button
                            onClick={() => {
                                setShowGifInput(false);
                                setGifUrl('');
                            }}
                            className="px-4 py-2 bg-chat-grey/20 text-white rounded-lg hover:bg-chat-grey/30 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                    <p className="text-xs text-chat-light/60 mt-2">
                        Tip: Right-click on a GIF and select "Copy Image Address" to get the URL
                    </p>
                </div>
            )}

            <div className="bg-white dark:bg-[#565666] p-2 rounded-xl border border-chat-grey/30 focus-within:border-chat-light/50 transition-colors shadow-lg">
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                    {/* Image Upload Button */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-chat-light/70 dark:text-chat-light/70 text-gray-600 hover:text-gray-900 dark:hover:text-white hover:bg-chat-grey/20 rounded-lg transition-colors"
                        title="Upload Image"
                    >
                        <ImageIcon size={20} />
                    </button>

                    {/* GIF Button */}
                    <button
                        type="button"
                        onClick={() => setShowGifInput(!showGifInput)}
                        className="p-2 text-chat-light/70 dark:text-chat-light/70 text-gray-600 hover:text-gray-900 dark:hover:text-white hover:bg-chat-grey/20 rounded-lg transition-colors"
                        title="Add GIF"
                    >
                        <FileImage size={20} />
                    </button>

                    <div className="flex-1 min-w-0">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={`Message #${roomSlug || 'room'}...`}
                            className="w-full bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-chat-grey/70 py-2.5 max-h-32 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-1">
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
            <div className="text-center mt-2 text-xs text-chat-grey dark:text-chat-grey light:text-gray-500">
                <strong>Return</strong> to send, <strong>Shift + Return</strong> to add a new line
            </div>
        </div>
    );
};

export default ChatInput;
