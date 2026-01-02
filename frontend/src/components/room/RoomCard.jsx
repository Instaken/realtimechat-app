import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Lock, Unlock, Edit, Trash2, MoreVertical, ShieldCheck, Zap } from 'lucide-react';

const RoomCard = ({ room, currentUserId, onDelete, onEdit }) => {
    const [showMenu, setShowMenu] = useState(false);

    // Fallback to _count.participants if available, else 0
    const participantCount = room._count?.participants || 0;
    const isOwner = room.ownerId === currentUserId;

    // Use primaryColor from uiSettings if available, or default blue
    const primaryColor = room.uiSettings?.primaryColor || '#6366f1';

    return (
        <div className="group relative">
            {/* Background Glow Effect */}
            <div
                className="absolute -inset-0.5 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-300"
                style={{ backgroundColor: primaryColor }}
            ></div>

            <div className="relative bg-white dark:bg-[#464655] hover:bg-[#505060] border border-chat-grey/20 p-5 rounded-2xl transition-all duration-300 shadow-xl flex flex-col justify-between h-44 overflow-hidden">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${room.isPrivate ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                        {room.isPrivate ? <Lock size={10} /> : <Unlock size={10} />}
                        {room.isPrivate ? 'Private' : 'Open'}
                    </div>

                    {isOwner && (
                        <div className="flex items-center gap-1.5">
                            <div className="bg-chat-light/10 text-chat-light px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 mr-1">
                                <ShieldCheck size={10} />
                                OWNER
                            </div>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    onEdit(room);
                                }}
                                className="p-1.5 bg-white/5 hover:bg-chat-light hover:text-chat-dark rounded-lg transition-all text-chat-light border border-white/10"
                                title="Edit Room"
                            >
                                <Edit size={14} />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (confirm(`Delete room "${room.name}"? This cannot be undone.`)) {
                                        onDelete(room.id);
                                    }
                                }}
                                className="p-1.5 bg-white/5 hover:bg-red-500 hover:text-white rounded-lg transition-all text-red-400 border border-white/10"
                                title="Delete Room"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>

                <Link to={`/app/room/${room.slug}`} className="flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="font-black text-xl text-gray-900 dark:text-white group-hover:text-chat-light transition-colors truncate">
                            {room.name}
                        </h3>
                        <p className="text-xs text-chat-grey font-mono mt-1 flex items-center gap-1">
                            <Zap size={10} className="text-chat-light" />
                            uzo.chat/room/{room.slug}
                        </p>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-[#464655] bg-[#3b3b4d] flex items-center justify-center text-[10px] text-white font-bold">
                                        {participantCount > i ? '?' : participantCount}
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs font-bold text-chat-grey">
                                {participantCount}/{room.maxUsers}
                            </span>
                        </div>

                        <div className="text-[10px] font-bold text-chat-grey uppercase tracking-widest opacity-50">
                            ID: {room.id.split('-')[0]}
                        </div>
                    </div>
                </Link>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default RoomCard;
