import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('chat_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth Services
export const authService = {
    login: async (identifier, password) => {
        const response = await api.post('/auth/login', { identifier, password });
        if (response.data.accessToken) {
            localStorage.setItem('chat_token', response.data.accessToken);
            localStorage.setItem('chat_user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    register: async (userData) => {
        // Format date to ISO 8601 as required by documentation
        const birthdateISO = new Date(userData.birthdate).toISOString();
        const avatarUrl = userData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`;

        const response = await api.post('/auth/register', {
            username: userData.username,
            email: userData.email,
            password: userData.password,
            birthdate: birthdateISO,
            avatarUrl: avatarUrl
        });
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('chat_token');
        localStorage.removeItem('chat_user');
    }
};

// User Services
export const userService = {
    getMe: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },
    updateMe: async (userData) => {
        // Handle partial updates and date conversion
        const payload = { ...userData };
        if (payload.birthdate) {
            payload.birthdate = new Date(payload.birthdate).toISOString();
        }
        const response = await api.put('/users/me', payload);
        return response.data;
    },
    getUserById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    }
};

// Rooms Services
export const roomService = {
    getMyRooms: async () => {
        const response = await api.get('/rooms/my-rooms');
        // Doc says response is { "rooms": [...] }
        return response.data.rooms || [];
    },
    getPublicRooms: async () => {
        const response = await api.get('/rooms/public');
        return response.data.rooms || [];
    },
    getRoomBySlug: async (slug) => {
        const response = await api.get(`/rooms/${slug}`);
        // Doc says response is { "room": {...} }
        return response.data.room;
    },
    getRoomByApiKey: async (apiKey) => {
        const response = await api.get(`/rooms/api-key/${apiKey}`);
        return response.data.room;
    },
    createRoom: async (roomData) => {
        const response = await api.post('/rooms', roomData);
        return response.data;
    },
    updateRoom: async (id, roomData) => {
        const response = await api.put(`/rooms/${id}`, roomData);
        return response.data;
    },
    deleteRoom: async (id) => {
        const response = await api.delete(`/rooms/${id}`);
        return response.data;
    },
    getRoomMessages: async (roomId) => {
        const response = await api.get(`/rooms/${roomId}/messages`);
        return response.data.messages || [];
    },
    getRoomParticipants: async (roomId) => {
        const response = await api.get(`/rooms/${roomId}/participants`);
        return response.data;
    },
    setModeratorStatus: async (roomId, participantId, isModerator) => {
        const response = await api.patch(`/rooms/${roomId}/moderator`, {
            participantId,
            isModerator
        });
        return response.data;
    },
    muteParticipant: async (roomId, userId) => {
        const response = await api.patch(`/rooms/${roomId}/participants/${userId}/mute`);
        return response.data;
    },
    unmuteParticipant: async (roomId, userId) => {
        const response = await api.patch(`/rooms/${roomId}/participants/${userId}/unmute`);
        return response.data;
    },
    banParticipant: async (roomId, userId) => {
        const response = await api.patch(`/rooms/${roomId}/participants/${userId}/ban`);
        return response.data;
    },
    unbanParticipant: async (roomId, userId) => {
        const response = await api.patch(`/rooms/${roomId}/participants/${userId}/unban`);
        return response.data;
    }
};

// Plans Services (SaaS)
export const planService = {
    getAllPlans: async () => {
        const response = await api.get('/room-plans');
        return response.data;
    },
    getPlanById: async (id) => {
        const response = await api.get(`/room-plans/${id}`);
        return response.data;
    }
};

export default api;
