import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { roomService } from '../services/api';
import RoomCard from '../components/room/RoomCard';
import CreateRoomModal from '../components/room/CreateRoomModal';

/**
 * Room List Page
 * Displays all available chat rooms with search and CRUD operations
 */
const RoomList = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);

    // Load user and rooms on mount
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('chat_user') || '{}');
        setCurrentUser(user);
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const data = await roomService.getMyRooms();
            // Backend returns a list of rooms, ensure it's an array
            setRooms(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load rooms", error);
            setRooms([]); // Fallback to empty list on error
        } finally {
            setLoading(false);
        }
    };

    // Handle room creation/update
    const handleSaveRoom = async (roomData) => {
        try {
            if (editingRoom) {
                const response = await roomService.updateRoom(editingRoom.id, roomData);
                await fetchRooms();
                handleCloseModal();
                return response.room;
            } else {
                const response = await roomService.createRoom(roomData);
                await fetchRooms();
                // We return the response so the modal can show success
                return response.room;
            }
        } catch (error) {
            console.error("Failed to save room", error.response?.data);
            const backendError = error.response?.data;
            let errorMsg = backendError?.message || error.message;

            if (backendError?.errors && Array.isArray(backendError.errors)) {
                const details = backendError.errors
                    .map(e => `${e.path ? e.path.join('.') : 'Field'}: ${e.message}`)
                    .join('\n');
                errorMsg = `Validation Error:\n${details}`;
            }

            alert(errorMsg);
            throw error; // Rethrow so modal knows it failed
        }
    };

    // Handle room deletion
    const handleDeleteRoom = async (roomId) => {
        try {
            await roomService.deleteRoom(roomId);
            await fetchRooms();
        } catch (error) {
            console.error("Failed to delete room", error);
            alert(error.message);
        }
    };

    // Handle edit button click
    const handleEditRoom = (room) => {
        setEditingRoom(room);
        setIsModalOpen(true);
    };

    // Close modal and reset editing state
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRoom(null);
    };

    // Filter rooms based on search term
    const filteredRooms = rooms.filter(room =>
        (room.name && room.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (room.slug && room.slug.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6 max-w-7xl mx-auto h-full overflow-y-auto">
            {/* Header */}
            <RoomListHeader
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onCreateClick={() => setIsModalOpen(true)}
            />

            {/* Room Grid */}
            {loading ? (
                <LoadingGrid />
            ) : (
                <RoomGrid
                    rooms={filteredRooms}
                    currentUserId={currentUser?.id}
                    onDelete={handleDeleteRoom}
                    onEdit={handleEditRoom}
                />
            )}

            {/* Create/Edit Modal */}
            <CreateRoomModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onCreateRoom={handleSaveRoom}
                editingRoom={editingRoom}
            />
        </div>
    );
};

const RoomListHeader = ({ searchTerm, onSearchChange, onCreateClick }) => (
    <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6 animate-fadeIn">
        <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                Rooms
            </h1>
            <p className="text-gray-600 dark:text-chat-light flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Join an existing room or create your own community.
            </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-chat-grey group-focus-within:text-chat-light transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search rooms..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-white dark:bg-[#464655] border border-chat-grey/20 rounded-2xl py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder-chat-grey focus:outline-none focus:border-chat-light/50 focus:ring-4 focus:ring-chat-light/10 shadow-lg transition-all"
                />
            </div>

            {/* Create Button with Glow */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-chat-light rounded-2xl opacity-30 blur group-hover:opacity-60 transition duration-300"></div>
                <button
                    onClick={onCreateClick}
                    className="relative flex items-center gap-2 bg-chat-light text-chat-dark px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white transition-all shadow-xl active:scale-95"
                >
                    <Plus size={20} className="stroke-[3px]" />
                    <span className="hidden sm:inline">Create Room</span>
                </button>
            </div>
        </div>
    </div>
);

const LoadingGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 bg-[#565666] animate-pulse rounded-xl"></div>
        ))}
    </div>
);

const RoomGrid = ({ rooms, currentUserId, onDelete, onEdit }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
            <RoomCard
                key={room.id}
                room={room}
                currentUserId={currentUserId}
                onDelete={onDelete}
                onEdit={onEdit}
            />
        ))}

        {rooms.length === 0 && (
            <div className="col-span-full py-12 text-center text-chat-light">
                <p className="text-lg">No rooms found.</p>
            </div>
        )}
    </div>
);

export default RoomList;
