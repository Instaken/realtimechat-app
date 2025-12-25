import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRooms } from '../services/mockData';
import { Plus, Search } from 'lucide-react';
import RoomCard from '../components/room/RoomCard';

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await getRooms();
                setRooms(data);
            } catch (error) {
                console.error("Failed to load rooms", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    // Filter rooms based on search
    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto h-full overflow-y-auto">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Explore Rooms</h1>
                    <p className="text-chat-light">Join a conversation or start your own community.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-chat-light" size={18} />
                        <input
                            type="text"
                            placeholder="Search rooms..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#565666] border border-chat-grey/50 rounded-lg py-2 pl-10 pr-4 text-white placeholder-chat-grey focus:outline-none focus:border-chat-light transition-colors"
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-chat-light text-chat-dark px-4 py-2 rounded-lg font-semibold hover:bg-white transition-colors">
                        <Plus size={18} />
                        <span className="hidden sm:inline">New Room</span>
                    </button>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-40 bg-[#565666] animate-pulse rounded-xl"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRooms.map(room => (
                        <RoomCard key={room.id} room={room} />
                    ))}

                    {filteredRooms.length === 0 && (
                        <div className="col-span-full py-12 text-center text-chat-light">
                            <p className="text-lg">No rooms found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RoomList;
