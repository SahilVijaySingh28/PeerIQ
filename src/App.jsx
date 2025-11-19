import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import Network from './pages/Network';
import Messages from './pages/Messages';
import Resources from './pages/Resources';
import Groups from './pages/Groups';
import VideoMeet from './pages/Video';
import Leaderboard from './pages/Leaderboard';
import Events from './pages/Events';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EmailVerification from './pages/EmailVerification';
import { useUser } from './contexts/UserContext';

function RequireAuth({ children }) {
  const { user } = useUser();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Email verification route - requires login */}
        <Route
          path="/verify-email"
          element={
            <RequireAuth>
              <EmailVerification />
            </RequireAuth>
          }
        />

        {/* Protected routes - require login AND email verification with modal prompt */}
        <Route
          path="/network"
          element={
            <ProtectedRoute requireVerification={true}>
              <Network />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute requireVerification={true}>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <ProtectedRoute requireVerification={true}>
              <Resources />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute requireVerification={true}>
              <Groups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video"
          element={
            <ProtectedRoute requireVerification={true}>
              <VideoMeet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute requireVerification={true}>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute requireVerification={true}>
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute requireVerification={true}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </div>
  );
}

export default App; 