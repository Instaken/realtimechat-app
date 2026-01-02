import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../services/mockData';
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
            const data = await getRooms();
            setRooms(data);
        } catch (error) {
            console.error("Failed to load rooms", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle room creation/update
    const handleSaveRoom = async (roomData) => {
        try {
            if (editingRoom) {
                const updatedRoom = await updateRoom(editingRoom.id, roomData);
                setRooms(rooms.map(r => r.id === editingRoom.id ? updatedRoom : r));
            } else {
                const newRoom = await createRoom(roomData, currentUser.id);
                setRooms([...rooms, newRoom]);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save room", error);
            alert(error.message);
        }
    };

    // Handle room deletion
    const handleDeleteRoom = async (roomId) => {
        try {
            await deleteRoom(roomId);
            setRooms(rooms.filter(r => r.id !== roomId));
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
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

/**
 * Room List Header Component
 * Contains title, search bar, and create button
 */
const RoomListHeader = ({ searchTerm, onSearchChange, onCreateClick }) => (
    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Explore Rooms
            </h1>
            <p className="text-gray-600 dark:text-chat-light">
                Join a conversation or start your own community.
            </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-chat-light" size={18} />
                <input
                    type="text"
                    placeholder="Search rooms..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-white dark:bg-[#565666] border border-chat-grey/50 rounded-lg py-2 pl-10 pr-4 text-gray-900 dark:text-white placeholder-chat-grey focus:outline-none focus:border-chat-light transition-colors"
                />
            </div>

            {/* Create Button */}
            <button
                onClick={onCreateClick}
                className="flex items-center gap-2 bg-chat-light text-chat-dark px-4 py-2 rounded-lg font-semibold hover:bg-white transition-colors"
            >
                <Plus size={18} />
                <span className="hidden sm:inline">New Room</span>
            </button>
        </div>
    </div>
);

/**
 * Loading Grid Component
 * Shows skeleton loaders while rooms are being fetched
 */
const LoadingGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 bg-[#565666] animate-pulse rounded-xl"></div>
        ))}
    </div>
);

/**
 * Room Grid Component
 * Displays room cards in a responsive grid
 */
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
