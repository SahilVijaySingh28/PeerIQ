import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Search, Filter, Plus, Bell, Video, BookOpen, Trophy } from 'lucide-react';

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

  const EventCard = ({ event }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center ${getEventColor(event.type)}`}>
              {getEventIcon(event.type)}
              <span className="ml-1">{event.type}</span>
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {event.category}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
          <p className="text-gray-600 text-sm mb-4">{event.description}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          {new Date(event.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          {event.time}
        </div>
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          {event.location}
        </div>
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2" />
          {event.attendees} / {event.maxAttendees} attendees
        </div>
        <div className="flex items-center">
          <span className="text-gray-500">Organized by {event.organizer}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {event.tags.map((tag, index) => (
          <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex space-x-2">
        {event.isRegistered ? (
          <>
            <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
              Registered
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              <Bell className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
            Register Now
          </button>
        )}
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
              <p className="text-gray-600">Discover and register for upcoming events and workshops</p>
            </div>
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition-colors">
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events by title, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Dates</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredEvents.length} Events Found
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;

