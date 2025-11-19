import React, { useState, useEffect, useCallback } from 'react';
import { Video, Users, Calendar, Clock, Plus, Phone, VideoOff, Mic, MicOff, Settings, ScreenShare, MessageCircle, X, Search, Send, Edit2, Trash2, ChevronRight, Zap, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import * as videoAPI from '../services/videoAPI';

// Create Meeting Modal Component
const CreateMeetingModalComponent = ({ show, loading, formData, setFormData, categories, onSubmit, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Start Meeting</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
            <input
              type="text"
              placeholder="e.g., React Study Group"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              placeholder="What is this meeting about?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
            <input
              type="number"
              min="2"
              max="500"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">Make this meeting public</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Start Meeting'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Schedule Meeting Modal Component
const ScheduleMeetingModalComponent = ({ show, loading, scheduleData, setScheduleData, categories, onSubmit, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Schedule Meeting</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
            <input
              type="text"
              placeholder="e.g., React Study Group"
              value={scheduleData.title}
              onChange={(e) => setScheduleData({ ...scheduleData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              placeholder="What is this meeting about?"
              value={scheduleData.description}
              onChange={(e) => setScheduleData({ ...scheduleData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={scheduleData.category}
              onChange={(e) => setScheduleData({ ...scheduleData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule For</label>
            <input
              type="datetime-local"
              value={scheduleData.scheduledFor}
              onChange={(e) => setScheduleData({ ...scheduleData, scheduledFor: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
            <input
              type="number"
              min="2"
              max="500"
              value={scheduleData.maxParticipants}
              onChange={(e) => setScheduleData({ ...scheduleData, maxParticipants: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="schedulePublic"
              checked={scheduleData.isPublic}
              onChange={(e) => setScheduleData({ ...scheduleData, isPublic: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="schedulePublic" className="text-sm text-gray-700">Make this meeting public</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Jitsi Meet Component (memoized to prevent unnecessary re-renders)
const JitsiMeetComponent = React.memo(({ meeting, user, onLeave, onEndMeeting }) => {
  const jitsiApiRef = React.useRef(null);

  useEffect(() => {
    // For direct iframe embed, we don't need the external API script
    // Just render the iframe directly
    const container = document.querySelector('#jitsi-container');
    if (container && !container.querySelector('iframe')) {
      const roomUrl = `https://meet.jit.si/${meeting.roomId}#config.disableSimulcast=false&config.startAudioMuted=true&config.startVideoMuted=true&config.enableWelcomePage=false&userInfo.displayName="${encodeURIComponent(user?.displayName || user?.name || 'Anonymous')}"`;
      
      container.innerHTML = `<iframe allow="camera; microphone; display-capture" src="${roomUrl}" style="border: 0; width: 100%; height: 100%;" />`;
    }

    return () => {
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
          jitsiApiRef.current = null;
        } catch (e) {
          console.warn('Error disposing Jitsi API:', e);
        }
      }
    };
  }, [meeting.roomId, user]);

  // Direct iframe embed - no need for External API

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex justify-between items-center bg-gray-900 text-white px-6 py-4">
        <div>
          <h2 className="text-xl font-bold">{meeting.title}</h2>
          <p className="text-sm text-gray-400">{meeting.participantCount} participant{meeting.participantCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          {meeting.hostId === user.id && (
            <button
              onClick={onEndMeeting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold flex items-center transition-colors"
            >
              <Phone className="w-4 h-4 mr-2" />
              End Meeting
            </button>
          )}
          <button
            onClick={onLeave}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded-lg font-semibold flex items-center transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Leave
          </button>
        </div>
      </div>
      <div id="jitsi-container" className="flex-1" />
    </div>
  );
});

JitsiMeetComponent.displayName = 'JitsiMeetComponent';

const VideoMeet = () => {
  const { user } = useUser();
  const [roomId, setRoomId] = useState('');
  const [activeMeetings, setActiveMeetings] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [userMeetings, setUserMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [jitsiActive, setJitsiActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    maxParticipants: 50,
    isPublic: true,
  });
  const [scheduleData, setScheduleData] = useState({
    title: '',
    description: '',
    category: 'General',
    maxParticipants: 50,
    isPublic: true,
    scheduledFor: '',
  });

  const categories = ['General', 'Study Group', 'Project Discussion', 'Workshop', 'Mentoring', 'Collaboration'];

  // Fetch meetings with proper dependencies
  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const [active, upcoming, userHosted] = await Promise.all([
        videoAPI.getActiveMeetings(),
        videoAPI.getUpcomingMeetings(),
        user?.id ? videoAPI.getUserHostedMeetings(user.id) : Promise.resolve([]),
      ]);
      setActiveMeetings(active);
      setUpcomingMeetings(upcoming);
      setUserMeetings(userHosted);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load meetings on mount only
  useEffect(() => {
    if (user?.id) {
      fetchMeetings();
      // Optionally refresh when user joins/creates a meeting
      // Remove the 5-second interval to prevent constant re-renders
    }
  }, [user?.id]); // Only depend on user.id, not fetchMeetings

  const handleCreateMeeting = useCallback(async () => {
    if (!formData.title) {
      alert('Please enter meeting title');
      return;
    }

    try {
      setLoading(true);
      const meeting = await videoAPI.createMeeting(user.id, user.displayName || user.name || 'Anonymous', formData);
      setSelectedMeeting(meeting);
      setJitsiActive(true);
      setShowCreateModal(false);
      setFormData({ title: '', description: '', category: 'General', maxParticipants: 50, isPublic: true });
      await fetchMeetings();
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to create meeting');
    } finally {
      setLoading(false);
    }
  }, [formData, user, fetchMeetings]);

  const handleScheduleMeeting = useCallback(async () => {
    if (!scheduleData.title || !scheduleData.scheduledFor) {
      alert('Please enter meeting title and scheduled time');
      return;
    }

    try {
      setLoading(true);
      const scheduledDate = new Date(scheduleData.scheduledFor);
      await videoAPI.scheduleMeeting(user.id, user.displayName || user.name || 'Anonymous', {
        ...scheduleData,
        scheduledFor: scheduledDate,
      });
      setShowScheduleModal(false);
      setScheduleData({ title: '', description: '', category: 'General', maxParticipants: 50, isPublic: true, scheduledFor: '' });
      await fetchMeetings();
      alert('Meeting scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  }, [scheduleData, user, fetchMeetings]);

  const handleJoinMeeting = async (meeting) => {
    try {
      setLoading(true);
      await videoAPI.joinMeeting(meeting.id, user.id, user.displayName || user.name || 'Anonymous');
      setSelectedMeeting(meeting);
      setJitsiActive(true);
      setShowJoinModal(false);
    } catch (error) {
      console.error('Error joining meeting:', error);
      alert('Failed to join meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveMeeting = async () => {
    try {
      setLoading(true);
      await videoAPI.leaveMeeting(selectedMeeting.id, user.id);
      setJitsiActive(false);
      setSelectedMeeting(null);
      await fetchMeetings();
    } catch (error) {
      console.error('Error leaving meeting:', error);
      alert('Failed to leave meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleEndMeeting = async () => {
    if (confirm('Are you sure you want to end this meeting? All participants will be disconnected.')) {
      try {
        setLoading(true);
        await videoAPI.endMeeting(selectedMeeting.id, user.id);
        setJitsiActive(false);
        setSelectedMeeting(null);
        await fetchMeetings();
      } catch (error) {
        console.error('Error ending meeting:', error);
        alert('Failed to end meeting');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      try {
        setLoading(true);
        await videoAPI.deleteMeeting(meetingId, user.id);
        await fetchMeetings();
      } catch (error) {
        console.error('Error deleting meeting:', error);
        alert('Failed to delete meeting');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (startedAt) => {
    if (!startedAt) return '';
    const start = startedAt.toDate ? startedAt.toDate() : new Date(startedAt);
    const minutes = Math.floor((new Date() - start) / 1000 / 60);
    if (minutes < 1) return 'Just started';
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  };

  // Meeting Card Component
  const MeetingCard = ({ meeting, type, isHost }) => (
    <motion.div 
      className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-xl transition-all border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{meeting.title}</h3>
            {type === 'active' && (
              <motion.div 
                className="w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <p className="text-sm text-gray-600 font-medium mb-2">{meeting.hostName}</p>
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{meeting.description}</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="flex items-center text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
              <Users className="w-3 h-3 mr-1 text-blue-500" />
              {meeting.participantCount}/{meeting.maxParticipants}
            </span>
            <span className="inline-block bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-2 py-1 rounded-lg font-medium">{meeting.category}</span>
            {type === 'upcoming' && (
              <span className="flex items-center text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                <Calendar className="w-3 h-3 mr-1 text-green-500" />
                {formatDate(meeting.scheduledFor)}
              </span>
            )}
            {type === 'active' && (
              <span className="flex items-center text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                <Clock className="w-3 h-3 mr-1 text-orange-500" />
                {formatDuration(meeting.startedAt)}
              </span>
            )}
          </div>
        </div>
        <motion.div 
          className="ml-4 w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
        >
          <Play className="w-6 h-6 text-white" />
        </motion.div>
      </div>
      <div className="flex gap-2">
        <motion.button
          onClick={() => handleJoinMeeting(meeting)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center font-semibold text-sm"
        >
          <Video className="w-4 h-4 mr-2" />
          Join
        </motion.button>
        {isHost && (
          <>
            <motion.button
              onClick={() => {
                setSelectedMeeting(meeting);
                setShowScheduleModal(true);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => handleDeleteMeeting(meeting.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );

  if (!user) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <p className="text-gray-600">Please login to access video meetings</p>
        </div>
      </motion.div>
    );
  }

  if (jitsiActive && selectedMeeting) {
    return <JitsiMeetComponent meeting={selectedMeeting} user={user} onLeave={handleLeaveMeeting} onEndMeeting={handleEndMeeting} />;
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">Video Meet</h1>
              <p className="text-gray-600">Host and join video meetings with your peers</p>
            </div>
            <div className="flex gap-3">
              <motion.button
                onClick={() => setShowScheduleModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:shadow-lg text-white px-6 py-3 rounded-xl font-bold flex items-center transition-all shadow-md"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Schedule
              </motion.button>
              <motion.button
                onClick={() => setShowCreateModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg text-white px-6 py-3 rounded-xl font-bold flex items-center transition-all shadow-md"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start Now
              </motion.button>
            </div>
          </div>

          {/* Search and Filter */}
          <motion.div 
            className="flex gap-4 flex-wrap"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </motion.div>
        </motion.div>

        {/* Active Meetings */}
        {activeMeetings.length > 0 && (
          <motion.div 
            className="mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <motion.div 
                className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full mr-3"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Active Meetings <span className="ml-2 px-2.5 py-0.5 bg-gradient-to-r from-red-100 to-red-200 text-red-800 rounded-full text-sm font-bold">({activeMeetings.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeMeetings
                .filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .filter(m => !selectedCategory || m.category === selectedCategory)
                .map((meeting, idx) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <MeetingCard
                      meeting={meeting}
                      type="active"
                      isHost={meeting.hostId === user.id}
                    />
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Your Meetings */}
        {userMeetings.length > 0 && (
          <motion.div 
            className="mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Meetings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userMeetings.map((meeting, idx) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <MeetingCard
                    meeting={meeting}
                    type={meeting.isActive ? 'active' : 'upcoming'}
                    isHost={true}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Upcoming Meetings */}
        {upcomingMeetings.length > 0 && (
          <motion.div 
            className="mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Meetings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingMeetings
                .filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .filter(m => !selectedCategory || m.category === selectedCategory)
                .map((meeting, idx) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <MeetingCard
                      meeting={meeting}
                      type="upcoming"
                      isHost={meeting.hostId === user.id}
                    />
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {activeMeetings.length === 0 && upcomingMeetings.length === 0 && userMeetings.length === 0 && (
          <motion.div 
            className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No meetings available</h3>
            <p className="text-gray-500 mb-6">Start a meeting or schedule one for later.</p>
            <div className="flex gap-3 justify-center">
              <motion.button
                onClick={() => setShowCreateModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start Meeting
              </motion.button>
              <motion.button
                onClick={() => setShowScheduleModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center font-semibold"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Meeting
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Features */}
        <motion.div 
          className="mt-12 bg-white rounded-2xl shadow-sm p-8 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Meeting Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Video, title: 'HD Video & Audio', desc: 'Crystal clear video and audio quality powered by Jitsi Meet.', color: 'blue' },
              { icon: ScreenShare, title: 'Screen Sharing', desc: 'Share your screen to present slides, code, or documents.', color: 'green' },
              { icon: Users, title: 'Group Meetings', desc: 'Host unlimited participants in high-quality video conferences.', color: 'purple' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className={`flex items-start space-x-4 p-4 rounded-2xl bg-gradient-to-br from-${feature.color}-50 to-transparent`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + idx * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <motion.div 
                  className={`w-12 h-12 bg-gradient-to-br from-${feature.color}-400 to-${feature.color}-600 rounded-xl flex items-center justify-center flex-shrink-0`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <CreateMeetingModalComponent
        show={showCreateModal}
        loading={loading}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        onSubmit={handleCreateMeeting}
        onClose={() => setShowCreateModal(false)}
      />
      <ScheduleMeetingModalComponent
        show={showScheduleModal}
        loading={loading}
        scheduleData={scheduleData}
        setScheduleData={setScheduleData}
        categories={categories}
        onSubmit={handleScheduleMeeting}
        onClose={() => setShowScheduleModal(false)}
      />
    </motion.div>
  );
};

export default VideoMeet;

