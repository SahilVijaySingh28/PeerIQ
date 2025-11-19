import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Users, Star, Heart, Upload, MessageCircle, HelpCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import leaderboardAPI from '../services/leaderboardAPI';
import { useUser } from '../contexts/UserContext';

const Leaderboard = () => {
  const { user } = useUser();
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch departments
        const depts = await leaderboardAPI.getDepartments();
        setDepartments(depts);

        // Fetch leaderboard based on filters
        let data;
        if (categoryFilter !== 'all') {
          data = await leaderboardAPI.getLeaderboardByCategory(categoryFilter);
        } else {
          data = await leaderboardAPI.getLeaderboardByTimePeriod(timeFilter);
        }

        setLeaderboard(data);

        // Fetch current user stats
        if (user?.id) {
          const stats = await leaderboardAPI.getUserRankAndStats(user.id);
          setUserStats(stats);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setError('Failed to load leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeFilter, categoryFilter, user?.id]);

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
    if (userStats?.id === user?.id && userStats?.rank === rank) return 'bg-blue-50 border-blue-200'; // Current user
    return 'bg-white border-gray-200';
  };

  const LeaderboardCard = ({ userItem }) => (
    <div className={`rounded-lg border-2 p-6 ${getRankColor(userItem.rank)} ${userStats?.id === user?.id && userStats?.id === userItem.id ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {getRankIcon(userItem.rank)}
        </div>
        <div className="flex-shrink-0">
          <Link to={`/profile/${userItem.id}`}>
            <img
              src={userItem.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userItem.displayName || 'User')}`}
              alt={userItem.displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md hover:opacity-80 transition"
            />
          </Link>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Link 
                  to={`/profile/${userItem.id}`}
                  className="hover:text-blue-600 transition"
                >
                  {userItem.displayName}
                </Link>
                {userStats?.id === user?.id && userStats?.id === userItem.id && (
                  <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">You</span>
                )}
              </h3>
              <p className="text-sm text-gray-600">{userItem.email}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary-600">{userItem.points.toLocaleString()}</span>
              <span className="text-sm text-gray-500">pts</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              {userItem.department && (
                <span className="text-sm text-gray-600">{userItem.department}</span>
              )}
              <div className="flex flex-wrap gap-2">
                {userItem.badges && userItem.badges.length > 0 ? (
                  userItem.badges.slice(0, 3).map((badge, index) => (
                    <span key={index} className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                      {badge}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">No badges yet</span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                <span className="flex items-center">
                  <Upload className="w-4 h-4 mr-1" />
                  {userItem.contributions?.resources || 0} resources
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {userItem.contributions?.groups || 0} groups
                </span>
                <span className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {userItem.contributions?.announcements || 0} announcements
                </span>
              </div>
            </div>
            <Link 
              to={`/profile/${userItem.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
              View Profile
            </Link>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 text-center">
            <p className="text-gray-600">No users found for the selected filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {leaderboard.slice(0, 3).map(userItem => (
              <div key={userItem.id} className="text-center">
                <div className={`rounded-lg border-2 p-6 ${getRankColor(userItem.rank)}`}>
                  <div className="mb-4">
                    {getRankIcon(userItem.rank)}
                  </div>
                  <Link to={`/profile/${userItem.id}`}>
                    <img
                      src={userItem.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userItem.displayName || 'User')}`}
                      alt={userItem.displayName}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg mx-auto mb-4 hover:opacity-80 transition"
                    />
                  </Link>
                  <Link 
                    to={`/profile/${userItem.id}`}
                    className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 transition"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{userItem.displayName}</h3>
                  </Link>
                  {userItem.department && (
                    <p className="text-sm text-gray-600 mb-2">{userItem.department}</p>
                  )}
                  <div className="text-2xl font-bold text-primary-600 mb-2">{userItem.points.toLocaleString()} pts</div>
                  <div className="flex justify-center space-x-2 flex-wrap gap-2 mb-3">
                    {userItem.badges && userItem.badges.length > 0 ? (
                      userItem.badges.slice(0, 2).map((badge, index) => (
                        <span key={index} className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                          {badge}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">No badges yet</span>
                    )}
                  </div>
                  <div className="flex justify-center space-x-3 text-xs text-gray-600 mt-2">
                    <span className="flex items-center">
                      <Upload className="w-3 h-3 mr-1" />
                      {userItem.contributions?.resources || 0}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {userItem.contributions?.groups || 0}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      {userItem.contributions?.announcements || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Full Leaderboard</h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No users found for the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map(userItem => (
                <LeaderboardCard key={userItem.id} userItem={userItem} />
              ))}
            </div>
          )}
        </div>

        {/* How Points Work */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How Points Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Upload Resources</h3>
                <p className="text-sm text-gray-600">+10 points per resource uploaded</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Join Groups</h3>
                <p className="text-sm text-gray-600">+5 points per group membership</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Post Announcements</h3>
                <p className="text-sm text-gray-600">+8 points per announcement</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Get Ratings</h3>
                <p className="text-sm text-gray-600">+2 points per rating received</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Engagement Bonuses</h3>
                <p className="text-sm text-gray-600">+1 like, +2 comments on announcements</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Earn Badges</h3>
                <p className="text-sm text-gray-600">Unlock special badges as you contribute</p>
              </div>
            </div>
          </div>

          {/* User's Current Stats */}
          {user && userStats && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{userStats.points}</p>
                  <p className="text-sm text-gray-600">Total Points</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">#{userStats.rank}</p>
                  <p className="text-sm text-gray-600">Your Rank</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{userStats.contributions?.resources || 0}</p>
                  <p className="text-sm text-gray-600">Resources</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">{userStats.contributions?.announcements || 0}</p>
                  <p className="text-sm text-gray-600">Announcements</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

