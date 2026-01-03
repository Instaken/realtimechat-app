import { createContext, useContext, useEffect, useState } from 'react';
import { socketService } from '../services/socket';

const SocketContext = createContext({
    socketService: null,
    isConnected: false
});

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect socket on mount if user is authenticated
        const token = localStorage.getItem('chat_token');
        if (token && !socketService.socket?.connected) {
            console.log('🔌 Connecting socket with token...');
            socketService.connect(token);
        }

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        // Listen to socket connection events if socket exists
        if (socketService.socket) {
            socketService.socket.on('connect', onConnect);
            socketService.socket.on('disconnect', onDisconnect);
        }

        return () => {
            if (socketService.socket) {
                socketService.socket.off('connect', onConnect);
                socketService.socket.off('disconnect', onDisconnect);
            }
        };
    }, []);

    const value = {
        socketService,
        isConnected // We can implement this state binding later if needed for UI indicators
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
