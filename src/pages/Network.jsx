import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Users, MessageCircle, Clock, RefreshCw } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Your Network</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Refresh page"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <div className="text-sm text-gray-500">
                <Users className="inline-block mr-2 w-5 h-5" />
                {connections.length} Connections
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 gap-8 mb-8">
          <button
            onClick={() => setActiveTab('discover')}
            className={`pb-3 px-1 font-medium text-sm border-b-2 transition ${
              activeTab === 'discover'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Discover ({suggestions.length})
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`pb-3 px-1 font-medium text-sm border-b-2 transition ${
              activeTab === 'connections'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Connections ({connections.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-1 font-medium text-sm border-b-2 transition ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending ({pendingRequests.length})
          </button>
        </div>

        {/* Content */}
        <div>
          {/* Discover Tab */}
          {activeTab === 'discover' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.length > 0 ? (
                suggestions.map((student) => (
                  <div key={student.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                    <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600 relative">
                      <Link to={`/profile/${student.id}`}>
                        <img
                          src={student.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.displayName || student.name || 'User')}`}
                          alt={student.displayName || student.name}
                          className="w-full h-full object-cover opacity-50 hover:opacity-75 transition"
                        />
                      </Link>
                    </div>
                    <div className="p-4">
                      <Link to={`/profile/${student.id}`} className="hover:text-blue-600">
                        <h3 className="text-lg font-semibold text-gray-900">{student.displayName || student.name}</h3>
                      </Link>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      {student.department && (
                        <p className="text-xs text-gray-500 mt-1">{student.department}</p>
                      )}
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleSendRequest(student.id)}
                          disabled={loadingAction}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          Connect
                        </button>
                        <Link
                          to={`/profile/${student.id}`}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition text-center text-sm font-medium"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No users to discover. Check back later!</p>
                </div>
              )}
            </div>
          )}

          {/* Connections Tab */}
          {activeTab === 'connections' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.length > 0 ? (
                connections.map((student) => (
                  <div key={student.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                    <div className="h-32 bg-gradient-to-r from-green-400 to-green-600 relative">
                      <Link to={`/profile/${student.id}`}>
                        <img
                          src={student.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.displayName || student.name || 'User')}`}
                          alt={student.displayName || student.name}
                          className="w-full h-full object-cover opacity-50 hover:opacity-75 transition"
                        />
                      </Link>
                    </div>
                    <div className="p-4">
                      <Link to={`/profile/${student.id}`} className="hover:text-blue-600">
                        <h3 className="text-lg font-semibold text-gray-900">{student.displayName || student.name}</h3>
                      </Link>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      {student.department && (
                        <p className="text-xs text-gray-500 mt-1">{student.department}</p>
                      )}
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleMessageClick(student.id, student.displayName || student.name)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </button>
                        <Link
                          to={`/profile/${student.id}`}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition text-center text-sm font-medium"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No connections yet. Start connecting!</p>
                </div>
              )}
            </div>
          )}

          {/* Pending Tab */}
          {activeTab === 'pending' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((student) => {
                  const isReceived = userConnections.receivedRequests.includes(student.id);
                  return (
                    <div key={student.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                      <div className="h-32 bg-gradient-to-r from-yellow-400 to-yellow-600 relative">
                        <Link to={`/profile/${student.id}`}>
                          <img
                            src={student.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.displayName || student.name || 'User')}`}
                            alt={student.displayName || student.name}
                            className="w-full h-full object-cover opacity-50 hover:opacity-75 transition"
                          />
                        </Link>
                      </div>
                      <div className="p-4">
                        <Link to={`/profile/${student.id}`} className="hover:text-blue-600">
                          <h3 className="text-lg font-semibold text-gray-900">{student.displayName || student.name}</h3>
                        </Link>
                        <p className="text-sm text-gray-600">{student.email}</p>
                        {student.department && (
                          <p className="text-xs text-gray-500 mt-1">{student.department}</p>
                        )}
                        <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {isReceived ? 'Awaiting your response' : 'Request sent'}
                        </p>
                        <div className="mt-4 flex gap-2">
                          {isReceived ? (
                            <>
                              <button
                                onClick={() => handleAcceptRequest(student.id)}
                                disabled={loadingAction}
                                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 rounded-lg transition"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectRequest(student.id)}
                                disabled={loadingAction}
                                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-2 rounded-lg transition"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleCancelRequest(student.id)}
                              disabled={loadingAction}
                              className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white py-2 rounded-lg transition"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No pending requests</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Network; 