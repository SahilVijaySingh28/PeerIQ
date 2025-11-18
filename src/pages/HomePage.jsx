import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, MessageCircle, Calendar, Video, Trophy, Shield, Building, FileText, Bell, HelpCircle, Search, AlertCircle, CheckCircle } from 'lucide-react';

const HomePage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

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
              {user && user.emailVerified
                ? 'Welcome to PeerIQ! Explore features, connect with peers, and build your academic network.'
                : 'The ultimate institute-specific peer-to-peer learning platform. Connect with classmates, share resources, collaborate in real-time, and build your academic community.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user || !user.emailVerified ? (
                <>
                  <a href="/signup" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
                    Join Your Institute
                  </a>
                  <a href="/about" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors">
                    Learn More
                  </a>
                </>
              ) : (
                <a href="/network" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
                  Explore Network
                </a>
              )}
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

      {/* Advanced Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Advanced Collaboration Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for seamless academic collaboration and learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Institute Integration</h3>
              <p className="text-gray-600 mb-4">
                Seamless integration with your institute's systems. Email verification, course enrollment, and official student status.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Email domain verification</li>
                <li>• Course-based networking</li>
                <li>• Official student directory</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Collaboration</h3>
              <p className="text-gray-600 mb-4">
                Work together in real-time with shared documents, live chat, and collaborative study sessions.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Live document editing</li>
                <li>• Real-time messaging</li>
                <li>• Group study sessions</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Scheduling</h3>
              <p className="text-gray-600 mb-4">
                Intelligent scheduling for study groups, meetings, and events with automatic conflict detection.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Group calendar integration</li>
                <li>• Conflict detection</li>
                <li>• Automated reminders</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <HelpCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Mentorship Network</h3>
              <p className="text-gray-600 mb-4">
                Connect with seniors and alumni for guidance, career advice, and academic mentorship.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Senior-junior matching</li>
                <li>• Alumni connections</li>
                <li>• Career guidance</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Discovery</h3>
              <p className="text-gray-600 mb-4">
                AI-powered recommendations for study partners, resources, and learning opportunities.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Smart matching</li>
                <li>• Resource recommendations</li>
                <li>• Learning path suggestions</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Privacy & Security</h3>
              <p className="text-gray-600 mb-4">
                Enterprise-grade security with granular privacy controls and data protection.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• End-to-end encryption</li>
                <li>• Privacy controls</li>
                <li>• GDPR compliance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Growing Community Section */}
      <section className="py-20 bg-white">
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

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started with PeerIQ in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verify & Join</h3>
              <p className="text-gray-600">
                Sign up with your institute email and verify your student status to join the community.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect & Discover</h3>
              <p className="text-gray-600">
                Find classmates, join study groups, and discover resources shared by your peers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Collaborate & Grow</h3>
              <p className="text-gray-600">
                Start collaborating, sharing knowledge, and building your academic network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user || !user.emailVerified ? (
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
              <a href="/demo" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors">
                Request Demo
              </a>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Explore More?
            </h2>
            <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
              Check out all the features PeerIQ offers to help you succeed in your studies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/network" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
                Connect with Peers
              </a>
              <a href="/resources" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors">
                Explore Resources
              </a>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default HomePage; 