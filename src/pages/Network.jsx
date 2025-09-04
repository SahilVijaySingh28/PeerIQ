import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Users, Filter, MapPin, BookOpen, Star } from 'lucide-react';

const Network = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [activeTab, setActiveTab] = useState('discover');
  const [suggestions, setSuggestions] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  // Mock data for demonstration
  const mockStudents = [
    {
      id: 1,
      name: 'Alex Johnson',
      department: 'Computer Science',
      year: '3rd Year',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      skills: ['React', 'Python', 'Machine Learning'],
      interests: ['Web Development', 'AI', 'Open Source'],
      mutualConnections: 5,
      isConnected: false,
      isRequestSent: false,
      isRequestReceived: false
    },
    {
      id: 2,
      name: 'Sarah Chen',
      department: 'Data Science',
      year: '2nd Year',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      skills: ['Python', 'SQL', 'Data Visualization'],
      interests: ['Data Analysis', 'Statistics', 'Research'],
      mutualConnections: 3,
      isConnected: false,
      isRequestSent: false,
      isRequestReceived: false
    },
    {
      id: 3,
      name: 'Michael Rodriguez',
      department: 'Computer Science',
      year: '4th Year',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      skills: ['Java', 'Spring Boot', 'DevOps'],
      interests: ['Software Engineering', 'Cloud Computing', 'Mentoring'],
      mutualConnections: 8,
      isConnected: true,
      isRequestSent: false,
      isRequestReceived: false
    },
    {
      id: 4,
      name: 'Emma Wilson',
      department: 'Information Technology',
      year: '2nd Year',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      skills: ['JavaScript', 'Node.js', 'MongoDB'],
      interests: ['Full Stack Development', 'UI/UX', 'Startups'],
      mutualConnections: 2,
      isConnected: false,
      isRequestSent: true,
      isRequestReceived: false
    },
    {
      id: 5,
      name: 'David Kim',
      department: 'Computer Science',
      year: '3rd Year',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      skills: ['C++', 'Algorithms', 'Competitive Programming'],
      interests: ['Problem Solving', 'Hackathons', 'Teaching'],
      mutualConnections: 6,
      isConnected: false,
      isRequestSent: false,
      isRequestReceived: true
    }
  ];

  useEffect(() => {
    // Filter students based on search and filters
    let filtered = mockStudents;
    
    if (searchQuery) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(student => student.department === filterDepartment);
    }
    
    if (filterYear !== 'all') {
      filtered = filtered.filter(student => student.year === filterYear);
    }

    setSuggestions(filtered.filter(student => !student.isConnected && !student.isRequestSent && !student.isRequestReceived));
    setConnections(filtered.filter(student => student.isConnected));
    setPendingRequests(filtered.filter(student => student.isRequestSent || student.isRequestReceived));
  }, [searchQuery, filterDepartment, filterYear]);

  const handleSendRequest = (studentId) => {
    setSuggestions(prev => prev.map(student => 
      student.id === studentId ? { ...student, isRequestSent: true } : student
    ));
    setPendingRequests(prev => [...prev, mockStudents.find(s => s.id === studentId)]);
  };

  const handleAcceptRequest = (studentId) => {
    setPendingRequests(prev => prev.map(student => 
      student.id === studentId ? { ...student, isConnected: true, isRequestReceived: false } : student
    ));
    setConnections(prev => [...prev, mockStudents.find(s => s.id === studentId)]);
  };

  const handleRejectRequest = (studentId) => {
    setPendingRequests(prev => prev.filter(student => student.id !== studentId));
  };

  const handleCancelRequest = (studentId) => {
    setPendingRequests(prev => prev.filter(student => student.id !== studentId));
    setSuggestions(prev => prev.map(student => 
      student.id === studentId ? { ...student, isRequestSent: false } : student
    ));
  };

  const StudentCard = ({ student, type }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <img 
          src={student.avatar} 
          alt={student.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{student.year}</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {student.department}
              </span>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Users className="w-4 h-4 mr-1" />
              {student.mutualConnections} mutual connections
            </div>
          </div>

          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Skills:</h4>
            <div className="flex flex-wrap gap-1">
              {student.skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Interests:</h4>
            <div className="flex flex-wrap gap-1">
              {student.interests.slice(0, 2).map((interest, index) => (
                <span key={index} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            {type === 'suggestion' && (
              <button
                onClick={() => handleSendRequest(student.id)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Connect
              </button>
            )}
            
            {type === 'pending' && student.isRequestReceived && (
              <>
                <button
                  onClick={() => handleAcceptRequest(student.id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRejectRequest(student.id)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Decline
                </button>
              </>
            )}
            
            {type === 'pending' && student.isRequestSent && (
              <button
                onClick={() => handleCancelRequest(student.id)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel Request
              </button>
            )}
            
            {type === 'connection' && (
              <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Message
              </button>
            )}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Network</h1>
          <p className="text-gray-600">Connect with fellow students and build your academic network</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, department, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Data Science">Data Science</option>
                <option value="Information Technology">Information Technology</option>
              </select>
              
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('discover')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'discover'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Discover ({suggestions.length})
              </button>
              <button
                onClick={() => setActiveTab('connections')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'connections'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Connections ({connections.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending ({pendingRequests.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'discover' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Suggested Connections</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.map(student => (
                  <StudentCard key={student.id} student={student} type="suggestion" />
                ))}
              </div>
              {suggestions.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No suggestions found. Try adjusting your search criteria.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'connections' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Connections</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connections.map(student => (
                  <StudentCard key={student.id} student={student} type="connection" />
                ))}
              </div>
              {connections.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">You haven't connected with anyone yet. Start exploring!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Requests</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingRequests.map(student => (
                  <StudentCard key={student.id} student={student} type="pending" />
                ))}
              </div>
              {pendingRequests.length === 0 && (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending requests at the moment.</p>
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