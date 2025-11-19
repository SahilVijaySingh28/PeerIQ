# PeerIQ - Peer-to-Peer Learning Platform

> A modern, comprehensive web application designed to facilitate peer-to-peer learning, real-time collaboration, and resource sharing among students at educational institutions.

[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0-blue.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Features in Detail](#-features-in-detail)
- [API Documentation](#-api-documentation)
- [Firestore Security Rules](#-firestore-security-rules)
- [Deployment](#-deployment)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🚀 Features

### ✅ Authentication & User Management
- **Email/Password Authentication** - Secure signup and login with Firebase
- **Email Verification** - OTP-based college email verification
- **User Profiles** - Complete profile management with avatar, bio, and preferences
- **Protected Routes** - Role-based access control for authenticated features
- **Session Management** - Persistent login with automatic token refresh

### ✅ Networking & Connections
- **Peer Discovery** - Search and discover students by name, email, or interests
- **Connection Requests** - Send and manage friend requests with notifications
- **Friend Management** - Accept/reject requests, view connections
- **User Search** - Advanced filtering and search capabilities
- **Connection Status** - Real-time status updates for pending/accepted connections

### ✅ Real-time Messaging
- **Direct Messaging** - Real-time one-on-one chat with friends
- **Message History** - Persistent message storage with retrieval
- **Auto-Scrolling** - Smooth message scrolling with user scroll detection
- **Typing Indicators** - See when others are typing
- **Notifications** - Real-time notification system for new messages
- **Optimized Performance** - Efficient message rendering with custom scrollbars

### ✅ Resources & Study Materials
- **Resource Upload** - Share PDFs, videos, notebooks, slides, and documents
- **Resource Discovery** - Browse and search all shared resources
- **Categories & Filtering** - Filter by type, category, and date
- **Rating System** - Rate and review resources with star ratings and reviews
- **Download Tracking** - Track resource downloads and popularity
- **File Storage** - Base64 encoding support for Spark plan compatibility (1-5MB files)
- **Sharing** - Copy link or share on social media

### ✅ Study Groups
- **Group Creation** - Create study groups with customizable settings
- **Public Groups** - Make groups discoverable or private by invitation
- **Member Management** - Add/remove members with capacity limits
- **Group Announcements** - Post and manage group announcements
- **Engagement Features** - Like, comment, and interact with announcements
- **Member Lists** - View all members with detailed profiles
- **Creator Controls** - Kick members, post announcements, manage group

### ✅ Admin/Creator Features (Groups)
- **Admin Panel** - Dedicated admin interface for group creators
- **Member Kick** - Remove members from groups
- **Announcement Management** - Post, edit, and delete announcements
- **Member Management** - View and manage all group members
- **Group Statistics** - Track member count, announcements, and engagement
- **Content Moderation** - Delete inappropriate content

### ✅ Navigation & User Interface
- **Responsive Navigation** - Mobile-friendly navigation with menu toggle
- **Active Route Highlighting** - Clear indication of current page
- **Sticky Header** - Navigation stays visible while scrolling
- **Mobile Menu** - Hamburger menu for mobile devices
- **Dark Mode Support** - Tailwind CSS dark mode compatibility

### ✅ Video Conferencing
- **Jitsi Meet Integration** - Real-time video meetings with Jitsi
- **Meeting Creation** - Users can create and schedule meetings
- **Guest Access** - Allow participants to join as guests without authentication
- **Meeting Room Management** - Join, list, and manage video conferences
- **Anonymous Access** - Support for guest participants in meetings

### ✅ Additional Pages
- **Home Page** - Hero section, features showcase, stats, and CTAs
- **Video Meet** - Fully integrated video conferencing with Jitsi Meet
- **Leaderboard** - Contributions and rankings (ready for implementation)
- **Events** - Discover events and workshops (ready for implementation)
- **Footer** - Comprehensive footer with links and contact info

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Google Fonts** - Inter font family

### Backend & Database
- **Firebase Authentication** - Email/password authentication
- **Firestore** - Real-time NoSQL database
- **Firebase Realtime Updates** - Live data synchronization

### Build Tools
- **Create React App** - Build tooling
- **PostCSS** - CSS processing
- **Babel** - JavaScript transpiling

---

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Git

### Step-by-Step Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/SahilVijaySingh28/PeerIQ.git
cd PeerIQ
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Set up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable Email/Password
4. Enable Firestore:
   - Go to Firestore Database
   - Create database in production mode
   - Accept the security rules

#### 4. Configure Environment Variables

Create a `.env` file in the project root:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
REACT_APP_FIREBASE_PROJECT_ID=your_project_id_here
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
REACT_APP_FIREBASE_APP_ID=your_app_id_here
```

**Get these values from:**
Firebase Console → Project Settings → Service Accounts → Web API Keys

#### 5. Set up Firestore Security Rules

1. Go to Firebase Console → Firestore Database → Rules
2. Replace default rules with rules from `FIRESTORE_SECURITY_RULES.md`
3. Click Publish

#### 6. Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3001`

---

## 🏗️ Project Structure

```
PeerIQ/
├── src/
│   ├── components/
│   │   ├── Navigation.jsx           # Top navigation bar
│   │   └── Footer.jsx               # Footer component
│   │
│   ├── pages/
│   │   ├── HomePage.jsx             # Landing page
│   │   ├── Login.jsx                # Login page
│   │   ├── Signup.jsx               # Registration page
│   │   ├── EmailVerification.jsx    # Email verification page
│   │   ├── Network.jsx              # Peer discovery & connections
│   │   ├── Messages.jsx             # Real-time messaging
│   │   ├── Resources.jsx            # Study materials & sharing
│   │   ├── Groups.jsx               # Study groups management
│   │   ├── Video.jsx                # Video conferencing placeholder
│   │   ├── Leaderboard.jsx          # Rankings & contributions
│   │   └── Events.jsx               # Events & workshops
│   │
│   ├── services/
│   │   ├── firebaseAuth.js          # Firebase auth wrapper
│   │   ├── authAPI.js               # Authentication service
│   │   ├── messagesAPI.js           # Real-time messaging service
│   │   ├── connectionsAPI.js        # Connections & networking service
│   │   ├── resourcesAPI.js          # Resources upload & management
│   │   └── groupsAPI.js             # Groups management service
│   │
│   ├── contexts/
│   │   └── UserContext.jsx          # Global user state management
│   │
│   ├── config/
│   │   └── firebase.js              # Firebase configuration
│   │
│   ├── App.jsx                      # Main app with routing
│   ├── index.js                     # React entry point
│   └── index.css                    # Global styles
│
├── public/
│   └── index.html                   # HTML template
│
├── backend/                         # Backend configurations
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── services/
│
├── package.json                     # Project dependencies
├── tailwind.config.js               # Tailwind CSS config
├── postcss.config.js                # PostCSS config
├── FIRESTORE_SECURITY_RULES.md      # Security rules documentation
└── README.md                        # This file
```

---

## ⚙️ Configuration

### Tailwind CSS
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#22c55e',
      },
    },
  },
  plugins: [],
}
```

### Firebase Config
```javascript
// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## 📚 Features in Detail

### 🔐 Authentication System

**Features:**
- Email/password registration
- Email verification with OTP
- Secure login with token storage
- Password reset capability
- Session persistence

**Flow:**
1. User signs up with email and password
2. OTP is sent to email for verification
3. User verifies email and completes registration
4. Login stores auth token in localStorage
5. Token is automatically refreshed on app load

### 👥 Networking & Connections

**Features:**
- Search students by name, email, or interests
- Send connection requests
- Accept/reject connections
- View all connections
- Block functionality

**Firestore Structure:**
```
users/{userId}
├── email: string
├── displayName: string
├── photoURL: string
├── sentRequests: array
└── receivedRequests: array

connections/{connectionId}
├── fromUserId: string
├── toUserId: string
├── status: 'pending' | 'accepted' | 'rejected'
└── createdAt: timestamp
```

### 💬 Real-time Messaging

**Features:**
- Create chat rooms with friends
- Real-time message delivery
- Message history persistence
- Automatic scrolling to latest messages
- User typing indicators
- Read receipts

**Firestore Structure:**
```
chatRooms/{roomId}
├── participants: array
├── lastMessage: string
└── lastMessageTime: timestamp

chatRooms/{roomId}/messages/{messageId}
├── fromUserId: string
├── text: string
├── createdAt: timestamp
└── isRead: boolean
```

### 📚 Resources & Study Materials

**Features:**
- Upload study materials (PDF, Video, Notebook, Slide, Document)
- File size limits: 1-5MB
- Categorize by type and category
- Rate and review resources
- Download counter
- Social sharing
- Search and filter

**Supported File Types:**
- PDF (1MB max)
- Video (5MB max)
- Notebooks (2MB max)
- Slides (2MB max)
- Documents (1MB max)

**Firestore Structure:**
```
resources/{resourceId}
├── title: string
├── description: string
├── category: string
├── type: 'pdf' | 'video' | 'notebook' | 'slide' | 'document'
├── fileData: string (base64)
├── ownerId: string
├── downloads: number
├── ratings: array
└── createdAt: timestamp
```

### 👫 Study Groups

**Features:**
- Create public/private groups
- Set member capacity limits
- Search and filter groups
- Join/leave groups
- View group members
- Post announcements
- Creator admin controls

**Firestore Structure:**
```
groups/{groupId}
├── name: string
├── description: string
├── category: string
├── maxMembers: number
├── topics: array
├── isPublic: boolean
├── creatorId: string
├── members: array
├── avatar: string
└── createdAt: timestamp

announcements/{announcementId}
├── groupId: string
├── authorId: string
├── title: string
├── content: string
├── likes: array
├── comments: array
└── createdAt: timestamp
```

### 👑 Creator Admin Features

**In Admin Panel:**
- Post group announcements
- Manage members (kick/remove)
- View member details
- Delete inappropriate announcements
- Track group statistics

---

## 🔒 Firestore Security Rules

### Collections Permissions

**Users Collection:**
- Users can read/write own data
- Can read others' basic info for discovery
- Can update connection request arrays

**Connections Collection:**
- Authenticated users can create connections
- Can read all connections
- Can only update/delete own connections

**Chat Rooms:**
- Only participants can read/write
- Any authenticated user can create
- Messages can only be created by participants

**Resources:**
- All authenticated users can read
- Can create new resources
- Can only update/delete own resources

**Groups:**
- All authenticated users can read
- Can create new groups
- Creator or members can update
- Only creator can delete

**Announcements:**
- All authenticated users can read
- Can create announcements
- Anyone can like/comment
- Only author can delete

See `FIRESTORE_SECURITY_RULES.md` for complete rules.

---

## 📡 API Documentation

### Authentication APIs

#### Register User
```javascript
POST /api/auth/register
Body: { email, password, displayName }
Response: { user, token }
```

#### Login
```javascript
POST /api/auth/login
Body: { email, password }
Response: { user, token }
```

#### Verify Email
```javascript
POST /api/auth/verify-email
Body: { email, otp }
Response: { success }
```

### Connections APIs

```javascript
// Send friend request
connectionsAPI.sendRequest(fromUserId, toUserId)

// Accept request
connectionsAPI.acceptRequest(connectionId, userId)

// Get all connections
connectionsAPI.getAllConnections(userId)

// Search users
connectionsAPI.searchUsers(searchQuery)
```

### Messages APIs

```javascript
// Send message
messagesAPI.sendMessage(chatRoomId, userId, text)

// Get messages
messagesAPI.getMessages(chatRoomId)

// Create chat room
messagesAPI.createChatRoom(participants)

// Get chat rooms
messagesAPI.getChatRooms(userId)
```

### Resources APIs

```javascript
// Upload resource
resourcesAPI.uploadResource(file, resourceData, userId)

// Get all resources
resourcesAPI.getAllResources()

// Add rating
resourcesAPI.addRating(resourceId, userId, rating, review)

// Download resource
resourcesAPI.incrementDownloads(resourceId)

// Delete resource
resourcesAPI.deleteResource(resourceId, userId)
```

### Groups APIs

```javascript
// Create group
groupsAPI.createGroup(groupData, userId)

// Get all groups
groupsAPI.getAllGroups()

// Join group
groupsAPI.joinGroup(groupId, userId)

// Leave group
groupsAPI.leaveGroup(groupId, userId)

// Post announcement
groupsAPI.postAnnouncement(groupId, userId, title, content)

// Get announcements
groupsAPI.getGroupAnnouncements(groupId)

// Remove member
groupsAPI.removeMember(groupId, memberId, userId)

// Get members
groupsAPI.getGroupMembers(groupId)
```

---

## 📝 Changelog

### Recent Updates (November 2025)

#### Video Conferencing Features
- **Jitsi Meet Integration**: Implemented full video conferencing capability using Jitsi Meet
- **Meeting Management**: Users can create, schedule, and manage video meetings
- **Guest Access**: Support for anonymous guest participants without authentication
- **Real-time Meetings**: Integrated Jitsi External API with optimized configuration
- **Meeting Data Persistence**: Store meeting schedules in Firestore with proper user context

#### Bug Fixes & Optimizations
- Fixed component re-rendering issues by memoizing JitsiMeetComponent
- Removed unnecessary polling intervals causing excessive API calls
- Updated security rules for video meeting participants
- Corrected user ID references throughout Video.jsx
- Added fallbacks for undefined user display names
- Optimized Firestore queries by removing client-side sorting instead of index requirements
- Fixed modal components to prevent text input focus loss during interactions

#### Architecture Improvements
- Extracted modal components for better component separation
- Moved async operations to useCallback hooks
- Optimized dependency arrays to prevent unnecessary re-renders
- Improved user context handling with dedicated hooks

#### Technical Stack Updates
- Integrated Jitsi Meet for cross-platform video conferencing
- Enhanced Firebase Firestore data structure for video meetings
- Improved error handling and fallback mechanisms

---

## 🚀 Deployment

### Netlify (Recommended)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Connect to Netlify:**
   - Push code to GitHub
   - Connect repo to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `build`

3. **Environment Variables:**
   - Add Firebase credentials in Netlify dashboard

### Vercel

1. **Push to GitHub**
2. **Import project in Vercel**
3. **Add environment variables**
4. **Deploy**

### Other Platforms
- **AWS Amplify**: Full-stack deployment
- **Railway**: Easy deployment
- **GitHub Pages**: Static hosting

---

## 💻 Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (one-way)
npm run eject
```

### Development Server
Runs on `http://localhost:3001` with hot reload enabled.

### Building for Production
Creates optimized build in `build/` folder with minified code and optimized assets.

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Missing or insufficient permissions" error
**Solution:**
- Verify Firestore security rules are published
- Hard refresh browser (Ctrl+F5)
- Clear browser cache
- Check you're logged in

#### 2. Firebase credentials not loading
**Solution:**
- Verify `.env` file exists with correct credentials
- Restart development server after updating .env
- Check Firebase console for project settings

#### 3. File upload fails
**Solution:**
- Check file size is within limits (1-5MB)
- Verify Firestore has enough document quota
- Check network connection

#### 4. Messages not syncing
**Solution:**
- Verify user is in chat room participants
- Check Firestore security rules
- Reload page to refresh connection

#### 5. Cannot join group
**Solution:**
- Check if group is public
- Verify you're not already a member
- Check if group is full (max members reached)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Contribution Guidelines
- Follow existing code style
- Add comments for complex logic
- Test changes before submitting
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Contact

- **Email**: support@peeriq.com
- **GitHub Issues**: [Report a bug](https://github.com/SahilVijaySingh28/PeerIQ/issues)
- **Discussions**: [Ask questions](https://github.com/SahilVijaySingh28/PeerIQ/discussions)
- **Location**: Sharda University

---

## 🙏 Acknowledgments

- Built with React and Firebase
- Design inspired by modern SaaS applications
- Icons from Lucide React
- Fonts from Google Fonts

---

## 📊 Project Stats

- **React Components**: 20+
- **Pages**: 10
- **Service APIs**: 6
- **Firestore Collections**: 6
- **Security Rules**: Comprehensive

---

**Built with ❤️ for students, by Sahil Vijay Singh**

> PeerIQ - Empowering peer-to-peer learning and collaboration
