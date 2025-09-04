import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Search, Bell, UserPlus, MoreVertical, Phone, Video, Image, Paperclip, Smile } from 'lucide-react';

const Messages = () => {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const messagesEndRef = useRef(null);

  // Mock data for chats
  const mockChats = [
    {
      id: 1,
      name: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Hey! How was the React workshop?',
      timestamp: '2 min ago',
      unreadCount: 2,
      isOnline: true,
      department: 'Computer Science',
      messages: [
        { id: 1, text: 'Hey! How was the React workshop?', sender: 'them', timestamp: '2:30 PM' },
        { id: 2, text: 'It was amazing! Learned so much about hooks', sender: 'me', timestamp: '2:32 PM' },
        { id: 3, text: 'Can you share the notes?', sender: 'them', timestamp: '2:35 PM' },
        { id: 4, text: 'Sure! I\'ll send them right away', sender: 'me', timestamp: '2:36 PM' },
        { id: 5, text: 'Thanks a lot!', sender: 'them', timestamp: '2:38 PM' },
        { id: 6, text: 'Hey! How was the React workshop?', sender: 'them', timestamp: '2:40 PM' }
      ]
    },
    {
      id: 2,
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'The study group is meeting tomorrow at 3 PM',
      timestamp: '1 hour ago',
      unreadCount: 0,
      isOnline: false,
      department: 'Data Science',
      messages: [
        { id: 1, text: 'The study group is meeting tomorrow at 3 PM', sender: 'them', timestamp: '1:30 PM' },
        { id: 2, text: 'Perfect! I\'ll be there', sender: 'me', timestamp: '1:35 PM' }
      ]
    },
    {
      id: 3,
      name: 'Michael Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Thanks for helping with the project!',
      timestamp: '3 hours ago',
      unreadCount: 0,
      isOnline: true,
      department: 'Computer Science',
      messages: [
        { id: 1, text: 'Thanks for helping with the project!', sender: 'them', timestamp: '11:30 AM' },
        { id: 2, text: 'No problem! Happy to help', sender: 'me', timestamp: '11:45 AM' }
      ]
    }
  ];

  // Mock notifications
  const mockNotifications = [
    {
      id: 1,
      type: 'friend_request',
      title: 'New Friend Request',
      message: 'David Kim sent you a friend request',
      timestamp: '5 min ago',
      isRead: false,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      actions: ['Accept', 'Decline']
    },
    {
      id: 2,
      type: 'group_invite',
      title: 'Group Invitation',
      message: 'You\'ve been invited to join "Advanced Algorithms Study Group"',
      timestamp: '1 hour ago',
      isRead: false,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      actions: ['Join', 'Decline']
    },
    {
      id: 3,
      type: 'message',
      title: 'New Message',
      message: 'Alex Johnson sent you a message',
      timestamp: '2 hours ago',
      isRead: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      actions: ['Reply']
    },
    {
      id: 4,
      type: 'event_reminder',
      title: 'Event Reminder',
      message: 'Hackathon registration closes in 24 hours',
      timestamp: '3 hours ago',
      isRead: true,
      avatar: null,
      actions: ['Register', 'Dismiss']
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;

    const newMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedChats = mockChats.map(chat => 
      chat.id === selectedChat.id 
        ? { ...chat, messages: [...chat.messages, newMessage], lastMessage: messageText, timestamp: 'Just now' }
        : chat
    );

    // Update the selected chat
    setSelectedChat({
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage],
      lastMessage: messageText,
      timestamp: 'Just now'
    });

    setMessageText('');
    setTimeout(scrollToBottom, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNotificationAction = (notificationId, action) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));
    
    // Handle different actions
    if (action === 'Accept') {
      // Handle friend request acceptance
      console.log('Friend request accepted');
    } else if (action === 'Join') {
      // Handle group join
      console.log('Joined group');
    }
  };

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const ChatList = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map(chat => (
          <div
            key={chat.id}
            onClick={() => setSelectedChat(chat)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {chat.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{chat.name}</h3>
                  <span className="text-xs text-gray-500">{chat.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-blue-600">{chat.department}</span>
                  {chat.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ChatWindow = () => (
    <div className="flex flex-col h-full">
      {selectedChat ? (
        <>
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={selectedChat.avatar}
                    alt={selectedChat.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {selectedChat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedChat.name}</h3>
                  <p className="text-sm text-gray-500">{selectedChat.department}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedChat.messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'me'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Image className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700">
                  <Smile className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );

  const NotificationsList = () => (
    <div className="space-y-4">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 bg-white rounded-lg border ${
            notification.isRead ? 'border-gray-200' : 'border-blue-200 bg-blue-50'
          }`}
        >
          <div className="flex items-start space-x-3">
            {notification.avatar && (
              <img
                src={notification.avatar}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900">{notification.title}</h4>
                <span className="text-sm text-gray-500">{notification.timestamp}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
              <div className="flex space-x-2">
                {notification.actions.map(action => (
                  <button
                    key={action}
                    onClick={() => handleNotificationAction(notification.id, action)}
                    className={`px-3 py-1 text-xs rounded-lg ${
                      action === 'Accept' || action === 'Join'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages & Notifications</h1>
          <p className="text-gray-600">Stay connected with your peers and never miss important updates</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('chats')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'chats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Chats
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bell className="w-4 h-4 inline mr-2" />
                Notifications
                {unreadNotifications > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'chats' ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
              {/* Chat List */}
              <div className="lg:col-span-1 border-r border-gray-200">
                <ChatList />
              </div>
              
              {/* Chat Window */}
              <div className="lg:col-span-2">
                <ChatWindow />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Notifications</h2>
              <NotificationsList />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages; 