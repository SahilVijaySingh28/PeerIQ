import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Search, Filter, Plus, Bell, Video, BookOpen, Trophy, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Events = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  // Mock data for events
  const mockEvents = [
    {
      id: 1,
      title: 'React Workshop',
      description: 'Learn React fundamentals and build your first application.',
      type: 'Workshop',
      date: '2024-01-20',
      time: '10:00 AM - 2:00 PM',
      location: 'Room 101, Building A',
      organizer: 'Alex Johnson',
      attendees: 45,
      maxAttendees: 50,
      isRegistered: true,
      category: 'Computer Science',
      tags: ['React', 'JavaScript', 'Frontend']
    },
    {
      id: 2,
      title: 'Machine Learning Conference',
      description: 'Explore the latest trends in machine learning and AI.',
      type: 'Conference',
      date: '2024-01-25',
      time: '9:00 AM - 5:00 PM',
      location: 'Auditorium',
      organizer: 'Sarah Chen',
      attendees: 120,
      maxAttendees: 150,
      isRegistered: false,
      category: 'Data Science',
      tags: ['Machine Learning', 'AI', 'Data Science']
    },
    {
      id: 3,
      title: 'Hackathon 2024',
      description: '24-hour coding competition. Build innovative solutions and win prizes.',
      type: 'Competition',
      date: '2024-02-01',
      time: '9:00 AM - 9:00 AM (Next Day)',
      location: 'Computer Lab, Building B',
      organizer: 'Michael Rodriguez',
      attendees: 89,
      maxAttendees: 100,
      isRegistered: true,
      category: 'Computer Science',
      tags: ['Hackathon', 'Coding', 'Competition']
    },
    {
      id: 4,
      title: 'Database Design Seminar',
      description: 'Advanced database design principles and best practices.',
      type: 'Seminar',
      date: '2024-01-18',
      time: '3:00 PM - 5:00 PM',
      location: 'Room 205, Building A',
      organizer: 'Emma Wilson',
      attendees: 35,
      maxAttendees: 40,
      isRegistered: false,
      category: 'Computer Science',
      tags: ['Database', 'SQL', 'Backend']
    },
    {
      id: 5,
      title: 'Web Development Bootcamp',
      description: 'Intensive full-stack web development training.',
      type: 'Bootcamp',
      date: '2024-02-05',
      time: '10:00 AM - 4:00 PM',
      location: 'Online',
      organizer: 'David Kim',
      attendees: 67,
      maxAttendees: 100,
      isRegistered: false,
      category: 'Information Technology',
      tags: ['Web Development', 'Full Stack', 'Training']
    },
    {
      id: 6,
      title: 'Data Visualization Workshop',
      description: 'Creating beautiful data visualizations with Python.',
      type: 'Workshop',
      date: '2024-01-22',
      time: '2:00 PM - 4:00 PM',
      location: 'Room 301, Building C',
      organizer: 'Sarah Chen',
      attendees: 28,
      maxAttendees: 30,
      isRegistered: true,
      category: 'Data Science',
      tags: ['Data Visualization', 'Python', 'Matplotlib']
    }
  ];

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesDate = filterDate === 'all' || 
      (filterDate === 'upcoming' && new Date(event.date) >= new Date()) ||
      (filterDate === 'past' && new Date(event.date) < new Date());
    
    return matchesSearch && matchesType && matchesDate;
  });

  const getEventIcon = (type) => {
    switch (type) {
      case 'Workshop':
        return <BookOpen className="w-5 h-5" />;
      case 'Conference':
        return <Users className="w-5 h-5" />;
      case 'Competition':
        return <Trophy className="w-5 h-5" />;
      case 'Seminar':
        return <Video className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'Workshop':
        return 'bg-blue-100 text-blue-600';
      case 'Conference':
        return 'bg-purple-100 text-purple-600';
      case 'Competition':
        return 'bg-yellow-100 text-yellow-600';
      case 'Seminar':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const EventCard = ({ event, index }) => (
    <motion.div 
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <div className="h-40 bg-gradient-to-br from-primary-100 to-secondary-100 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-0 group-hover:opacity-20 transition-opacity"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${getEventColor(event.type)} border border-current border-opacity-20`}>
            {getEventIcon(event.type)}
            {event.type}
          </span>
          <span className="text-xs bg-primary-100 text-primary-700 px-2.5 py-1.5 rounded-full font-bold">
            {event.category}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2.5 mb-4 text-sm text-gray-600 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 font-medium">
            <Calendar className="w-4 h-4 text-primary-600 flex-shrink-0" />
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
          </div>
          <div className="flex items-center gap-2 font-medium">
            <Clock className="w-4 h-4 text-primary-600 flex-shrink-0" />
            {event.time.split(' - ')[0]}
          </div>
          <div className="flex items-center gap-2 font-medium">
            <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0" />
            {event.location}
          </div>
          <div className="flex items-center gap-2 font-medium">
            <Users className="w-4 h-4 text-primary-600 flex-shrink-0" />
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full" 
                style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
              />
            </div>
            <span className="whitespace-nowrap text-xs font-bold">{event.attendees}/{event.maxAttendees}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {event.tags.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-semibold">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          {event.isRegistered ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition font-bold flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Registered
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-bold"
              >
                <Bell className="w-4 h-4" />
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:shadow-lg transition font-bold text-sm"
            >
              Register Now
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">Events & Workshops</h1>
              <p className="text-gray-600 text-lg">Discover and register for amazing learning opportunities</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:shadow-xl text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </motion.button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events by title, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-medium"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-semibold bg-white"
              >
                <option value="all">All Types</option>
                <option value="Workshop">Workshop</option>
                <option value="Conference">Conference</option>
                <option value="Seminar">Seminar</option>
                <option value="Competition">Competition</option>
                <option value="Bootcamp">Bootcamp</option>
              </select>
              
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-semibold bg-white"
              >
                <option value="all">All Dates</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Events Grid */}
        <div>
          <motion.div 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredEvents.length} <span className="text-primary-600">Events</span>
            </h2>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {filteredEvents.map((event, idx) => (
              <EventCard key={event.id} event={event} index={idx} />
            ))}
          </motion.div>

          {filteredEvents.length === 0 && (
            <motion.div 
              className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 text-lg">Try adjusting your search or filter criteria.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;

