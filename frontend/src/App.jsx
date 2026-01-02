import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/Layout';
// Lazy load pages
import Auth from './pages/Auth';
import RoomList from './pages/RoomList';
import ChatRoom from './pages/ChatRoom';
import Profile from './pages/Profile';
import EmbedChat from './pages/EmbedChat';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('chat_user'); // Simple check
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route path="/auth" element={<Navigate to="/login" replace />} />

            {/* Embed Route - Accessable without Layout or standard ProtectedRoute (handles own guest auth) */}
            <Route path="/embed/chat/:roomId" element={<EmbedChat />} />

            <Route path="/app" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<RoomList />} />
              <Route path="room/:roomId" element={<ChatRoom />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
