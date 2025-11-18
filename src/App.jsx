import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import Network from './pages/Network';
import Messages from './pages/Messages';
import Resources from './pages/Resources';
import Groups from './pages/Groups';
import VideoMeet from './pages/Video';
import Leaderboard from './pages/Leaderboard';
import Events from './pages/Events';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EmailVerification from './pages/EmailVerification';
import { useUser } from './contexts/UserContext';

function RequireAuth({ children }) {
  const { user } = useUser();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireVerification({ children }) {
  const { user } = useUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />;
  return children;
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Routes>
        {/* Public auth routes */}
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

        {/* Protected routes - require login AND email verification */}
        <Route
          path="/"
          element={
            <RequireVerification>
              <HomePage />
            </RequireVerification>
          }
        />
        <Route
          path="/network"
          element={
            <RequireVerification>
              <Network />
            </RequireVerification>
          }
        />
        <Route
          path="/messages"
          element={
            <RequireVerification>
              <Messages />
            </RequireVerification>
          }
        />
        <Route
          path="/resources"
          element={
            <RequireVerification>
              <Resources />
            </RequireVerification>
          }
        />
        <Route
          path="/groups"
          element={
            <RequireVerification>
              <Groups />
            </RequireVerification>
          }
        />
        <Route
          path="/video"
          element={
            <RequireVerification>
              <VideoMeet />
            </RequireVerification>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <RequireVerification>
              <Leaderboard />
            </RequireVerification>
          }
        />
        <Route
          path="/events"
          element={
            <RequireVerification>
              <Events />
            </RequireVerification>
          }
        />
      </Routes>
      <Footer />
    </div>
  );
}

export default App; 