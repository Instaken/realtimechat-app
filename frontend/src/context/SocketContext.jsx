import { createContext, useContext, useEffect, useState } from 'react';
import { socketService } from '../services/socket';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        // We can attach listeners directly to the socket instance if it exists,
        // but socketService abstracts this. 
        // We'll need to check if socket is already initialized in service.
        /* 
           Since socketService.socket might be null initially, we rely on the service 
           to handle connection. But we want to reflect state here.
           The service doesn't currently emit events to us.
           We might need to add a simple listener mechanism to SocketService 
           or just trust the logs for now and add state listeners later if needed.
           For now, we'll just expose the service.
        */

        return () => {
            // cleanup if needed
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
