import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, FileImage } from 'lucide-react';

const ChatInput = ({ onSendMessage, onTyping, roomSlug, uiSettings }) => {
    const [message, setMessage] = useState('');
    const [showGifInput, setShowGifInput] = useState(false);
    const [gifUrl, setGifUrl] = useState('');
    const fileInputRef = useRef(null);

    const primaryColor = uiSettings?.primaryColor || '#6366f1';

    const font = uiSettings?.fontSettings || { family: 'Inter' };
    const fontFamily = font.family ? `'${font.family}', sans-serif` : 'inherit';

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
        if (onTyping) onTyping();
    };

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

    const isLightTheme = uiSettings?.theme === 'light';
    const textColorClass = isLightTheme ? 'text-slate-900' : 'text-white';
    const subTextColorClass = isLightTheme ? 'text-slate-400' : 'text-white/30';

    return (
        <div className="p-4 px-6 mb-2">
            {/* GIF Input Modal */}
            {showGifInput && (
                <div className={`mb-3 backdrop-blur-lg p-4 rounded-xl border ${isLightTheme ? 'bg-white/90 border-slate-200 shadow-xl' : 'bg-white/10 dark:bg-white/5 border-white/10'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <FileImage size={20} style={{ color: primaryColor }} />
                        <h4 className={`font-semibold ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>Add GIF</h4>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={gifUrl}
                            onChange={(e) => setGifUrl(e.target.value)}
                            placeholder="Paste GIF URL (e.g., from Giphy, Tenor)"
                            className={`flex-1 border rounded-xl py-2 px-3 placeholder-chat-grey focus:outline-none ${isLightTheme ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-black/20 border-white/10 text-white'}`}
                            style={{ borderColor: `${primaryColor}40`, fontFamily }}
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
                            className={`px-4 py-2 rounded-lg transition-colors ${isLightTheme ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className={`backdrop-blur-md p-2 rounded-xl border transition-colors shadow-lg ${isLightTheme ? 'bg-white/90 border-slate-200' : 'bg-white/10 dark:bg-white/5 border-white/10'}`}>
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
                        className={`p-2 rounded-lg transition-colors ${isLightTheme ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-100' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
                        title="Upload Image"
                    >
                        <ImageIcon size={20} />
                    </button>

                    {/* GIF Button */}
                    <button
                        type="button"
                        onClick={() => setShowGifInput(!showGifInput)}
                        className={`p-2 rounded-lg transition-colors ${isLightTheme ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-100' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
                        title="Add GIF"
                    >
                        <FileImage size={20} />
                    </button>

                    <div className="flex-1 min-w-0">
                        <input
                            type="text"
                            value={message}
                            onChange={handleMessageChange}
                            placeholder={`Message #${roomSlug || 'room'}...`}
                            className={`w-full bg-transparent border-none focus:ring-0 py-2.5 max-h-32 focus:outline-none ${textColorClass} placeholder-chat-grey/70`}
                            style={{ fontFamily }}
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
            <div className={`text-center mt-2 text-[10px] font-bold uppercase tracking-widest ${subTextColorClass}`}>
                <strong>Return</strong> to send • <strong>Shift + Return</strong> for new line
            </div>
        </div>
    );
};

export default ChatInput;
