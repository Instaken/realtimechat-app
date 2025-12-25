import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Lock, Unlock } from 'lucide-react';

const RoomCard = ({ room }) => {
    // Mock user count for display
    const userCount = Math.floor(Math.random() * 50) + 1;

    return (
        <Link
            to={`/room/${room.id}`}
            className="group bg-[#565666] hover:bg-[#606070] border border-chat-grey/30 hover:border-chat-light/50 p-5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between h-40"
        >
            <div>
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-white group-hover:text-blue-200 transition-colors">
                        {room.name}
                    </h3>
                    {room.is_private ? (
                        <Lock size={16} className="text-yellow-400" />
                    ) : (
                        <Unlock size={16} className="text-green-400" />
                    )}
                </div>
                <p className="text-sm text-chat-light/80 font-mono">#{room.slug}</p>
            </div>

            <div className="flex items-center justify-between text-chat-light text-sm mt-4">
                <span className="flex items-center gap-1">
                    <Users size={14} />
                    {userCount} online
                </span>
                <span className="text-xs opacity-60">
                    {new Date(room.created_at).toLocaleDateString()}
                </span>
            </div>
        </Link>
    );
};

export default RoomCard;
