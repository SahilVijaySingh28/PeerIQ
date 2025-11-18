import React, { useState } from 'react';
import { Trophy, Medal, Award, TrendingUp, Users, Star, Heart, Upload, MessageCircle, HelpCircle } from 'lucide-react';

const Leaderboard = () => {
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock data for leaderboard
  const mockLeaderboard = [
    {
      id: 1,
      name: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      points: 2845,
      rank: 1,
      badges: ['Top Contributor', 'Mentor'],
      contributions: {
        resources: 45,
        answers: 123,
        helpful: 89
      },
      department: 'Computer Science',
      change: '+12'
    },
    {
      id: 2,
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      points: 2678,
      rank: 2,
      badges: ['Resource Master', 'Helper'],
      contributions: {
        resources: 38,
        answers: 98,
        helpful: 76
      },
      department: 'Data Science',
      change: '+8'
    },
    {
      id: 3,
      name: 'Michael Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      points: 2456,
      rank: 3,
      badges: ['Expert', 'Collaborator'],
      contributions: {
        resources: 32,
        answers: 87,
        helpful: 65
      },
      department: 'Computer Science',
      change: '+15'
    },
    {
      id: 4,
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      points: 2234,
      rank: 4,
      badges: ['Contributor'],
      contributions: {
        resources: 28,
        answers: 72,
        helpful: 54
      },
      department: 'Information Technology',
      change: '+5'
    },
    {
      id: 5,
      name: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      points: 1987,
      rank: 5,
      badges: ['Helper'],
      contributions: {
        resources: 24,
        answers: 65,
        helpful: 48
      },
      department: 'Computer Science',
      change: '-3'
    },
    {
      id: 6,
      name: 'You',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      points: 1234,
      rank: 15,
      badges: ['Rising Star'],
      contributions: {
        resources: 12,
        answers: 34,
        helpful: 28
      },
      department: 'Computer Science',
      change: '+20'
    }
  ];

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-500" />;
    return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200';
    if (rank === 2) return 'bg-gray-50 border-gray-200';
    if (rank === 3) return 'bg-orange-50 border-orange-200';
    if (rank === 15) return 'bg-blue-50 border-blue-200'; // Current user
    return 'bg-white border-gray-200';
  };

  const LeaderboardCard = ({ user }) => (
    <div className={`rounded-lg border-2 p-6 ${getRankColor(user.rank)} ${user.rank === 15 ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {getRankIcon(user.rank)}
        </div>
        <div className="flex-shrink-0">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              {user.name}
              {user.rank === 15 && (
                <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">You</span>
              )}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary-600">{user.points.toLocaleString()}</span>
              <span className="text-sm text-gray-500">pts</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 mb-3">
            <span className="text-sm text-gray-600">{user.department}</span>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">{user.change}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {user.badges.map((badge, index) => (
              <span key={index} className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                {badge}
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Upload className="w-4 h-4 mr-1" />
              {user.contributions.resources} resources
            </span>
            <span className="flex items-center">
              <HelpCircle className="w-4 h-4 mr-1" />
              {user.contributions.answers} answers
            </span>
            <span className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              {user.contributions.helpful} helpful
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
                Leaderboard
              </h1>
              <p className="text-gray-600">See who's contributing the most to the community</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all-time">All Time</option>
                <option value="monthly">This Month</option>
                <option value="weekly">This Week</option>
                <option value="daily">Today</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Data Science">Data Science</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {mockLeaderboard.slice(1, 4).map(user => (
            <div key={user.id} className="text-center">
              <div className={`rounded-lg border-2 p-6 ${getRankColor(user.rank)}`}>
                <div className="mb-4">
                  {getRankIcon(user.rank)}
                </div>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{user.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{user.department}</p>
                <div className="text-2xl font-bold text-primary-600 mb-2">{user.points.toLocaleString()} pts</div>
                <div className="flex justify-center space-x-2">
                  {user.badges.map((badge, index) => (
                    <span key={index} className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full Leaderboard */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Full Leaderboard</h2>
          <div className="space-y-4">
            {mockLeaderboard.map(user => (
              <LeaderboardCard key={user.id} user={user} />
            ))}
          </div>
        </div>

        {/* How Points Work */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How Points Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Upload Resources</h3>
                <p className="text-sm text-gray-600">+10 points per resource uploaded</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Answer Questions</h3>
                <p className="text-sm text-gray-600">+5 points per answer, +2 for helpful votes</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Help Others</h3>
                <p className="text-sm text-gray-600">+3 points when your answer is marked helpful</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

