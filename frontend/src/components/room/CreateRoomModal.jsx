import { useState, useEffect } from 'react';
import { X, Hash, Users, Calendar, Palette } from 'lucide-react';

const CreateRoomModal = ({ isOpen, onClose, onCreateRoom, editingRoom }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        maxUsers: 50,
        ageLimit: 13,
        usersSectionColor: '#4a5568',
        roomInfoColor: '#2d3748',
        chatColor: '#1a202c'
    });

    // Update form when editing a room
    useEffect(() => {
        if (editingRoom) {
            setFormData({
                name: editingRoom.name || '',
                description: editingRoom.description || '',
                maxUsers: editingRoom.max_users || 50,
                ageLimit: editingRoom.age_limit || 13,
                usersSectionColor: editingRoom.colors?.usersSectionColor || '#4a5568',
                roomInfoColor: editingRoom.colors?.roomInfoColor || '#2d3748',
                chatColor: editingRoom.colors?.chatColor || '#1a202c'
            });
        } else {
            // Reset form for new room
            setFormData({
                name: '',
                description: '',
                maxUsers: 50,
                ageLimit: 13,
                usersSectionColor: '#4a5568',
                roomInfoColor: '#2d3748',
                chatColor: '#1a202c'
            });
        }
    }, [editingRoom, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreateRoom(formData);
        // Reset form
        setFormData({
            name: '',
            description: '',
            maxUsers: 50,
            ageLimit: 13,
            usersSectionColor: '#4a5568',
            roomInfoColor: '#2d3748',
            chatColor: '#1a202c'
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#565666] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-[#565666] border-b border-chat-grey/30 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-chat-light/10 rounded-lg">
                            <Hash className="text-chat-light" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {editingRoom ? 'Edit Room' : 'Create New Room'}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-chat-light">Customize your community space</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-chat-grey/20 rounded-lg transition-colors"
                    >
                        <X className="text-chat-light" size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Room Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-900 dark:text-white font-semibold mb-2">
                                Room Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., React Developers"
                                className="w-full bg-white dark:bg-chat-dark/50 border border-chat-grey/50 rounded-lg py-3 px-4 text-gray-900 dark:text-white placeholder-chat-grey focus:outline-none focus:border-chat-light transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-900 dark:text-white font-semibold mb-2">
                                About Channel
                            </label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe your room..."
                                className="w-full bg-white dark:bg-chat-dark/50 border border-chat-grey/50 rounded-lg py-3 px-4 text-gray-900 dark:text-white placeholder-chat-grey focus:outline-none focus:border-chat-light transition-colors"
                            />
                        </div>
                    </div>

                    {/* Max Users & Age Limit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-2">
                                <Users size={18} />
                                Max Users
                            </label>
                            <input
                                type="number"
                                name="maxUsers"
                                value={formData.maxUsers}
                                onChange={handleChange}
                                min="2"
                                max="500"
                                className="w-full bg-chat-dark/50 dark:bg-chat-dark/50 bg-gray-100 border border-chat-grey/50 rounded-lg py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-chat-light transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-2">
                                <Calendar size={18} />
                                Age Limit
                            </label>
                            <input
                                type="number"
                                name="ageLimit"
                                value={formData.ageLimit}
                                onChange={handleChange}
                                min="13"
                                max="99"
                                className="w-full bg-chat-dark/50 dark:bg-chat-dark/50 bg-gray-100 border border-chat-grey/50 rounded-lg py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-chat-light transition-colors"
                                required
                            />
                        </div>
                    </div>

                    {/* Color Customization */}
                    <div>
                        <label className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-3">
                            <Palette size={18} />
                            Color Customization
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Users Section Color */}
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-chat-light mb-2">
                                    Users Section
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        name="usersSectionColor"
                                        value={formData.usersSectionColor}
                                        onChange={handleChange}
                                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-chat-grey/50"
                                    />
                                    <input
                                        type="text"
                                        value={formData.usersSectionColor}
                                        onChange={(e) => setFormData(prev => ({ ...prev, usersSectionColor: e.target.value }))}
                                        className="flex-1 bg-chat-dark/50 dark:bg-chat-dark/50 bg-gray-100 border border-chat-grey/50 rounded-lg px-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-chat-light"
                                    />
                                </div>
                            </div>

                            {/* Room Info Color */}
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-chat-light mb-2">
                                    Room Info
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        name="roomInfoColor"
                                        value={formData.roomInfoColor}
                                        onChange={handleChange}
                                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-chat-grey/50"
                                    />
                                    <input
                                        type="text"
                                        value={formData.roomInfoColor}
                                        onChange={(e) => setFormData(prev => ({ ...prev, roomInfoColor: e.target.value }))}
                                        className="flex-1 bg-chat-dark/50 dark:bg-chat-dark/50 bg-gray-100 border border-chat-grey/50 rounded-lg px-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-chat-light"
                                    />
                                </div>
                            </div>

                            {/* Chat Color */}
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-chat-light mb-2">
                                    Chat Area
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        name="chatColor"
                                        value={formData.chatColor}
                                        onChange={handleChange}
                                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-chat-grey/50"
                                    />
                                    <input
                                        type="text"
                                        value={formData.chatColor}
                                        onChange={(e) => setFormData(prev => ({ ...prev, chatColor: e.target.value }))}
                                        className="flex-1 bg-chat-dark/50 dark:bg-chat-dark/50 bg-gray-100 border border-chat-grey/50 rounded-lg px-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-chat-light"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-chat-dark/30 dark:bg-chat-dark/30 bg-gray-50 rounded-lg p-4 border border-chat-grey/30">
                        <p className="text-sm text-gray-600 dark:text-chat-light mb-3 font-semibold">Preview</p>
                        <div className="grid grid-cols-3 gap-2 h-20">
                            <div
                                className="rounded-lg flex items-center justify-center text-white text-xs font-medium"
                                style={{ backgroundColor: formData.usersSectionColor }}
                            >
                                Users
                            </div>
                            <div
                                className="rounded-lg flex items-center justify-center text-white text-xs font-medium"
                                style={{ backgroundColor: formData.roomInfoColor }}
                            >
                                Room Info
                            </div>
                            <div
                                className="rounded-lg flex items-center justify-center text-white text-xs font-medium"
                                style={{ backgroundColor: formData.chatColor }}
                            >
                                Chat
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-chat-grey/20 hover:bg-chat-grey/30 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-chat-light hover:bg-white text-chat-dark font-semibold py-3 rounded-lg transition-colors"
                        >
                            {editingRoom ? 'Update Room' : 'Create Room'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomModal;
