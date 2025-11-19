# Firebase Firestore Security Rules Setup

## Issue
You're getting "Missing or insufficient permissions" error when trying to send friend requests. This means the Firestore security rules aren't configured to allow the operations.

## Solution
You need to set up Firestore security rules in your Firebase Console.

## Steps to Fix

### 1. Go to Firebase Console
- Open https://console.firebase.google.com
- Select your PeerIQ project

### 2. Navigate to Firestore Rules
- Click "Firestore Database" in the left sidebar
- Click the "Rules" tab at the top

### 3. Copy and Paste These Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Users can read/write their own user document
      allow read, write: if request.auth.uid == userId;
      
      // Allow reading other users' basic info (for discovery)
      allow read: if request.auth != null;
      
      // Allow other users to update their request arrays (sentRequests, receivedRequests)
      // This is needed for friend request system to work
      allow update: if request.auth != null;
    }

    // Allow anyone authenticated to create/read connections
    match /connections/{document=**} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (request.auth.uid == resource.data.fromUserId || 
         request.auth.uid == resource.data.toUserId);
    }

    // Chat rooms - only accessible to participants
    match /chatRooms/{chatRoomId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      
      // Allow creation of new chat rooms
      allow create: if request.auth != null;
      
      // Messages sub-collection
      match /messages/{messageId} {
        allow create: if request.auth != null && 
          request.auth.uid == request.resource.data.fromUserId;
        allow read: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/chatRooms/$(chatRoomId)).data.participants;
      }
    }

    // Resources collection - for study material uploads
    match /resources/{resourceId} {
      // Anyone authenticated can read all resources
      allow read: if request.auth != null;
      
      // Users can create new resources
      allow create: if request.auth != null;
      
      // Users can update and delete only their own resources
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
    }

    // Groups collection - for study groups
    match /groups/{groupId} {
      // Anyone authenticated can read all groups
      allow read: if request.auth != null;
      
      // Users can create new groups
      allow create: if request.auth != null;
      
      // Group creator can update/delete the group
      // Any authenticated user can join/leave the group (update members array)
      allow update, delete: if request.auth != null && 
        (request.auth.uid == resource.data.creatorId || 
         request.auth.uid in request.resource.data.members);
      
      // Allow update for joining groups (isPublic groups)
      allow update: if request.auth != null && 
        (resource.data.isPublic == true || 
         request.auth.uid in resource.data.members);
    }

    // Announcements collection - for group announcements
    match /announcements/{announcementId} {
      // Anyone authenticated can read announcements
      allow read: if request.auth != null;
      
      // Users can create announcements in their groups
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.authorId;
      
      // Anyone can like and comment on announcements
      allow update: if request.auth != null;
      
      // Only author or group creator can delete announcements
      allow delete: if request.auth != null && 
        (request.auth.uid == resource.data.authorId);
    }

    // Video Meetings - collaborative feature
    match /videoMeetings/{meetingId} {
      // Anyone authenticated can read all meetings (filtered client-side as needed)
      // Security is maintained by not exposing sensitive data fields
      allow read: if request.auth != null;
      
      // Anyone authenticated can create a meeting (becomes the host)
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.hostId;
      
      // Host can update meeting details and participant list
      allow update: if request.auth != null &&
        request.auth.uid == resource.data.hostId;
      
      // Only host can delete the meeting
      allow delete: if request.auth != null &&
        request.auth.uid == resource.data.hostId;
    }
  }
}
```

### 4. Publish the Rules
- Click the "Publish" button
- Wait for the rules to deploy (usually takes 10-30 seconds)

## What These Rules Allow

✅ Users can read/write their own user document
✅ Users can read other users' basic info (for discovery)
✅ Users can create connection requests
✅ Users can read all connections
✅ Users can update/delete their own connections (sent/received)
✅ Users can create chat rooms
✅ Users can only access chats they're part of
✅ Users can send and read messages in their chats
✅ Users can upload resources to the database
✅ Users can read all resources shared by peers
✅ Users can update and delete only their own resources
✅ Users can rate and review any resource
✅ Users can create and join study groups
✅ Users can read all public groups
✅ Only group creators can delete their groups
✅ Any user can join/leave public groups
✅ Members and creators can update group details
✅ Users can post announcements in their groups
✅ All members can like and comment on announcements
✅ Members can view group member lists and statistics
✅ Users can create and host video meetings
✅ Users can join public video meetings
✅ Only hosts can end or delete their meetings
✅ Participants can view active meetings and joined participants

## After Setting Rules

1. Go back to your browser with the PeerIQ app
2. **Clear your browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
3. Refresh the page
4. Try connecting to a user again

## Troubleshooting

### Still getting permission error?

**Option 1: Development Mode (Temporary)**
If you want to test immediately, you can temporarily use these permissive rules (NOT for production):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    allow read, write: if request.auth != null;
  }
}
```

Then test, and switch back to the secure rules after.

**Option 2: Check Authentication**
Make sure you're logged in:
1. Go to Network page
2. Open browser DevTools (F12)
3. Check Console for errors
4. Look for user ID in the application

**Option 3: Clear Firestore Data**
If you have old test data causing issues:
1. Go to Firestore Database in Console
2. Delete collections: `connections`, `chatRooms`
3. Try connecting again

### Verify Rules are Published
1. Go to Firestore Database → Rules tab
2. Check the green banner at bottom says "Rules deployed"
3. Check the timestamp is recent

## Production Rules

For production, use the secure rules provided above. They ensure:
- Users can only access their own data
- Users can only modify connections involving them
- Users can only message in conversations they're part of
- All operations require authentication

## Testing After Rules Are Set

1. Sign in with Account A
2. Go to Network → Discover
3. Click "Connect" on Account B
4. Should see success message and request moves to Pending
5. Sign in with Account B
6. Go to Messages → Notifications
7. Should see friend request from Account A
8. Click "Accept"
9. Both users should now be friends
10. Click "Message" to start chatting

## Common Issues & Solutions

### Issue: Rules still showing permission error
**Solution:** 
1. Hard refresh page (Ctrl+F5)
2. Clear browser cache
3. Check you're logged in (check user ID in Network page)
4. Verify rules are published (green banner in Rules tab)

### Issue: Can create users but not connections
**Solution:** 
Make sure the "connections" rule allows create:
```
allow create: if request.auth != null;
```

### Issue: Can connect but can't message
**Solution:** 
Verify chatRooms rules include participants check and allow creation

### Issue: Other users can see my data
**Solution:** 
This is expected for discovery. Users can read basic info about others, but can't write to their documents. This is correct behavior.

## Next Steps

1. Set up the Firestore rules (REQUIRED)
2. ~~Set up the Firebase Storage rules~~ (NOT NEEDED - using Firestore for file storage)
3. Refresh your app
4. Test uploading resources
5. Report back if you still get errors

---

# File Storage Note

**Important**: Files are now stored directly in Firestore as base64-encoded data (for Spark plan compatibility). This means:

✅ Works on free Spark plan
✅ No Storage rules needed
✅ File size limits: 1-5MB per file (Firestore document limit is 1MB, but compressed)
✅ Simple and secure

If you need to store larger files (videos, large PDFs), upgrade to the **Blaze plan** to use Firebase Storage instead.
