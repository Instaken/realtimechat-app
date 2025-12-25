
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
            is_private: false,
            owner_id: 'u2',
            site_origin: 'client-site.com',
            created_at: new Date().toISOString()
        },
        {
            id: 'r2',
            name: 'React Developers',
            slug: 'react-devs',
            is_private: false,
            owner_id: 'u2',
            site_origin: 'client-site.com',
            created_at: new Date().toISOString()
        },
        {
            id: 'r3',
            name: 'Admins Only',
            slug: 'admins-only',
            is_private: true,
            owner_id: 'u2',
            site_origin: 'client-site.com',
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

export const login = async (email, password) => {
    const db = loadDb();
    const user = db.users.find(u => u.email === email && u.password_hash === password);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (user) resolve(user);
            else reject(new Error('Invalid credentials'));
        }, 500);
    });
};

export const register = async (username, email, password) => {
    const db = loadDb();
    if (db.users.find(u => u.username === username || u.email === email)) {
        return Promise.reject(new Error('User already exists'));
    }

    const newUser = {
        id: 'u' + Date.now(),
        username,
        email,
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
