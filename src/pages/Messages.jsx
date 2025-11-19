import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MessageCircle, Send, Search, Bell, MoreVertical, Phone, Video, Image, Paperclip, Smile, Mail, Zap } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import messagesAPI from '../services/messagesAPI';
import connectionsAPI from '../services/connectionsAPI';

// Memoized MessageInput component that uses uncontrolled input (no state dependency)
const MessageInput = React.memo(({ onSend, inputRef, onInputChange }) => {
  const [sendButtonKey, setSendButtonKey] = React.useState(0);
  const inputValueRef = React.useRef('');

  const handleChange = (e) => {
    inputValueRef.current = e.target.value;
    onInputChange(e);
    // Force button re-render by changing key
    setSendButtonKey(k => k + 1);
  };

  return (
    <motion.div 
      className="flex-shrink-0 p-4 border-t border-gray-200 bg-white w-full border-gray-300"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex items-center space-x-2">
        <motion.button 
          whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
          whileTap={{ scale: 0.95 }}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
        >
          <Paperclip className="w-5 h-5" />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
          whileTap={{ scale: 0.95 }}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
        >
          <Image className="w-5 h-5" />
        </motion.button>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            onChange={handleChange}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Type a message..."
            className="w-full pl-4 pr-12 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            autoComplete="off"
          />
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
          >
            <Smile className="w-5 h-5" />
          </motion.button>
        </div>
        <motion.button
          key={sendButtonKey}
          onClick={onSend}
          disabled={inputValueRef.current.trim().length === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Always skip re-render - input is fully uncontrolled
  return true;
});

MessageInput.displayName = 'MessageInput';


const Messages = () => {
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [userConnections, setUserConnections] = useState({
    connections: [],
    sentRequests: [],
    receivedRequests: [],
  });
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const messageTextRef = useRef('');
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const isUserScrollingRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const isProgrammaticScrollRef = useRef(false);

  // Get friend ID from URL params when navigating from Network
  const friendIdParam = searchParams.get('friendId');
  const friendNameParam = searchParams.get('friendName');

  // Fetch user connections and notifications on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        // Get user connections (includes pending requests)
        const connectionsRes = await connectionsAPI.getUserConnections(user.id);
        if (connectionsRes.ok) {
          setUserConnections({
            connections: connectionsRes.connections || [],
            sentRequests: connectionsRes.sentRequests || [],
            receivedRequests: connectionsRes.receivedRequests || [],
          });

          // Get all users to fetch details for received requests
          const usersRes = await connectionsAPI.getAllUsers(user.id);
          if (usersRes.ok) {
            // Create notifications from received requests
            const receivedRequestNotifications = connectionsRes.receivedRequests.map(userId => {
              const userData = usersRes.users.find(u => u.id === userId);
              const displayName = userData?.displayName || userData?.name || 'A user';
              return {
                id: userId,
                type: 'friend_request',
                title: 'New Friend Request',
                message: `${displayName} sent you a friend request`,
                timestamp: 'just now',
                isRead: false,
                avatar: userData?.avatar || null,
                userId: userId,
                userName: displayName,
                actions: ['Accept', 'Decline']
              };
            });
            setNotifications(receivedRequestNotifications);
          }
        }

        // Get chat list
        const chatsRes = await messagesAPI.getChatList(user.id);
        if (chatsRes.ok) {
          setChats(chatsRes.chats);

          // If coming from Network page with friendId, find or create chat
          if (friendIdParam) {
            const existingChat = chatsRes.chats.find(c => c.otherUserId === friendIdParam);
            if (existingChat) {
              setSelectedChat(existingChat);
            } else {
              // Create a chat object for the selected friend
              setSelectedChat({
                id: null,
                otherUserId: friendIdParam,
                otherUserName: friendNameParam,
                otherUserEmail: '',
                otherUserAvatar: null,
                lastMessage: '',
                lastMessageTime: new Date(),
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, friendIdParam, friendNameParam]);

  useEffect(() => {
    if (!selectedChat || !user?.id) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      const messagesRes = await messagesAPI.getMessages(user.id, selectedChat.otherUserId);
      setLoadingMessages(false);

      if (messagesRes.ok) {
        setMessages(messagesRes.messages);
        // Mark as initial load to scroll on first load only
        isInitialLoadRef.current = true;
      }
    };

    loadMessages();

    // Subscribe to real-time messages
    const unsubscribe = messagesAPI.subscribeToMessages(
      user.id,
      selectedChat.otherUserId,
      (newMessages) => {
        setMessages(newMessages);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedChat, user?.id]);

  useEffect(() => {
    // Auto-scroll disabled - user can scroll manually
    // Just scroll on initial load
    if (isInitialLoadRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
        isInitialLoadRef.current = false;
      }, 100);
    }
  }, [messages]);

  // Focus input when chat is selected and clear any previous input
  useEffect(() => {
    if (selectedChat && inputRef.current) {
      // Clear input
      inputRef.current.value = '';
      messageTextRef.current = '';
      // Focus immediately
      inputRef.current.focus();
    }
  }, [selectedChat]);
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
    // Only scroll smoothly if we have messages
    if (messages.length > 0 && shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      isProgrammaticScrollRef.current = true;
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 100);
    }
  };

  const handleSendMessage = useCallback(async () => {
    const messageContent = messageTextRef.current.trim();
    if (!messageContent || !selectedChat || !user?.id) return;

    // Clear input immediately
    if (inputRef.current) {
      inputRef.current.value = '';
      messageTextRef.current = '';
    }

    const result = await messagesAPI.sendMessage(user.id, selectedChat.otherUserId, messageContent);

    if (!result.ok) {
      alert(result.error || 'Failed to send message');
      // Restore message on error
      if (inputRef.current) {
        inputRef.current.value = messageContent;
        messageTextRef.current = messageContent;
      }
    }
  }, [selectedChat, user?.id]);

  const handleInputChange = useCallback((e) => {
    messageTextRef.current = e.target.value;
  }, []);

  // Focus input when chat is selected and clear any previous input
  useEffect(() => {
    if (selectedChat && inputRef.current) {
      inputRef.current.focus();
      // Clear input
      inputRef.current.value = '';
      messageTextRef.current = '';
    }
  }, [selectedChat]);

  const handleMessagesScroll = useCallback((e) => {
    // User can now scroll freely without auto-scroll interference
  }, []);

  const handleAcceptRequest = async (userId) => {
    if (!user?.id) return;

    const result = await connectionsAPI.acceptConnectionRequest(userId, user.id);
    if (result.ok) {
      // Update notifications
      setNotifications(prev => prev.filter(n => n.userId !== userId));
      // Update connections
      setUserConnections(prev => ({
        ...prev,
        connections: [...prev.connections, userId],
        receivedRequests: prev.receivedRequests.filter(id => id !== userId),
      }));
    } else {
      alert(result.error || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (userId) => {
    if (!user?.id) return;

    const result = await connectionsAPI.rejectConnectionRequest(userId, user.id);
    if (result.ok) {
      setNotifications(prev => prev.filter(n => n.userId !== userId));
      setUserConnections(prev => ({
        ...prev,
        receivedRequests: prev.receivedRequests.filter(id => id !== userId),
      }));
    } else {
      alert(result.error || 'Failed to reject request');
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const ChatList = () => (
    <div className="flex flex-col h-full bg-white">
      <motion.div 
        className="p-4 border-b border-gray-200"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat, idx) => (
            <motion.div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ x: 4, backgroundColor: '#f8fafc' }}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                selectedChat?.id === chat.id ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                >
                  {chat.otherUserName.charAt(0).toUpperCase()}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{chat.otherUserName}</h3>
                    <span className="text-xs text-gray-500">
                      {chat.lastMessageTime?.toLocaleTimeString?.(['en-US'], { hour: '2-digit', minute: '2-digit' }) || 'Now'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage || 'Start a conversation'}</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div 
            className="flex items-center justify-center h-full text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p>No conversations yet</p>
          </motion.div>
        )}
      </div>
    </div>
  );

  const ChatWindow = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100">
      {selectedChat ? (
        <>
          {/* Chat Header */}
          <motion.div 
            className="p-4 border-b border-gray-200 bg-white shadow-sm"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link to={`/profile/${selectedChat.otherUserId}`}>
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold hover:shadow-lg transition-shadow"
                    whileHover={{ scale: 1.05 }}
                  >
                    {selectedChat.otherUserName?.charAt(0).toUpperCase()}
                  </motion.div>
                </Link>
                <div>
                  <Link 
                    to={`/profile/${selectedChat.otherUserId}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900">{selectedChat.otherUserName}</h3>
                  </Link>
                  <p className="text-sm text-gray-500">{selectedChat.otherUserEmail || 'Connected'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
                >
                  <Phone className="w-5 h-5" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
                >
                  <Video className="w-5 h-5" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Messages Container */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto pt-4 pb-2 px-4 space-y-3 messages-scroll" onScroll={handleMessagesScroll} style={{ scrollBehavior: 'smooth' }}>
              {loadingMessages ? (
                <motion.div 
                  className="flex items-center justify-center h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div 
                    className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
              ) : messages.length > 0 ? (
                messages.map((message, idx) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.fromUserId === user?.id ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    <motion.div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                        message.fromUserId === user?.id
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                          : 'bg-white text-gray-900 border-2 border-gray-100'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.fromUserId === user?.id ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp?.toLocaleTimeString?.(['en-US'], {
                          hour: '2-digit',
                          minute: '2-digit',
                        }) || ''}
                      </p>
                    </motion.div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className="flex items-center justify-center h-full text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-center">
                    <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <MessageInput
              onSend={handleSendMessage}
              inputRef={inputRef}
              onInputChange={handleInputChange}
            />
          </div>
        </>
      ) : (
        <motion.div 
          className="flex-1 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a chat to start messaging</p>
          </div>
        </motion.div>
      )}
    </div>
  );

  const NotificationsList = () => (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {notifications.length > 0 ? (
        notifications.map((notification, idx) => (
          <motion.div
            key={notification.id}
            className={`p-4 bg-white rounded-2xl border-2 shadow-sm hover:shadow-md transition-all ${
              notification.isRead ? 'border-gray-200' : 'border-blue-200 bg-gradient-to-r from-blue-50 to-white'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-start space-x-3">
              <motion.div 
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0"
                whileHover={{ scale: 1.05 }}
              >
                {notification.userName?.charAt(0).toUpperCase()}
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">{notification.title}</h4>
                  <span className="text-sm text-gray-500">{notification.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                <div className="flex space-x-2">
                  {notification.actions.map(action => (
                    <motion.button
                      key={action}
                      onClick={() => {
                        if (action === 'Accept') {
                          handleAcceptRequest(notification.userId);
                        } else if (action === 'Decline') {
                          handleRejectRequest(notification.userId);
                        }
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                        action === 'Accept'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {action}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <motion.div 
          className="text-center py-8 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          </motion.div>
          <p>No notifications yet</p>
        </motion.div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <motion.div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div 
        className="bg-white border-b sticky top-0 z-10 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Messages & Notifications</h1>
          <p className="text-gray-600 mt-1">Stay connected with your peers and never miss important updates</p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg mb-6 border-2 border-gray-200"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="border-b-2 border-gray-100">
            <nav className="flex space-x-8 px-6">
              <motion.button
                whileHover={{ y: -2 }}
                onClick={() => setActiveTab('chats')}
                className={`pb-4 px-2 font-bold text-base border-b-4 transition whitespace-nowrap ${
                  activeTab === 'chats'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Chats
              </motion.button>
              <motion.button
                whileHover={{ y: -2 }}
                onClick={() => setActiveTab('notifications')}
                className={`pb-4 px-2 font-bold text-base border-b-4 transition whitespace-nowrap ${
                  activeTab === 'notifications'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Bell className="w-4 h-4 inline mr-2" />
                Notifications
                {unreadNotifications > 0 && (
                  <motion.span 
                    className="ml-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full px-2 py-1 font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    {unreadNotifications}
                  </motion.span>
                )}
              </motion.button>
            </nav>
          </div>
        </motion.div>

        {/* Content */}
        {activeTab === 'chats' ? (
          <motion.div 
            className="bg-white rounded-2xl shadow-lg overflow-hidden h-[550px] mb-8 border-2 border-gray-200"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 h-full w-full">
              {/* Chat List */}
              <div className="lg:col-span-1 border-r border-gray-200 h-full overflow-hidden">
                <ChatList />
              </div>

              {/* Chat Window */}
              <div className="lg:col-span-2 h-full flex flex-col overflow-hidden">
                <ChatWindow />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">Friend Requests & Notifications</h2>
              <NotificationsList />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Messages; 