
// Mock Data Service
// Simulates a backend with Users, Rooms, Messages, etc.

const STORAGE_KEY = 'chat_app_db';

// Initial Data
const initialDb = {
    users: [
        {
            id: 'u1',
            username: 'johndoe',
            email: 'john@example.com',
            password_hash: 'pass123', // In real app, this would be hashed
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
            status: 'online',
            role: 'user',
            created_at: new Date().toISOString()
        },
        {
            id: 'u2',
            username: 'admin_alice',
            email: 'alice@example.com',
            password_hash: 'admin123',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
            status: 'away',
            role: 'admin',
            created_at: new Date().toISOString()
        }
    ],
    rooms: [
        {
            id: 'r1',
            name: 'General Chat',
            slug: 'general-chat',
            description: 'A place for general discussions and casual conversations',
            is_private: false,
            owner_id: 'u2',
            site_origin: 'client-site.com',
            max_users: 100,
            age_limit: 13,
            colors: {
                usersSectionColor: '#4a5568',
                roomInfoColor: '#2d3748',
                chatColor: '#1a202c'
            },
            created_at: new Date().toISOString()
        },
        {
            id: 'r2',
            name: 'React Developers',
            slug: 'react-devs',
            description: 'Connect with React developers and share knowledge',
            is_private: false,
            owner_id: 'u2',
            site_origin: 'client-site.com',
            max_users: 50,
            age_limit: 16,
            colors: {
                usersSectionColor: '#61dafb',
                roomInfoColor: '#282c34',
                chatColor: '#20232a'
            },
            created_at: new Date().toISOString()
        },
        {
            id: 'r3',
            name: 'Admins Only',
            slug: 'admins-only',
            description: 'Private room for administrators',
            is_private: true,
            owner_id: 'u2',
            site_origin: 'client-site.com',
            max_users: 10,
            age_limit: 18,
            colors: {
                usersSectionColor: '#dc2626',
                roomInfoColor: '#991b1b',
                chatColor: '#7f1d1d'
            },
            created_at: new Date().toISOString()
        }
    ],
    messages: [
        {
            id: 'm1',
            room_id: 'r1',
            user_id: 'u2',
            content: 'Welcome to the general chat!',
            type: 'text',
            attachment_url: null,
            is_deleted: false,
            created_at: new Date(Date.now() - 100000).toISOString()
        },
        {
            id: 'm2',
            room_id: 'r1',
            user_id: 'u1',
            content: 'Hello everyone!',
            type: 'text',
            attachment_url: null,
            is_deleted: false,
            created_at: new Date(Date.now() - 80000).toISOString()
        }
    ],
    moderation: []
};

// Helper: Load/Save DB from localStorage
const loadDb = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialDb;
};

const saveDb = (db) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

// --- Auth Services ---

export const login = async (username, password) => {
    const db = loadDb();
    const user = db.users.find(u => u.username === username && u.password_hash === password);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (user) resolve(user);
            else reject(new Error('Invalid credentials'));
        }, 500);
    });
};

export const register = async (username, password) => {
    const db = loadDb();
    if (db.users.find(u => u.username === username)) {
        return Promise.reject(new Error('Username already exists'));
    }

    const newUser = {
        id: 'u' + Date.now(),
        username,
        email: `${username}@example.com`, // Auto-generate email from username
        password_hash: password,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        status: 'online',
        role: 'user',
        created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDb(db);

    return Promise.resolve(newUser);
};

// --- Room Services ---

export const getRooms = async () => {
    const db = loadDb();
    // Simulate network delay
    return new Promise(resolve => setTimeout(() => resolve(db.rooms), 300));
};

export const getRoomById = async (roomId) => {
    const db = loadDb();
    const room = db.rooms.find(r => r.id === roomId);
    return room ? Promise.resolve(room) : Promise.reject(new Error('Room not found'));
};

export const createRoom = async (roomData, ownerId) => {
    const db = loadDb();

    // Generate slug from name
    const slug = roomData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    // Check if slug already exists
    if (db.rooms.find(r => r.slug === slug)) {
        return Promise.reject(new Error('A room with this name already exists'));
    }

    const newRoom = {
        id: 'r' + Date.now(),
        name: roomData.name,
        slug: slug,
        description: roomData.description || '',
        is_private: false,
        owner_id: ownerId,
        site_origin: 'client-site.com',
        max_users: parseInt(roomData.maxUsers) || 50,
        age_limit: parseInt(roomData.ageLimit) || 13,
        colors: {
            usersSectionColor: roomData.usersSectionColor || '#4a5568',
            roomInfoColor: roomData.roomInfoColor || '#2d3748',
            chatColor: roomData.chatColor || '#1a202c'
        },
        created_at: new Date().toISOString()
    };

    db.rooms.push(newRoom);
    saveDb(db);

    return Promise.resolve(newRoom);
};

export const deleteRoom = async (roomId) => {
    const db = loadDb();
    const roomIndex = db.rooms.findIndex(r => r.id === roomId);

    if (roomIndex === -1) {
        return Promise.reject(new Error('Room not found'));
    }

    // Remove the room
    db.rooms.splice(roomIndex, 1);

    // Optionally, remove all messages from this room
    db.messages = db.messages.filter(m => m.room_id !== roomId);

    saveDb(db);
    return Promise.resolve({ success: true });
};

export const updateRoom = async (roomId, roomData) => {
    const db = loadDb();
    const roomIndex = db.rooms.findIndex(r => r.id === roomId);

    if (roomIndex === -1) {
        return Promise.reject(new Error('Room not found'));
    }

    // Update room data
    db.rooms[roomIndex] = {
        ...db.rooms[roomIndex],
        name: roomData.name || db.rooms[roomIndex].name,
        description: roomData.description !== undefined ? roomData.description : db.rooms[roomIndex].description,
        max_users: roomData.maxUsers ? parseInt(roomData.maxUsers) : db.rooms[roomIndex].max_users,
        age_limit: roomData.ageLimit ? parseInt(roomData.ageLimit) : db.rooms[roomIndex].age_limit,
        colors: roomData.usersSectionColor ? {
            usersSectionColor: roomData.usersSectionColor,
            roomInfoColor: roomData.roomInfoColor,
            chatColor: roomData.chatColor
        } : db.rooms[roomIndex].colors
    };

    saveDb(db);
    return Promise.resolve(db.rooms[roomIndex]);
};

// --- Message Services ---

export const getMessages = async (roomId) => {
    const db = loadDb();
    const messages = db.messages.filter(m => m.room_id === roomId && !m.is_deleted);
    // Sort by creation time
    messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Enrich with user data for UI convenience
    const enriched = messages.map(m => {
        const sender = db.users.find(u => u.id === m.user_id);
        return { ...m, sender };
    });

    return new Promise(resolve => setTimeout(() => resolve(enriched), 300));
};

export const sendMessage = async (roomId, userId, content, type = 'text', attachmentUrl = null) => {
    const db = loadDb();
    const newMessage = {
        id: 'm' + Date.now(),
        room_id: roomId,
        user_id: userId,
        content,
        type,
        attachment_url: attachmentUrl,
        is_deleted: false,
        created_at: new Date().toISOString()
    };

    db.messages.push(newMessage);
    saveDb(db);

    // Return enriched message
    const sender = db.users.find(u => u.id === userId);
    return Promise.resolve({ ...newMessage, sender });
};
