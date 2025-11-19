import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, MessageCircle, Calendar, Video, Trophy, Shield, Building, FileText, Bell, HelpCircle, Search, AlertCircle, CheckCircle, ArrowRight, TrendingUp, Star, Zap, Target, Compass } from 'lucide-react';
import leaderboardAPI from '../services/leaderboardAPI';
import connectionsAPI from '../services/connectionsAPI';

const HomePage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState({
    connections: 0,
    resources: 0,
    groups: 0,
    contributions: 0
  });

  // Simulate loading user stats
  useEffect(() => {
    if (user && user.emailVerified) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      // Get contributions
      const contributions = await leaderboardAPI.calculateUserContributions(user.id);
      
      // Get connections count
      const connectionsResult = await connectionsAPI.getUserConnections(user.id);
      const connectionCount = connectionsResult.ok ? connectionsResult.connections.length : 0;

      setUserStats({
        connections: connectionCount,
        resources: contributions.resources || 0,
        groups: contributions.groups || 0,
        contributions: user.points || 0
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
      // Fallback to user data
      setUserStats({
        connections: 0,
        resources: 0,
        groups: 0,
        contributions: user.points || 0
      });
    }
  };

  // Show dashboard if user is verified
  const showDashboard = user && user.emailVerified;

  if (showDashboard) {
    return (
      <>
        {/* Welcome Banner with Full User Details */}
        <section className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  Welcome back, <span className="text-secondary-300">{user.displayName || user.name}</span>!
                </h1>
                <p className="text-lg text-primary-100 mb-6">
                  You're all set to explore PeerIQ. Start by connecting with peers or sharing your knowledge.
                </p>
                
                {/* User Details Section */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 mb-6 border border-white border-opacity-20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-primary-100 text-xs font-semibold uppercase tracking-wider">Email</p>
                      <p className="text-white font-medium mt-1">{user.email}</p>
                    </div>
                    
                    {user.collegeEmail && (
                      <div>
                        <p className="text-primary-100 text-xs font-semibold uppercase tracking-wider">College Email</p>
                        <p className="text-white font-medium mt-1">{user.collegeEmail}</p>
                      </div>
                    )}
                    
                    {user.department && (
                      <div>
                        <p className="text-primary-100 text-xs font-semibold uppercase tracking-wider">Department</p>
                        <p className="text-white font-medium mt-1">{user.department}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-primary-100 text-xs font-semibold uppercase tracking-wider">Points</p>
                      <p className="text-white font-medium mt-1">{user.points || 0} pts</p>
                    </div>

                    {user.badges && user.badges.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="text-primary-100 text-xs font-semibold uppercase tracking-wider mb-2">Badges</p>
                        <div className="flex flex-wrap gap-2">
                          {user.badges.map((badge, idx) => (
                            <span key={idx} className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-xs font-medium">
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {user.createdAt && (
                      <div>
                        <p className="text-primary-100 text-xs font-semibold uppercase tracking-wider">Member Since</p>
                        <p className="text-white font-medium mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('/network')}
                    className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Users className="w-5 h-5" />
                    Find Peers
                  </button>
                  <button
                    onClick={() => navigate('/resources')}
                    className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    Share Resources
                  </button>
                </div>
              </div>
              <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.name || 'User')}&size=200&background=random`}
                  alt={user.displayName || user.name}
                  className="w-full h-full rounded-2xl object-cover shadow-lg border-4 border-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/network')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Network Connections</p>
                    <p className="text-3xl font-bold text-primary-600 mt-2">{userStats.connections}</p>
                    <p className="text-xs text-gray-500 mt-2">peers connected</p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/resources')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Resources Shared</p>
                    <p className="text-3xl font-bold text-secondary-600 mt-2">{userStats.resources}</p>
                    <p className="text-xs text-gray-500 mt-2">materials uploaded</p>
                  </div>
                  <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-secondary-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/groups')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Study Groups</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{userStats.groups}</p>
                    <p className="text-xs text-gray-500 mt-2">groups joined</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/leaderboard')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Contributions</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{userStats.contributions}</p>
                    <p className="text-xs text-gray-500 mt-2">points earned</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Quick Actions</h2>
              <p className="text-gray-600">Access your most frequently used features</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={() => navigate('/network')}
                className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 p-6 rounded-lg hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
                      <Compass className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Discover Peers</h3>
                    <p className="text-sm text-gray-600">Connect with classmates and build your network</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary-600 flex-shrink-0 mt-1" />
                </div>
              </button>

              <button
                onClick={() => navigate('/resources')}
                className="bg-gradient-to-br from-secondary-50 to-secondary-100 border-2 border-secondary-200 p-6 rounded-lg hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 bg-secondary-600 rounded-lg flex items-center justify-center mb-4">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Resources</h3>
                    <p className="text-sm text-gray-600">Find study materials and learning resources</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-1" />
                </div>
              </button>

              <button
                onClick={() => navigate('/groups')}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 p-6 rounded-lg hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Join Study Groups</h3>
                    <p className="text-sm text-gray-600">Collaborate with others in study groups</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                </div>
              </button>

              <button
                onClick={() => navigate('/video')}
                className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 p-6 rounded-lg hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Video Meeting</h3>
                    <p className="text-sm text-gray-600">Host or join virtual study sessions</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                </div>
              </button>

              <button
                onClick={() => navigate('/leaderboard')}
                className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 p-6 rounded-lg hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">View Leaderboard</h3>
                    <p className="text-sm text-gray-600">See top contributors and track your rank</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                </div>
              </button>

              <button
                onClick={() => navigate('/events')}
                className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 p-6 rounded-lg hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Events</h3>
                    <p className="text-sm text-gray-600">Discover upcoming events and workshops</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Tips & Tricks</h2>
              <p className="text-gray-600">Make the most out of PeerIQ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Complete Your Profile</h3>
                    <p className="text-sm text-gray-600">Add your interests, skills, and courses to get better peer recommendations</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Join Study Groups</h3>
                    <p className="text-sm text-gray-600">Participate in active study groups to enhance your learning and make connections</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Share Quality Resources</h3>
                    <p className="text-sm text-gray-600">Upload useful study materials to earn points and help your peers learn better</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Climb the Leaderboard</h3>
                    <p className="text-sm text-gray-600">Engage with the community and climb the ranks to become a recognized contributor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
              Start connecting with peers, sharing resources, and growing your academic network today!
            </p>
            <button
              onClick={() => navigate('/network')}
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Explore the Platform
            </button>
          </div>
        </section>
      </>
    );
  }

  // Unauthenticated or unverified users - show landing page
  return (
    <>
      {/* Email Verification Banner */}
      {user && !user.emailVerified && (
        <div className="bg-amber-50 border-b-2 border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-amber-900 mb-1">
                  Verify Your College Email
                </h3>
                <p className="text-amber-800 mb-4">
                  Complete email verification to unlock all features and connect with verified peers from your institute.
                </p>
                <button
                  onClick={() => navigate('/verify-email')}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Verify Email Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Connect, Learn, 
              <span className="block text-secondary-300">Grow Together</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              The ultimate institute-specific peer-to-peer learning platform. Connect with classmates, share resources, collaborate in real-time, and build your academic community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/signup" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
                Join Your Institute
              </a>
              <a href="/login" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors">
                Login Here
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A comprehensive platform designed specifically for your institute's academic community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Networking</h3>
              <p className="text-gray-600">
                Connect with peers based on courses, skills, and interests. Build your academic network with verified institute members.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Resource Hub</h3>
              <p className="text-gray-600">
                Share and discover study materials, notes, and references. Tag and categorize for easy search across your institute.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Video Conferencing</h3>
              <p className="text-gray-600">
                Host study sessions, group meetings, and virtual classes with integrated Jitsi Meet. No external apps needed.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Leaderboard</h3>
              <p className="text-gray-600">
                Earn points for helping others. Upload materials, answer questions, and climb the institute leaderboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Join Our Growing Community
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how PeerIQ is transforming academic collaboration across institutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">50,000+</div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary-600 mb-2">100,000+</div>
              <div className="text-gray-600">Resources Shared</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-600 mb-2">25,000+</div>
              <div className="text-gray-600">Study Groups</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Join thousands of students who are already using PeerIQ to connect, collaborate, and succeed together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/signup" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              Get Started Today
            </a>
            <a href="/login" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors">
              Login to Account
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
