import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Users, MessageCircle, Clock, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import connectionsAPI from '../services/connectionsAPI';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

const Network = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [activeTab, setActiveTab] = useState('discover');
  const [allUsers, setAllUsers] = useState([]);
  const [userConnections, setUserConnections] = useState({
    connections: [],
    sentRequests: [],
    receivedRequests: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  // Fetch all users and current user's connections
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const usersRes = await connectionsAPI.getAllUsers(user.id);

        if (usersRes.ok) {
          setAllUsers(usersRes.users);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // Set up real-time listener for user connections
  useEffect(() => {
    if (!user?.id) return;

    const userRef = doc(db, 'users', user.id);
    
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log('[Network] Real-time update for user connections:', {
          connections: userData.connections || [],
          sentRequests: userData.sentRequests || [],
          receivedRequests: userData.receivedRequests || [],
        });
        
        setUserConnections({
          connections: userData.connections || [],
          sentRequests: userData.sentRequests || [],
          receivedRequests: userData.receivedRequests || [],
        });
      }
    }, (error) => {
      console.error('Error listening to user connections:', error);
    });

    return () => unsubscribe();
  }, [user?.id]);

  // Filter and categorize users
  const getFilteredUsers = () => {
    let filtered = allUsers;

    if (searchQuery) {
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  const suggestions = filteredUsers.filter(
    u =>
      !userConnections.connections.includes(u.id) &&
      !userConnections.sentRequests.includes(u.id) &&
      !userConnections.receivedRequests.includes(u.id)
  );

  const connections = filteredUsers.filter(u =>
    userConnections.connections.includes(u.id)
  );

  const pendingRequests = filteredUsers.filter(u =>
    userConnections.sentRequests.includes(u.id) ||
    userConnections.receivedRequests.includes(u.id)
  );

  const handleSendRequest = async (targetUserId) => {
    setLoadingAction(true);
    console.log('[Network] Sending request to:', targetUserId);
    const result = await connectionsAPI.sendConnectionRequest(user.id, targetUserId);
    setLoadingAction(false);

    if (result.ok) {
      console.log('[Network] Send request successful, updating local state');
      setUserConnections(prev => ({
        ...prev,
        sentRequests: [...prev.sentRequests, targetUserId],
      }));
      alert('Request sent successfully!');
    } else {
      console.error('[Network] Send request error:', result.error);
      if (result.error.includes('permission')) {
        alert('Permission Error: Firestore security rules not configured.\n\nPlease see FIREBASE_QUICK_FIX.md for setup instructions.');
      } else {
        alert(result.error || 'Failed to send request');
      }
    }
  };

  const handleAcceptRequest = async (fromUserId) => {
    setLoadingAction(true);
    console.log('[Network] Accepting request from:', fromUserId);
    const result = await connectionsAPI.acceptConnectionRequest(fromUserId, user.id);
    setLoadingAction(false);

    if (result.ok) {
      console.log('[Network] Accept successful, updating local state');
      // The real-time listener will handle the update from Firestore
      // But we also update local state immediately for better UX
      setUserConnections(prev => ({
        ...prev,
        connections: [...prev.connections, fromUserId],
        receivedRequests: prev.receivedRequests.filter(id => id !== fromUserId),
        sentRequests: prev.sentRequests.filter(id => id !== fromUserId),
      }));
      alert('Request accepted! You are now connected.');
    } else {
      console.error('[Network] Accept failed:', result.error);
      alert(result.error || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (fromUserId) => {
    setLoadingAction(true);
    console.log('[Network] Rejecting request from:', fromUserId);
    const result = await connectionsAPI.rejectConnectionRequest(fromUserId, user.id);
    setLoadingAction(false);

    if (result.ok) {
      console.log('[Network] Reject successful, updating local state');
      setUserConnections(prev => ({
        ...prev,
        receivedRequests: prev.receivedRequests.filter(id => id !== fromUserId),
        sentRequests: prev.sentRequests.filter(id => id !== fromUserId),
      }));
      alert('Request rejected.');
    } else {
      console.error('[Network] Reject failed:', result.error);
      alert(result.error || 'Failed to reject request');
    }
  };

  const handleCancelRequest = async (targetUserId) => {
    setLoadingAction(true);
    console.log('[Network] Canceling request to:', targetUserId);
    const result = await connectionsAPI.cancelConnectionRequest(user.id, targetUserId);
    setLoadingAction(false);

    if (result.ok) {
      console.log('[Network] Cancel successful, updating local state');
      setUserConnections(prev => ({
        ...prev,
        sentRequests: prev.sentRequests.filter(id => id !== targetUserId),
        receivedRequests: prev.receivedRequests.filter(id => id !== targetUserId),
      }));
      alert('Request cancelled.');
    } else {
      console.error('[Network] Cancel failed:', result.error);
      alert(result.error || 'Failed to cancel request');
    }
  };

  const handleMessageClick = (friendId, friendName) => {
    navigate(`/messages?friendId=${friendId}&friendName=${friendName}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <p className="text-gray-600 font-semibold">Loading your network...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <motion.div 
        className="bg-white border-b sticky top-0 z-10 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Your Network</h1>
              <p className="text-gray-600 mt-1">Connect with peers and build relationships</p>
            </div>
            <motion.button
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition"
              title="Refresh page"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>

          {/* Search and Stats */}
          <div className="flex gap-3 items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-medium"
              />
            </div>
            <div className="text-sm text-gray-600 bg-primary-50 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 border border-primary-100">
              <Users className="w-5 h-5 text-primary-600" />
              {connections.length}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <motion.div 
          className="flex border-b-2 border-gray-200 gap-8 mb-10 overflow-x-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {[
            { key: 'discover', label: 'Discover', count: suggestions.length, icon: '🔍' },
            { key: 'connections', label: 'Connections', count: connections.length, icon: '✓' },
            { key: 'pending', label: 'Pending', count: pendingRequests.length, icon: '⏳' }
          ].map(tab => (
            <motion.button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              whileHover={{ y: -2 }}
              className={`pb-4 px-2 font-bold text-base border-b-4 transition whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon} {tab.label} <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full ml-2">{tab.count}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Content */}
        <div>
          {/* Discover Tab */}
          {activeTab === 'discover' && (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {suggestions.length > 0 ? (
                suggestions.map((student, idx) => (
                  <motion.div 
                    key={student.id} 
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 overflow-hidden group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="h-32 bg-gradient-to-br from-primary-100 to-secondary-100 relative overflow-hidden">
                      <Link to={`/profile/${student.id}`}>
                        <img
                          src={student.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.displayName || student.name || 'User')}`}
                          alt={student.displayName || student.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </Link>
                    </div>
                    <div className="p-5">
                      <Link to={`/profile/${student.id}`} className="hover:text-primary-600 transition">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition">{student.displayName || student.name}</h3>
                      </Link>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      {student.department && (
                        <p className="text-xs text-gray-500 mt-2 bg-gray-50 px-2 py-1 rounded-lg inline-block">{student.department}</p>
                      )}
                      <div className="mt-4 flex gap-2">
                        <motion.button
                          onClick={() => handleSendRequest(student.id)}
                          disabled={loadingAction}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 hover:shadow-lg disabled:opacity-50 text-white py-2.5 rounded-xl transition font-bold flex items-center justify-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          Connect
                        </motion.button>
                        <Link
                          to={`/profile/${student.id}`}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl transition text-center text-sm font-bold"
                        >
                          Profile
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-semibold">No users to discover</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Connections Tab */}
          {activeTab === 'connections' && (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {connections.length > 0 ? (
                connections.map((student, idx) => (
                  <motion.div 
                    key={student.id} 
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-green-100 hover:border-green-300 overflow-hidden group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="h-32 bg-gradient-to-br from-green-100 to-emerald-100 relative overflow-hidden">
                      <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <Link to={`/profile/${student.id}`}>
                        <img
                          src={student.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.displayName || student.name || 'User')}`}
                          alt={student.displayName || student.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </Link>
                    </div>
                    <div className="p-5">
                      <Link to={`/profile/${student.id}`} className="hover:text-primary-600 transition">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition">{student.displayName || student.name}</h3>
                      </Link>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      {student.department && (
                        <p className="text-xs text-gray-500 mt-2 bg-gray-50 px-2 py-1 rounded-lg inline-block">{student.department}</p>
                      )}
                      <div className="mt-4 flex gap-2">
                        <motion.button
                          onClick={() => handleMessageClick(student.id, student.displayName || student.name)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 hover:shadow-lg text-white py-2.5 rounded-xl transition font-bold flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </motion.button>
                        <Link
                          to={`/profile/${student.id}`}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl transition text-center text-sm font-bold"
                        >
                          Profile
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-semibold">No connections yet</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Pending Tab */}
          {activeTab === 'pending' && (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {pendingRequests.length > 0 ? (
                pendingRequests.map((student, idx) => {
                  const isReceived = userConnections.receivedRequests.includes(student.id);
                  return (
                    <motion.div 
                      key={student.id} 
                      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-amber-100 hover:border-amber-300 overflow-hidden group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                      <div className="h-32 bg-gradient-to-br from-amber-100 to-orange-100 relative overflow-hidden">
                        <Link to={`/profile/${student.id}`}>
                          <img
                            src={student.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.displayName || student.name || 'User')}`}
                            alt={student.displayName || student.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </Link>
                      </div>
                      <div className="p-5">
                        <Link to={`/profile/${student.id}`} className="hover:text-primary-600 transition">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition">{student.displayName || student.name}</h3>
                        </Link>
                        <p className="text-sm text-gray-600">{student.email}</p>
                        {student.department && (
                          <p className="text-xs text-gray-500 mt-2 bg-gray-50 px-2 py-1 rounded-lg inline-block">{student.department}</p>
                        )}
                        <p className="text-xs text-amber-600 mt-3 flex items-center gap-1.5 font-semibold bg-amber-50 px-3 py-2 rounded-lg">
                          <Clock className="w-4 h-4" />
                          {isReceived ? 'Awaiting your response' : 'Request sent'}
                        </p>
                        <div className="mt-4 flex gap-2">
                          {isReceived ? (
                            <>
                              <motion.button
                                onClick={() => handleAcceptRequest(student.id)}
                                disabled={loadingAction}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded-xl transition font-bold flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Accept
                              </motion.button>
                              <motion.button
                                onClick={() => handleRejectRequest(student.id)}
                                disabled={loadingAction}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2.5 rounded-xl transition font-bold flex items-center justify-center gap-1.5"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </motion.button>
                            </>
                          ) : (
                            <motion.button
                              onClick={() => handleCancelRequest(student.id)}
                              disabled={loadingAction}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="w-full bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white py-2.5 rounded-xl transition font-bold"
                            >
                              Cancel
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div 
                  className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Clock className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-semibold">No pending requests</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Network; 