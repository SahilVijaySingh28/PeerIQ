import React, { useState, useEffect, useCallback } from 'react';
import { Search, Users, Plus, Calendar, MessageCircle, UserPlus, BookOpen, X, Trash2, LogOut, Heart, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import groupsAPI from '../services/groupsAPI';
import engagementAPI from '../services/engagementAPI';

const Groups = () => {
  const { user } = useUser();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    category: '',
    maxMembers: 50,
    topics: '',
    isPublic: true,
  });

  // Load groups on mount
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    const result = await groupsAPI.getAllGroups();
    if (result.ok) {
      setGroups(result.groups);
    }
    setLoading(false);
  };

  // Filter and display groups
  const filteredGroups = groups.filter(group => {
    const matchesSearch = 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.topics && group.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = filterCategory === 'all' || group.category === filterCategory;
    
    const isMember = group.members?.includes(user?.id);
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'my-groups' && isMember) ||
      (activeTab === 'public' && group.isPublic && !isMember);
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleCreateGroupChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setGroupData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleCreateGroup = async () => {
    if (!groupData.name || !groupData.description || !groupData.category) {
      alert('Please fill in all required fields');
      return;
    }

    if (!user?.id) {
      alert('You must be logged in to create a group');
      return;
    }

    const topics = groupData.topics.split(',').map(tag => tag.trim()).filter(tag => tag);

    const result = await groupsAPI.createGroup(
      {
        name: groupData.name,
        description: groupData.description,
        category: groupData.category,
        maxMembers: parseInt(groupData.maxMembers),
        topics,
        isPublic: groupData.isPublic,
        creatorName: user.displayName || user.email,
      },
      user.id
    );

    if (result.ok) {
      alert('Group created successfully!');
      setGroups([result, ...groups]);
      setShowCreateModal(false);
      setGroupData({
        name: '',
        description: '',
        category: '',
        maxMembers: 50,
        topics: '',
        isPublic: true,
      });
    } else {
      alert(result.error || 'Failed to create group');
    }
  };

  const handleJoinGroup = async (groupId) => {
    if (!user?.id) {
      alert('You must be logged in to join a group');
      return;
    }

    const result = await groupsAPI.joinGroup(groupId, user.id);
    if (result.ok) {
      alert('Successfully joined the group!');
      loadGroups();
    } else {
      alert(result.error || 'Failed to join group');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;

    if (!user?.id) {
      alert('You must be logged in');
      return;
    }

    const result = await groupsAPI.leaveGroup(groupId, user.id);
    if (result.ok) {
      alert('Successfully left the group!');
      loadGroups();
    } else {
      alert(result.error || 'Failed to leave group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;

    if (!user?.id) {
      alert('You must be logged in');
      return;
    }

    const result = await groupsAPI.deleteGroup(groupId, user.id);
    if (result.ok) {
      alert('Group deleted successfully!');
      setGroups(groups.filter(g => g.id !== groupId));
    } else {
      alert(result.error || 'Failed to delete group');
    }
  };

  const GroupCard = ({ group }) => {
    const isMember = group.members?.includes(user?.id);
    const isCreator = group.creatorId === user?.id;

    return (
      <motion.div 
        className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
      >
        <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden">
          <img
            src={group.avatar || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop'}
            alt={group.name}
            className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
          />
          <motion.div 
            className="absolute top-2 right-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {group.isPublic ? (
              <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">Public</span>
            ) : (
              <span className="bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">Private</span>
            )}
          </motion.div>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
            <motion.span 
              className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full font-semibold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              {group.category}
            </motion.span>
          </div>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {group.topics && group.topics.slice(0, 3).map((topic, index) => (
              <motion.span 
                key={index} 
                className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-full font-medium"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15 + index * 0.05 }}
              >
                {topic}
              </motion.span>
            ))}
          </div>

          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              <span className="font-medium">{group.members?.length || 0} / {group.maxMembers} members</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              Created by <span className="font-medium ml-1">{group.creatorName}</span>
            </div>
          </div>

          <div className="flex space-x-2">
            {isMember ? (
              <>
                <motion.button 
                  onClick={() => setSelectedGroup(group)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all text-sm flex items-center justify-center font-semibold"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Open Group
                </motion.button>
                {!isCreator && (
                  <motion.button
                    onClick={() => handleLeaveGroup(group.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all text-sm font-semibold"
                    title="Leave group"
                  >
                    <LogOut className="w-4 h-4" />
                  </motion.button>
                )}
                {isCreator && (
                  <motion.button
                    onClick={() => handleDeleteGroup(group.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all text-sm font-semibold"
                    title="Delete group"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
              </>
            ) : (
              <motion.button
                onClick={() => handleJoinGroup(group.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all text-sm flex items-center justify-center font-semibold"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Join Group
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div 
        className="bg-white border-b sticky top-0 z-10 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Study Groups</h1>
              <p className="text-gray-600 mt-1">Join or create study groups to collaborate with peers</p>
            </div>
            <motion.button 
              onClick={() => setShowCreateModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg text-white px-6 py-3 rounded-xl font-bold flex items-center transition-all shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Group
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tabs */}
        <motion.div 
          className="bg-white rounded-2xl shadow-sm mb-6 border border-gray-100"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="border-b-2 border-gray-100">
            <nav className="flex space-x-8 px-6">
              <motion.button
                whileHover={{ textShadow: '0px 0px 8px rgba(59, 130, 246, 0.5)' }}
                onClick={() => setActiveTab('all')}
                className={`py-4 px-1 border-b-4 font-medium text-sm transition-all ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Groups
              </motion.button>
              <motion.button
                whileHover={{ textShadow: '0px 0px 8px rgba(59, 130, 246, 0.5)' }}
                onClick={() => setActiveTab('my-groups')}
                className={`py-4 px-1 border-b-4 font-medium text-sm transition-all ${
                  activeTab === 'my-groups'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Groups
              </motion.button>
              <motion.button
                whileHover={{ textShadow: '0px 0px 8px rgba(59, 130, 246, 0.5)' }}
                onClick={() => setActiveTab('public')}
                className={`py-4 px-1 border-b-4 font-medium text-sm transition-all ${
                  activeTab === 'public'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Public Groups
              </motion.button>
            </nav>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-gray-200"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search groups by name, description, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="all">All Categories</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Data Science">Data Science</option>
              <option value="Information Technology">Information Technology</option>
            </select>
          </div>
        </motion.div>

        {/* Groups Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {filteredGroups.length} Groups Found
            </h2>
          </div>
          
          {loading ? (
            <motion.div 
              className="flex items-center justify-center h-96"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div 
                className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          ) : filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group, idx) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <GroupCard group={group} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No groups found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </motion.div>
          )}
        </motion.div>

        {showCreateModal && (
          <CreateGroupModalComponent 
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            groupData={groupData}
            onGroupChange={handleCreateGroupChange}
            onCreate={handleCreateGroup}
          />
        )}

        {selectedGroup && (
          <GroupDetailsModal
            group={selectedGroup}
            onClose={() => setSelectedGroup(null)}
            user={user}
          />
        )}
      </div>
    </div>
  );
};

// Group Details Modal Component
const GroupDetailsModal = ({ group, onClose, user }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [likedAnnouncements, setLikedAnnouncements] = useState(new Set());
  const [likedComments, setLikedComments] = useState({});

  const isCreator = group.creatorId === user?.id;

  useEffect(() => {
    loadGroupContent();
  }, []);

  const loadGroupContent = async () => {
    setLoadingContent(true);
    
    // Load announcements
    const announcementsResult = await groupsAPI.getGroupAnnouncements(group.id);
    if (announcementsResult.ok) {
      setAnnouncements(announcementsResult.announcements);
      // Initialize liked announcements
      const userLiked = new Set();
      announcementsResult.announcements.forEach(ann => {
        if (ann.likes?.includes(user?.id)) {
          userLiked.add(ann.id);
        }
      });
      setLikedAnnouncements(userLiked);
    }

    // Load members
    const membersResult = await groupsAPI.getGroupMembers(group.id);
    if (membersResult.ok) {
      setMembers(membersResult.members);
    }

    setLoadingContent(false);
  };

  const handlePostAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setPostingAnnouncement(true);
    const result = await groupsAPI.postAnnouncement(
      group.id,
      user.id,
      user.displayName || user.email,
      announcementTitle,
      announcementContent
    );

    if (result.ok) {
      setAnnouncements([result, ...announcements]);
      setAnnouncementTitle('');
      setAnnouncementContent('');
      alert('Announcement posted successfully!');
    } else {
      alert(result.error || 'Failed to post announcement');
    }
    setPostingAnnouncement(false);
  };

  const handleKickMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    const result = await groupsAPI.removeMember(group.id, memberId, user.id);
    if (result.ok) {
      setMembers(members.filter(m => m.id !== memberId));
      alert('Member removed successfully!');
    } else {
      alert(result.error || 'Failed to remove member');
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    const result = await groupsAPI.deleteAnnouncement(announcementId, user.id, group.id);
    if (result.ok) {
      setAnnouncements(announcements.filter(a => a.id !== announcementId));
      alert('Announcement deleted!');
    } else {
      alert(result.error || 'Failed to delete announcement');
    }
  };

  const handleToggleAnnouncementLike = async (announcementId) => {
    const result = await engagementAPI.toggleAnnouncementLike(announcementId, user.id);
    if (result.ok) {
      const newLiked = new Set(likedAnnouncements);
      if (result.liked) {
        newLiked.add(announcementId);
      } else {
        newLiked.delete(announcementId);
      }
      setLikedAnnouncements(newLiked);
      loadGroupContent();
    }
  };

  const handleAddComment = async (announcementId) => {
    if (!commentText[announcementId]?.trim()) return;

    const result = await engagementAPI.addAnnouncementComment(
      announcementId,
      user.id,
      user.displayName || user.email,
      commentText[announcementId]
    );

    if (result.ok) {
      setCommentText(prev => ({ ...prev, [announcementId]: '' }));
      loadGroupContent();
    } else {
      alert(result.error || 'Failed to add comment');
    }
  };

  const handleToggleCommentLike = async (announcementId, commentId) => {
    const result = await engagementAPI.toggleAnnouncementCommentLike(announcementId, commentId, user.id);
    if (result.ok) {
      const key = `${announcementId}-${commentId}`;
      const newLiked = { ...likedComments };
      newLiked[key] = result.liked;
      setLikedComments(newLiked);
      loadGroupContent();
    }
  };

  const handleDeleteComment = async (announcementId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    const result = await engagementAPI.deleteAnnouncementComment(announcementId, commentId);
    if (result.ok) {
      loadGroupContent();
    } else {
      alert(result.error || 'Failed to delete comment');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold">{group.name}</h2>
              <p className="mt-2 text-blue-100">{group.description}</p>
              {isCreator && <span className="inline-block mt-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">👑 Creator</span>}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-white px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Members
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'announcements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Announcements
            </button>
            {isCreator && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'admin'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Admin Panel
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold text-gray-900">{group.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Members</p>
                  <p className="font-semibold text-gray-900">{group.members?.length || 0} / {group.maxMembers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-gray-900">{group.isPublic ? '🌐 Public' : '🔒 Private'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Creator</p>
                  <p className="font-semibold text-gray-900">{group.creatorName}</p>
                </div>
              </div>

              {group.topics && group.topics.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {group.topics.map((topic, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Members ({members.length})
              </h3>
              {loadingContent ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : members.length > 0 ? (
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img src={member.avatar} alt={member.displayName || member.name} className="w-10 h-10 rounded-full" />
                        <div>
                          <Link 
                            to={`/profile/${member.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600 transition"
                          >
                            <p>{member.displayName || member.name}</p>
                          </Link>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {member.isCreator && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Creator</span>}
                        {isCreator && !member.isCreator && (
                          <button
                            onClick={() => handleKickMember(member.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No members yet</p>
              )}
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Announcements ({announcements.length})</h3>
              
              {announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{announcement.title}</p>
                          <p className="text-sm text-gray-600">By {announcement.authorName}</p>
                        </div>
                        {(isCreator || announcement.authorId === user.id) && (
                          <button
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 mt-2">{announcement.content}</p>
                      <div className="mt-4 flex items-center space-x-4 text-sm">
                        <button
                          onClick={() => handleToggleAnnouncementLike(announcement.id)}
                          disabled={likedAnnouncements.has(announcement.id)}
                          className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                            likedAnnouncements.has(announcement.id)
                              ? 'bg-red-100 text-red-700 cursor-not-allowed opacity-75'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Heart className={`w-4 h-4 mr-1 ${likedAnnouncements.has(announcement.id) ? 'fill-current' : ''}`} />
                          {announcement.likes?.length || 0}
                        </button>
                        <button
                          onClick={() => setExpandedComments(prev => ({ ...prev, [announcement.id]: !prev[announcement.id] }))}
                          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {announcement.comments?.length || 0}
                        </button>
                      </div>

                      {/* Comments Section */}
                      {expandedComments[announcement.id] && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                            {announcement.comments && announcement.comments.length > 0 ? (
                              announcement.comments.map(comment => (
                                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <Link 
                                        to={`/profile/${comment.userId}`}
                                        className="font-semibold text-gray-900 hover:text-blue-600 transition text-sm"
                                      >
                                        {comment.userName}
                                      </Link>
                                      <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
                                      <div className="mt-2 flex items-center space-x-2 text-xs">
                                        <button
                                          onClick={() => handleToggleCommentLike(announcement.id, comment.id)}
                                          className={`flex items-center px-2 py-1 rounded transition-colors ${
                                            likedComments[`${announcement.id}-${comment.id}`]
                                              ? 'bg-red-100 text-red-600'
                                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                          }`}
                                        >
                                          <Heart className={`w-3 h-3 mr-1 ${likedComments[`${announcement.id}-${comment.id}`] ? 'fill-current' : ''}`} />
                                          {comment.likes?.length || 0}
                                        </button>
                                        {user?.id === comment.userId && (
                                          <button
                                            onClick={() => handleDeleteComment(announcement.id, comment.id)}
                                            className="text-red-600 hover:text-red-700"
                                          >
                                            Delete
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-600 text-sm">No comments yet</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={commentText[announcement.id] || ''}
                              onChange={(e) => setCommentText(prev => ({ ...prev, [announcement.id]: e.target.value }))}
                              placeholder="Add a comment..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => handleAddComment(announcement.id)}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No announcements yet</p>
              )}
            </div>
          )}

          {/* Admin Panel Tab */}
          {activeTab === 'admin' && isCreator && (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📢 Post New Announcement</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      placeholder="e.g., Important Update, Meeting Schedule..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                    <textarea
                      value={announcementContent}
                      onChange={(e) => setAnnouncementContent(e.target.value)}
                      placeholder="Write your announcement here..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
                    />
                  </div>

                  <button
                    onClick={handlePostAnnouncement}
                    disabled={postingAnnouncement}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    {postingAnnouncement ? 'Posting...' : '📤 Post Announcement'}
                  </button>
                </div>
              </div>

              <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">👥 Member Management</h3>
                <div className="space-y-2">
                  {members.filter(m => !m.isCreator).map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div>
                        <Link 
                          to={`/profile/${member.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600 transition"
                        >
                          {member.displayName || member.name}
                        </Link>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                      <button
                        onClick={() => handleKickMember(member.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Kick
                      </button>
                    </div>
                  ))}
                </div>
                {members.filter(m => !m.isCreator).length === 0 && (
                  <p className="text-gray-600 text-center py-4">No members to manage</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Separate CreateGroupModal Component to prevent re-renders
const CreateGroupModalComponent = ({ 
  isOpen, 
  onClose, 
  groupData, 
  onGroupChange, 
  onCreate 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Group</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
            <input
              type="text"
              name="name"
              value={groupData.name}
              onChange={onGroupChange}
              placeholder="e.g., React Study Group"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              value={groupData.description}
              onChange={onGroupChange}
              placeholder="Describe your study group..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                name="category"
                value={groupData.category}
                onChange={onGroupChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Data Science">Data Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Business">Business</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Members</label>
              <input
                type="number"
                name="maxMembers"
                value={groupData.maxMembers}
                onChange={onGroupChange}
                min="2"
                max="500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topics (comma separated)</label>
            <input
              type="text"
              name="topics"
              value={groupData.topics}
              onChange={onGroupChange}
              placeholder="e.g., React, JavaScript, Frontend"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPublic"
              checked={groupData.isPublic}
              onChange={onGroupChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label className="ml-3 text-sm font-medium text-gray-700">
              Make this group public (anyone can discover and join)
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Groups;

