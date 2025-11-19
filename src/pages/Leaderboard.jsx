import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Users, Star, Heart, Upload, MessageCircle, HelpCircle, Loader, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div 
        className="bg-white border-b sticky top-0 z-10 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-black bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">Leaderboard</h1>
          <p className="text-gray-600 mt-1">See top contributors and track your rank in the community</p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-3">
            <motion.div 
              className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Leaderboard</h1>
          </div>
          <p className="text-gray-600 text-lg">Celebrating our top contributors and community champions</p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Time Period</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-semibold bg-white"
              >
                <option value="all-time">🏆 All Time</option>
                <option value="monthly">📅 This Month</option>
                <option value="weekly">📊 This Week</option>
                <option value="daily">⚡ Today</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Department</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-semibold bg-white"
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
        </motion.div>

        {/* Top 3 Podium */}
        {loading ? (
          <motion.div 
            className="flex justify-center items-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        ) : error ? (
          <motion.div 
            className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-red-800 font-semibold">{error}</p>
          </motion.div>
        ) : leaderboard.length === 0 ? (
          <motion.div 
            className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 mb-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-600 font-semibold">No users found for the selected filters.</p>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {leaderboard.slice(0, 3).map((userItem, idx) => {
              const podiumHeights = ['h-72', 'h-80', 'h-64'];
              const podiumColors = [
                'from-yellow-300 to-yellow-500',
                'from-gray-300 to-gray-500', 
                'from-orange-300 to-orange-500'
              ];
              return (
                <motion.div 
                  key={userItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="flex flex-col"
                >
                  <motion.div 
                    className={`bg-gradient-to-b ${podiumColors[idx]} rounded-t-2xl p-8 text-center flex-1 flex flex-col items-center justify-center shadow-lg`}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: idx * 0.3 }}
                  >
                    <motion.div 
                      className="text-6xl font-black text-white mb-4"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      #{userItem.rank}
                    </motion.div>
                    <Link to={`/profile/${userItem.id}`}>
                      <motion.img
                        src={userItem.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userItem.displayName || 'User')}`}
                        alt={userItem.displayName}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
                        whileHover={{ scale: 1.1 }}
                      />
                    </Link>
                  </motion.div>
                  <div className="bg-white rounded-b-2xl p-6 shadow-lg border border-gray-100">
                    <Link to={`/profile/${userItem.id}`} className="hover:text-primary-600 transition">
                      <h3 className="text-xl font-bold text-gray-900 text-center mb-1">{userItem.displayName}</h3>
                    </Link>
                    {userItem.department && (
                      <p className="text-sm text-gray-600 text-center mb-3">{userItem.department}</p>
                    )}
                    <div className="text-3xl font-black bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent text-center mb-3">
                      {userItem.points.toLocaleString()} pts
                    </div>
                    <div className="flex justify-center gap-2 flex-wrap mb-3">
                      {userItem.badges && userItem.badges.slice(0, 2).map((badge, bidx) => (
                        <span key={bidx} className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-bold">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-8">Full Ranking</h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <motion.div 
                className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 font-semibold">No users found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((userItem, idx) => (
                <motion.div 
                  key={userItem.id}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-black text-gray-400 w-8">#{userItem.rank}</div>
                    <Link to={`/profile/${userItem.id}`}>
                      <img
                        src={userItem.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userItem.displayName || 'User')}`}
                        alt={userItem.displayName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/profile/${userItem.id}`} className="hover:text-primary-600 transition">
                        <h3 className="font-bold text-gray-900">{userItem.displayName}</h3>
                      </Link>
                      <p className="text-sm text-gray-600">{userItem.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        {userItem.points.toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-600 font-semibold">points</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* How Points Work */}
        <motion.div 
          className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-8">How to Earn Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Upload, label: 'Upload Resources', desc: '+10 points', color: 'blue' },
              { icon: Users, label: 'Join Groups', desc: '+5 points', color: 'green' },
              { icon: MessageCircle, label: 'Post Announcements', desc: '+8 points', color: 'purple' },
              { icon: Heart, label: 'Get Ratings', desc: '+2 points', color: 'pink' },
              { icon: Star, label: 'Engagement Bonus', desc: '+1-2 points', color: 'yellow' },
              { icon: Award, label: 'Earn Badges', desc: 'Special bonus', color: 'indigo' }
            ].map((item, idx) => {
              const colorMap = { blue: 'from-blue-500 to-blue-600', green: 'from-green-500 to-green-600', purple: 'from-purple-500 to-purple-600', pink: 'from-pink-500 to-pink-600', yellow: 'from-yellow-500 to-yellow-600', indigo: 'from-indigo-500 to-indigo-600' };
              const Icon = item.icon;
              return (
                <motion.div 
                  key={idx}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:border-primary-300 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <motion.div 
                    className={`w-12 h-12 bg-gradient-to-br ${colorMap[item.color]} rounded-lg flex items-center justify-center mb-4 shadow-lg`}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.label}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* User's Current Stats */}
        {user && userStats && (
          <motion.div 
            className="mt-12 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 border-2 border-primary-200"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary-600" />
              Your Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: userStats.points, label: 'Total Points', icon: '⚡', color: 'from-blue-500 to-blue-600' },
                { value: `#${userStats.rank}`, label: 'Your Rank', icon: '🏆', color: 'from-yellow-500 to-yellow-600' },
                { value: userStats.contributions?.resources || 0, label: 'Resources', icon: '📚', color: 'from-green-500 to-green-600' },
                { value: userStats.contributions?.announcements || 0, label: 'Announcements', icon: '📢', color: 'from-purple-500 to-purple-600' }
              ].map((stat, idx) => (
                <motion.div 
                  key={idx}
                  className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-center text-white shadow-lg`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <p className="text-3xl font-black">{stat.value}</p>
                  <p className="text-xs font-semibold opacity-90">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;

