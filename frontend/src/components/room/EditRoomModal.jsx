import { useState, useEffect } from 'react';
import { X, Save, Lock, Users, Globe, Palette, Settings as SettingsIcon } from 'lucide-react';
import { roomService } from '../../services/api';

const EditRoomModal = ({ room, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: '',
        isPrivate: false,
        password: '',
        allowedDomains: [],
        uiSettings: {
            theme: 'dark',
            primaryColor: '#6366f1',
            bgType: 'color',
            bgValue: '#1f2937',
            bubbleStyle: 'rounded',
            fontSettings: {
                family: 'Inter',
                baseSize: 14,
                weight: 'medium'
            },
            headerTitle: '',
            showBranding: true
        },
        logicConfig: {
            slowMode: 0,
            allowGifs: true,
            profanityFilter: false,
            guestAccess: true,
            showTypingIndicator: true,
            readReceipts: true,
            stickyMessage: '',
            historyRetentionDays: 30
        }
    });

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general'); // general, ui, logic
    const [newDomain, setNewDomain] = useState('');

    useEffect(() => {
        if (room) {
            // Parse UI settings if string
            let uiSettings = room.uiSettings || {};
            if (typeof uiSettings === 'string') {
                try {
                    uiSettings = JSON.parse(uiSettings);
                } catch (e) {
                    console.error('Failed to parse uiSettings', e);
                }
            }

            // Parse logic config if string
            let logicConfig = room.logicConfig || {};
            if (typeof logicConfig === 'string') {
                try {
                    logicConfig = JSON.parse(logicConfig);
                } catch (e) {
                    console.error('Failed to parse logicConfig', e);
                }
            }

            setFormData({
                name: room.name || '',
                isPrivate: room.isPrivate || false,
                password: '', // Don't show existing password
                allowedDomains: room.allowedDomains || [],
                uiSettings: {
                    theme: uiSettings.theme || 'dark',
                    primaryColor: uiSettings.primaryColor || '#6366f1',
                    bgType: uiSettings.bgType || 'color',
                    bgValue: uiSettings.bgValue || '#1f2937',
                    bubbleStyle: uiSettings.bubbleStyle || 'rounded',
                    fontSettings: {
                        family: uiSettings.fontSettings?.family || 'Inter',
                        baseSize: uiSettings.fontSettings?.baseSize || 14,
                        weight: uiSettings.fontSettings?.weight || 'medium'
                    },
                    headerTitle: uiSettings.headerTitle || '',
                    showBranding: uiSettings.showBranding !== false
                },
                logicConfig: {
                    slowMode: logicConfig.slowMode || 0,
                    allowGifs: logicConfig.allowGifs !== false,
                    profanityFilter: logicConfig.profanityFilter || false,
                    guestAccess: logicConfig.guestAccess !== false,
                    showTypingIndicator: (logicConfig.showTyping !== false && logicConfig.showTypingIndicator !== false),
                    readReceipts: logicConfig.readReceipts !== false,
                    stickyMessage: logicConfig.stickyMessage || '',
                    historyRetentionDays: logicConfig.historyRetentionDays || 30
                }
            });
        }
    }, [room]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare update payload
            const updatePayload = {
                name: formData.name,
                isPrivate: formData.isPrivate,
                uiSettings: formData.uiSettings,
                logicConfig: {
                    slowMode: formData.logicConfig.slowMode,
                    allowGifs: formData.logicConfig.allowGifs,
                    profanityFilter: formData.logicConfig.profanityFilter,
                    guestAccess: formData.logicConfig.guestAccess,
                    showTyping: formData.logicConfig.showTypingIndicator, // Backend expects showTyping
                    readReceipts: formData.logicConfig.readReceipts,
                    stickyMessage: formData.logicConfig.stickyMessage,
                    historyRetentionDays: formData.logicConfig.historyRetentionDays
                }
            };

            // Only include allowedDomains if not empty (backend requires at least 1 item)
            if (formData.allowedDomains && formData.allowedDomains.length > 0) {
                updatePayload.allowedDomains = formData.allowedDomains;
            }

            // Only include password if it's been changed
            if (formData.password) {
                updatePayload.password = formData.password;
            }

            const response = await roomService.updateRoom(room.id, updatePayload);
            
            alert('Oda başarıyla güncellendi!');
            if (onUpdate) {
                onUpdate(response.room);
            }
            onClose();
            window.location.reload(); // Refresh to see changes
        } catch (error) {
            console.error('Update room error:', error);
            alert(error.response?.data?.message || 'Oda güncellenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const addDomain = () => {
        if (newDomain && !formData.allowedDomains.includes(newDomain)) {
            setFormData({
                ...formData,
                allowedDomains: [...formData.allowedDomains, newDomain]
            });
            setNewDomain('');
        }
    };

    const removeDomain = (domain) => {
        setFormData({
            ...formData,
            allowedDomains: formData.allowedDomains.filter(d => d !== domain)
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-chat-dark rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <SettingsIcon size={24} />
                        Edit Room Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-chat-light hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-6 py-3 font-medium transition-colors ${
                            activeTab === 'general'
                                ? 'text-white border-b-2 border-indigo-500'
                                : 'text-chat-light hover:text-white'
                        }`}
                    >
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('ui')}
                        className={`px-6 py-3 font-medium transition-colors ${
                            activeTab === 'ui'
                                ? 'text-white border-b-2 border-indigo-500'
                                : 'text-chat-light hover:text-white'
                        }`}
                    >
                        UI Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('logic')}
                        className={`px-6 py-3 font-medium transition-colors ${
                            activeTab === 'logic'
                                ? 'text-white border-b-2 border-indigo-500'
                                : 'text-chat-light hover:text-white'
                        }`}
                    >
                        Logic & Rules
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    {/* General Tab */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            {/* Room Name */}
                            <div>
                                <label className="block text-sm font-medium text-chat-light mb-2">
                                    Room Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    required
                                />
                            </div>

                            {/* Privacy */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isPrivate"
                                    checked={formData.isPrivate}
                                    onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="isPrivate" className="text-sm font-medium text-chat-light flex items-center gap-2">
                                    <Lock size={16} />
                                    Private Room (requires password)
                                </label>
                            </div>

                            {/* Password */}
                            {formData.isPrivate && (
                                <div>
                                    <label className="block text-sm font-medium text-chat-light mb-2">
                                        Password (leave empty to keep current)
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                        placeholder="Enter new password"
                                    />
                                </div>
                            )}

                            {/* Allowed Domains */}
                            <div>
                                <label className="block text-sm font-medium text-chat-light mb-2 flex items-center gap-2">
                                    <Globe size={16} />
                                    Allowed Domains (CORS)
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="url"
                                        value={newDomain}
                                        onChange={(e) => setNewDomain(e.target.value)}
                                        placeholder="https://example.com"
                                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={addDomain}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.allowedDomains.map((domain, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg text-sm text-chat-light"
                                        >
                                            <span>{domain}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeDomain(domain)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* UI Settings Tab */}
                    {activeTab === 'ui' && (
                        <div className="space-y-6">
                            {/* Theme */}
                            <div>
                                <label className="block text-sm font-medium text-chat-light mb-2">Theme</label>
                                <select
                                    value={formData.uiSettings.theme}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        uiSettings: { ...formData.uiSettings, theme: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="dark" className="text-gray-900 bg-white">Dark</option>
                                    <option value="light" className="text-gray-900 bg-white">Light</option>
                                </select>
                            </div>

                            {/* Primary Color */}
                            <div>
                                <label className="block text-sm font-medium text-chat-light mb-2 flex items-center gap-2">
                                    <Palette size={16} />
                                    Primary Color
                                </label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={formData.uiSettings.primaryColor}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            uiSettings: { ...formData.uiSettings, primaryColor: e.target.value }
                                        })}
                                        className="w-16 h-10 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.uiSettings.primaryColor}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            uiSettings: { ...formData.uiSettings, primaryColor: e.target.value }
                                        })}
                                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Background Type */}
                            <div>
                                <label className="block text-sm font-medium text-chat-light mb-2">Background Type</label>
                                <select
                                    value={formData.uiSettings.bgType}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        uiSettings: { ...formData.uiSettings, bgType: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="color" className="text-gray-900 bg-white">Solid Color</option>
                                    <option value="gradient" className="text-gray-900 bg-white">Gradient</option>
                                    <option value="image" className="text-gray-900 bg-white">Image URL</option>
                                </select>
                            </div>

                            {/* Background Value */}
                            <div>
                                <label className="block text-sm font-medium text-chat-light mb-2">
                                    Background {formData.uiSettings.bgType === 'image' ? 'URL' : 'Value'}
                                </label>
                                {formData.uiSettings.bgType === 'color' ? (
                                    <input
                                        type="color"
                                        value={formData.uiSettings.bgValue}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            uiSettings: { ...formData.uiSettings, bgValue: e.target.value }
                                        })}
                                        className="w-full h-10 rounded cursor-pointer"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={formData.uiSettings.bgValue}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            uiSettings: { ...formData.uiSettings, bgValue: e.target.value }
                                        })}
                                        placeholder={formData.uiSettings.bgType === 'gradient' ? 'linear-gradient(...)' : 'https://...'}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    />
                                )}
                            </div>

                            {/* Font Settings */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-chat-light mb-2">Font Family</label>
                                    <select
                                        value={formData.uiSettings.fontSettings.family}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            uiSettings: {
                                                ...formData.uiSettings,
                                                fontSettings: { ...formData.uiSettings.fontSettings, family: e.target.value }
                                            }
                                        })}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="Inter" className="text-gray-900 bg-white">Inter</option>
                                        <option value="Roboto" className="text-gray-900 bg-white">Roboto</option>
                                        <option value="Arial" className="text-gray-900 bg-white">Arial</option>
                                        <option value="monospace" className="text-gray-900 bg-white">Monospace</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-chat-light mb-2">Font Size</label>
                                    <input
                                        type="number"
                                        min="12"
                                        max="20"
                                        value={formData.uiSettings.fontSettings.baseSize}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            uiSettings: {
                                                ...formData.uiSettings,
                                                fontSettings: { ...formData.uiSettings.fontSettings, baseSize: parseInt(e.target.value) }
                                            }
                                        })}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-chat-light mb-2">Font Weight</label>
                                    <select
                                        value={formData.uiSettings.fontSettings.weight}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            uiSettings: {
                                                ...formData.uiSettings,
                                                fontSettings: { ...formData.uiSettings.fontSettings, weight: e.target.value }
                                            }
                                        })}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="light" className="text-gray-900 bg-white">Light</option>
                                        <option value="medium" className="text-gray-900 bg-white">Medium</option>
                                        <option value="bold" className="text-gray-900 bg-white">Bold</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Logic & Rules Tab */}
                    {activeTab === 'logic' && (
                        <div className="space-y-6">
                            {/* Sticky Message */}
                            <div>
                                <label className="block text-sm font-medium text-chat-light mb-2">
                                    Sticky Message (Pinned in sidebar)
                                </label>
                                <textarea
                                    value={formData.logicConfig.stickyMessage}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        logicConfig: { ...formData.logicConfig, stickyMessage: e.target.value }
                                    })}
                                    rows="3"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="Welcome message or rules..."
                                />
                            </div>

                            {/* Slow Mode */}
                            <div>
                                <label className="block text-sm font-medium text-chat-light mb-2">
                                    Slow Mode (seconds between messages)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="60"
                                    value={formData.logicConfig.slowMode}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        logicConfig: { ...formData.logicConfig, slowMode: parseInt(e.target.value) }
                                    })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            {/* History Retention */}
                            <div>
                                <label className="block text-sm font-medium text-chat-light mb-2">
                                    History Retention (days)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={formData.logicConfig.historyRetentionDays}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        logicConfig: { ...formData.logicConfig, historyRetentionDays: parseInt(e.target.value) }
                                    })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            {/* Toggles */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="allowGifs"
                                        checked={formData.logicConfig.allowGifs}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            logicConfig: { ...formData.logicConfig, allowGifs: e.target.checked }
                                        })}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="allowGifs" className="text-sm text-chat-light">Allow GIFs</label>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="profanityFilter"
                                        checked={formData.logicConfig.profanityFilter}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            logicConfig: { ...formData.logicConfig, profanityFilter: e.target.checked }
                                        })}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="profanityFilter" className="text-sm text-chat-light">Profanity Filter</label>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="guestAccess"
                                        checked={formData.logicConfig.guestAccess}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            logicConfig: { ...formData.logicConfig, guestAccess: e.target.checked }
                                        })}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="guestAccess" className="text-sm text-chat-light">Guest Access</label>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="showTypingIndicator"
                                        checked={formData.logicConfig.showTypingIndicator}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            logicConfig: { ...formData.logicConfig, showTypingIndicator: e.target.checked }
                                        })}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="showTypingIndicator" className="text-sm text-chat-light">Show Typing Indicator</label>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="readReceipts"
                                        checked={formData.logicConfig.readReceipts}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            logicConfig: { ...formData.logicConfig, readReceipts: e.target.checked }
                                        })}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="readReceipts" className="text-sm text-chat-light">Read Receipts</label>
                                </div>
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
                    >
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditRoomModal;
