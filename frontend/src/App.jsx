import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
// Lazy load pages
import Auth from './pages/Auth';
import RoomList from './pages/RoomList';
import ChatRoom from './pages/ChatRoom';

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
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Auth />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<RoomList />} />
          <Route path="room/:roomId" element={<ChatRoom />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
