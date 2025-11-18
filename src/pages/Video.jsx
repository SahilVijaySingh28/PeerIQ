import React, { useState } from 'react';
import { Video, Users, Calendar, Clock, Plus, Phone, VideoOff, Mic, MicOff, Settings, ScreenShare, MessageCircle } from 'lucide-react';

const VideoMeet = () => {
  const [roomId, setRoomId] = useState('');
  const [activeMeetings, setActiveMeetings] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);

  // Mock data for meetings
  const mockUpcomingMeetings = [
    {
      id: 1,
      title: 'React Study Session',
      host: 'Alex Johnson',
      scheduledTime: '2024-01-15T15:00:00',
      participants: 8,
      description: 'Weekly React study group meeting'
    },
    {
      id: 2,
      title: 'Machine Learning Discussion',
      host: 'Sarah Chen',
      scheduledTime: '2024-01-16T14:00:00',
      participants: 12,
      description: 'Discussing ML algorithms and projects'
    },
    {
      id: 3,
      title: 'Database Design Workshop',
      host: 'Michael Rodriguez',
      scheduledTime: '2024-01-17T16:00:00',
      participants: 6,
      description: 'Learning database design principles'
    }
  ];

  const mockActiveMeetings = [
    {
      id: 4,
      title: 'Web Development Bootcamp',
      host: 'Emma Wilson',
      participants: 25,
      startedAt: '2024-01-14T10:00:00'
    }
  ];

  const handleCreateMeeting = () => {
    const newRoomId = Math.random().toString(36).substring(7);
    setRoomId(newRoomId);
    // In a real app, this would create a meeting room
    alert(`Meeting room created: ${newRoomId}`);
  };

  const handleJoinMeeting = (meetingId) => {
    // In a real app, this would join the Jitsi Meet room
    alert(`Joining meeting: ${meetingId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const MeetingCard = ({ meeting, type }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{meeting.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{meeting.description || `Hosted by ${meeting.host}`}</p>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {meeting.participants} participants
            </span>
            {type === 'upcoming' && (
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(meeting.scheduledTime)}
              </span>
            )}
          </div>
        </div>
        <div className="ml-4">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <Video className="w-6 h-6 text-primary-600" />
          </div>
        </div>
      </div>
      <button
        onClick={() => handleJoinMeeting(meeting.id)}
        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
      >
        <Video className="w-4 h-4 mr-2" />
        {type === 'active' ? 'Join Meeting' : 'Join Now'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Meet</h1>
              <p className="text-gray-600">Join or create video meetings with your peers</p>
            </div>
            <button
              onClick={handleCreateMeeting}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Meeting
            </button>
          </div>
        </div>

        {/* Quick Join */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Join</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter meeting room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => handleJoinMeeting(roomId)}
              disabled={!roomId}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <Video className="w-5 h-5 mr-2" />
              Join
            </button>
          </div>
        </div>

        {/* Active Meetings */}
        {mockActiveMeetings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              Active Meetings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockActiveMeetings.map(meeting => (
                <MeetingCard key={meeting.id} meeting={meeting} type="active" />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Meetings */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upcoming Meetings</h2>
          {mockUpcomingMeetings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockUpcomingMeetings.map(meeting => (
                <MeetingCard key={meeting.id} meeting={meeting} type="upcoming" />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming meetings</h3>
              <p className="text-gray-500 mb-4">Create a new meeting or join an existing one.</p>
              <button
                onClick={handleCreateMeeting}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Create Meeting
              </button>
            </div>
          )}
        </div>

        {/* Meeting Features Info */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Meeting Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">HD Video & Audio</h3>
                <p className="text-sm text-gray-600">Crystal clear video and audio quality for seamless communication.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ScreenShare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Screen Sharing</h3>
                <p className="text-sm text-gray-600">Share your screen to present slides, code, or documents.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Chat & Collaboration</h3>
                <p className="text-sm text-gray-600">Chat with participants and collaborate in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoMeet;

