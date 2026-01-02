import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, FileImage } from 'lucide-react';

const ChatInput = ({ onSendMessage, roomSlug, uiSettings }) => {
    const [message, setMessage] = useState('');
    const [showGifInput, setShowGifInput] = useState(false);
    const [gifUrl, setGifUrl] = useState('');
    const fileInputRef = useRef(null);

    const primaryColor = uiSettings?.primaryColor || '#6366f1';

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
                <div className="mb-3 bg-white/10 dark:bg-white/5 backdrop-blur-lg p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <FileImage size={20} style={{ color: primaryColor }} />
                        <h4 className="text-white font-semibold">Add GIF</h4>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={gifUrl}
                            onChange={(e) => setGifUrl(e.target.value)}
                            placeholder="Paste GIF URL (e.g., from Giphy, Tenor)"
                            className="flex-1 bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white placeholder-chat-grey focus:outline-none"
                            style={{ borderColor: `${primaryColor}40` }}
                            autoFocus
                        />
                        <button
                            onClick={handleGifSubmit}
                            className="px-4 py-2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Send
                        </button>
                        <button
                            onClick={() => {
                                setShowGifInput(false);
                                setGifUrl('');
                            }}
                            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/10 transition-colors shadow-lg">
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
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Upload Image"
                    >
                        <ImageIcon size={20} />
                    </button>

                    {/* GIF Button */}
                    <button
                        type="button"
                        onClick={() => setShowGifInput(!showGifInput)}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
                            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-chat-grey/70 py-2.5 max-h-32 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            type="submit"
                            disabled={!message.trim()}
                            className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ml-1"
                            style={{
                                backgroundColor: message.trim() ? `${primaryColor}20` : 'transparent',
                                color: primaryColor
                            }}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
            <div className="text-center mt-2 text-[10px] text-white/30 font-bold uppercase tracking-widest">
                <strong>Return</strong> to send • <strong>Shift + Return</strong> for new line
            </div>
        </div>
    );
};

export default ChatInput;
