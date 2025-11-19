import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Award,
  BookOpen,
  Users,
  MessageCircle,
  ArrowLeft,
  Copy,
  Share2,
  Heart,
  Star,
  TrendingUp,
  Calendar,
  Loader,
  Edit2,
  Save,
  X,
  Camera,
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import leaderboardAPI from '../services/leaderboardAPI';
import resourcesAPI from '../services/resourcesAPI';
import groupsAPI from '../services/groupsAPI';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import authAPI from '../services/firebaseAuth';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useUser();

  const [userData, setUserData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userResources, setUserResources] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: '',
    photoURL: '',
    department: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user stats and ranking
        const stats = await leaderboardAPI.getUserRankAndStats(userId);
        if (!stats) {
          setError('User not found');
          setLoading(false);
          return;
        }

        setUserStats(stats);
        setUserData(stats);

        // Fetch user's resources
        const resourcesResult = await resourcesAPI.getAllResources();
        if (resourcesResult.ok) {
          const filtered = resourcesResult.resources.filter(r => r.ownerId === userId);
          setUserResources(filtered);
        }

        // Fetch user's groups
        const groupsResult = await groupsAPI.getAllGroups();
        if (groupsResult.ok) {
          const filtered = groupsResult.groups.filter(g => g.members?.includes(userId));
          setUserGroups(filtered);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleCopyProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${userId}`;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${userId}`;
    if (navigator.share) {
      navigator.share({
        title: `${userData?.displayName}'s Profile`,
        text: `Check out ${userData?.displayName}'s profile on PeerIQ!`,
        url: profileUrl,
      });
    }
  };

  const handleEditClick = () => {
    setEditData({
      displayName: userData.displayName || '',
      photoURL: userData.photoURL || '',
      department: userData.department || '',
    });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!editData.displayName.trim()) {
      alert('Display name cannot be empty');
      return;
    }

    try {
      setSavingProfile(true);
      const userRef = doc(db, 'users', userId);

      await updateDoc(userRef, {
        displayName: editData.displayName,
        photoURL: editData.photoURL,
        department: editData.department,
      });

      // Update user data
      setUserData(prev => ({
        ...prev,
        displayName: editData.displayName,
        photoURL: editData.photoURL,
        department: editData.department,
      }));

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-red-600 text-lg">{error || 'User profile not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16">
              <div className="relative">
                <img
                  src={userData.photoURL || 'https://via.placeholder.com/128'}
                  alt={userData.displayName}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                    <Camera className="w-4 h-4" />
                    <input
                      type="text"
                      name="photoURL"
                      placeholder="Photo URL"
                      value={editData.photoURL}
                      onChange={handleEditChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="mt-4 sm:mt-0 flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                      <input
                        type="text"
                        name="displayName"
                        value={editData.displayName}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        name="department"
                        value={editData.department}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                      <input
                        type="text"
                        name="photoURL"
                        value={editData.photoURL}
                        onChange={handleEditChange}
                        placeholder="https://example.com/photo.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {savingProfile ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{userData.displayName}</h1>
                      <p className="text-gray-600 flex items-center mt-1">
                        <Mail className="w-4 h-4 mr-2" />
                        {userData.email}
                      </p>
                      {userData.department && (
                        <p className="text-gray-600 mt-1">{userData.department}</p>
                      )}
                    </div>
                    {!isOwnProfile ? (
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Message
                        </button>
                        <button className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300">
                          Connect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleEditClick}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rank</p>
                <p className="text-3xl font-bold text-purple-600">#{userStats?.rank || 'N/A'}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Points</p>
                <p className="text-3xl font-bold text-blue-600">{userStats?.points || 0}</p>
              </div>
              <Star className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Resources</p>
                <p className="text-3xl font-bold text-green-600">{userStats?.contributions?.resources || 0}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Groups</p>
                <p className="text-3xl font-bold text-orange-600">{userStats?.contributions?.groups || 0}</p>
              </div>
              <Users className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </div>
        </div>

        {/* Badges Section */}
        {userData.badges && userData.badges.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Badges & Achievements
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userData.badges.map((badge, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 hover:shadow-md transition"
                >
                  <Award className="w-8 h-8 text-yellow-600 mb-2" />
                  <p className="text-sm font-semibold text-gray-900 text-center">{badge}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contributions Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Resources */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              Resources ({userResources.length})
            </h2>
            {userResources.length > 0 ? (
              <div className="space-y-3">
                {userResources.slice(0, 5).map(resource => (
                  <div key={resource.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition">
                    <h3 className="font-semibold text-gray-900 text-sm">{resource.title}</h3>
                    <p className="text-gray-600 text-xs mt-1">
                      {resource.downloads || 0} downloads • {resource.ratings?.length || 0} ratings
                    </p>
                  </div>
                ))}
                {userResources.length > 5 && (
                  <p className="text-center text-blue-600 text-sm pt-2">
                    +{userResources.length - 5} more resources
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No resources shared yet</p>
            )}
          </div>

          {/* Groups */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              Groups ({userGroups.length})
            </h2>
            {userGroups.length > 0 ? (
              <div className="space-y-3">
                {userGroups.slice(0, 5).map(group => (
                  <div key={group.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition">
                    <h3 className="font-semibold text-gray-900 text-sm">{group.name}</h3>
                    <p className="text-gray-600 text-xs mt-1">
                      {group.members?.length || 0} members
                    </p>
                  </div>
                ))}
                {userGroups.length > 5 && (
                  <p className="text-center text-green-600 text-sm pt-2">
                    +{userGroups.length - 5} more groups
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Not a member of any groups yet</p>
            )}
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Share Profile</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={`${window.location.origin}/profile/${userId}`}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
              />
            </div>
            <button
              onClick={handleCopyProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center whitespace-nowrap"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            {navigator.share && (
              <button
                onClick={handleShareProfile}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center whitespace-nowrap"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
