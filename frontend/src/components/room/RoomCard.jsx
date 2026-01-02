import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Lock, Unlock, Edit, Trash2, MoreVertical } from 'lucide-react';

const RoomCard = ({ room, currentUserId, onDelete, onEdit }) => {
    const [showMenu, setShowMenu] = useState(false);
    const userCount = 1; // Only current user for now
    const isOwner = room.owner_id === currentUserId;

    return (
        <div className="group bg-white dark:bg-[#565666] hover:bg-[#606070] dark:hover:bg-[#606070] hover:bg-gray-50 border border-chat-grey/30 hover:border-chat-light/50 p-5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between h-40 relative">
            {/* Owner Menu */}
            {isOwner && (
                <div className="absolute top-3 right-3 z-10">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setShowMenu(!showMenu);
                        }}
                        className="p-1 hover:bg-chat-grey/30 rounded transition-colors"
                    >
                        <MoreVertical size={18} className="text-chat-light" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-1 bg-[#3b3b4d] dark:bg-[#3b3b4d] bg-white border border-chat-grey/30 rounded-lg shadow-xl py-1 min-w-[120px]">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    onEdit(room);
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-chat-grey/20 transition-colors"
                            >
                                <Edit size={14} />
                                Edit
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (confirm(`Are you sure you want to delete "${room.name}"?`)) {
                                        onDelete(room.id);
                                    }
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            )}

            <Link
                to={`/app/room/${room.id}`}
                className="flex flex-col justify-between h-full"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2 pr-8">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors truncate">
                            {room.name}
                        </h3>
                        {room.is_private ? (
                            <Lock size={16} className="text-yellow-400 flex-shrink-0" title="Private Room" />
                        ) : (
                            <Unlock size={16} className="text-green-400 flex-shrink-0" title="Public Room" />
                        )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-chat-light/80 font-mono">#{room.slug}</p>
                </div>

                <div className="flex items-center justify-between text-gray-600 dark:text-chat-light text-sm mt-4">
                    <span className="flex items-center gap-1">
                        <Users size={14} />
                        {userCount}/{room.max_users}
                    </span>
                    <span className="text-xs opacity-60">
                        {new Date(room.created_at).toLocaleDateString()}
                    </span>
                </div>
            </Link>
        </div>
    );
};

export default RoomCard;
