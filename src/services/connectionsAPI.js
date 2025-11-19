import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Connection status: pending, accepted, blocked
const connectionsAPI = {
  // Get all users (for discovery)
  getAllUsers: async (currentUserId) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      
      const users = [];
      querySnapshot.forEach(doc => {
        if (doc.id !== currentUserId) {
          const userData = doc.data();
          users.push({
            id: doc.id,
            ...userData,
            displayName: userData.displayName || userData.name || 'Unknown User',
            name: userData.displayName || userData.name || 'Unknown User',
          });
        }
      });
      
      return {
        ok: true,
        users: users,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        ok: false,
        error: 'Failed to fetch users',
      };
    }
  },

  // Send connection request
  sendConnectionRequest: async (fromUserId, toUserId) => {
    try {
      const connectionsRef = doc(db, 'connections', `${fromUserId}_${toUserId}`);
      
      // Create connection document first
      await setDoc(connectionsRef, {
        fromUserId,
        toUserId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Add to sender's sent requests
      const senderRef = doc(db, 'users', fromUserId);
      try {
        await updateDoc(senderRef, {
          sentRequests: arrayUnion(toUserId),
        });
      } catch (err) {
        console.error('Error updating sender sentRequests:', err);
        // Create field if it doesn't exist
        await setDoc(senderRef, {
          sentRequests: [toUserId],
        }, { merge: true });
      }

      // Add to receiver's received requests
      const receiverRef = doc(db, 'users', toUserId);
      try {
        await updateDoc(receiverRef, {
          receivedRequests: arrayUnion(fromUserId),
        });
      } catch (err) {
        console.error('Error updating receiver receivedRequests:', err);
        // Create field if it doesn't exist
        await setDoc(receiverRef, {
          receivedRequests: [fromUserId],
        }, { merge: true });
      }

      return {
        ok: true,
        message: 'Connection request sent',
      };
    } catch (error) {
      console.error('Error sending connection request:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Check if it's a permissions error
      if (error.code === 'permission-denied') {
        return {
          ok: false,
          error: 'Permission denied. Check Firestore security rules are configured. See FIREBASE_QUICK_FIX.md',
        };
      }
      
      return {
        ok: false,
        error: error.message || 'Failed to send connection request',
      };
    }
  },

  // Accept connection request
  acceptConnectionRequest: async (fromUserId, toUserId) => {
    try {
      const connectionsRef = doc(db, 'connections', `${fromUserId}_${toUserId}`);
      
      console.log('[acceptConnectionRequest] Updating connection status to accepted');
      await updateDoc(connectionsRef, {
        status: 'accepted',
        updatedAt: new Date().toISOString(),
      });

      // Add to both users' connections
      const fromUserRef = doc(db, 'users', fromUserId);
      const toUserRef = doc(db, 'users', toUserId);

      console.log('[acceptConnectionRequest] Updating sender (fromUser) document');
      try {
        await updateDoc(fromUserRef, {
          connections: arrayUnion(toUserId),
          sentRequests: arrayRemove(toUserId),
          receivedRequests: arrayRemove(toUserId),
        });
      } catch (err) {
        console.error('Error updating fromUser:', err);
        await setDoc(fromUserRef, {
          connections: [toUserId],
          sentRequests: [],
          receivedRequests: [],
        }, { merge: true });
      }

      console.log('[acceptConnectionRequest] Updating receiver (toUser) document');
      try {
        await updateDoc(toUserRef, {
          connections: arrayUnion(fromUserId),
          sentRequests: arrayRemove(fromUserId),
          receivedRequests: arrayRemove(fromUserId),
        });
      } catch (err) {
        console.error('Error updating toUser:', err);
        await setDoc(toUserRef, {
          connections: [fromUserId],
          sentRequests: [],
          receivedRequests: [],
        }, { merge: true });
      }

      console.log('[acceptConnectionRequest] Accept successful');
      return {
        ok: true,
        message: 'Connection request accepted',
      };
    } catch (error) {
      console.error('Error accepting connection request:', error);
      return {
        ok: false,
        error: 'Failed to accept connection request',
      };
    }
  },

  // Reject connection request
  rejectConnectionRequest: async (fromUserId, toUserId) => {
    try {
      const connectionsRef = doc(db, 'connections', `${fromUserId}_${toUserId}`);
      await deleteDoc(connectionsRef);

      // Remove from receiver's received requests
      const toUserRef = doc(db, 'users', toUserId);
      try {
        await updateDoc(toUserRef, {
          receivedRequests: arrayRemove(fromUserId),
        });
      } catch (err) {
        console.error('Error updating toUser receivedRequests:', err);
      }

      // Remove from sender's sent requests
      const fromUserRef = doc(db, 'users', fromUserId);
      try {
        await updateDoc(fromUserRef, {
          sentRequests: arrayRemove(toUserId),
        });
      } catch (err) {
        console.error('Error updating fromUser sentRequests:', err);
      }

      return {
        ok: true,
        message: 'Connection request rejected',
      };
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      return {
        ok: false,
        error: 'Failed to reject connection request',
      };
    }
  },

  // Cancel sent request
  cancelConnectionRequest: async (fromUserId, toUserId) => {
    try {
      const connectionsRef = doc(db, 'connections', `${fromUserId}_${toUserId}`);
      await deleteDoc(connectionsRef);

      // Remove from both users' request lists
      const fromUserRef = doc(db, 'users', fromUserId);
      const toUserRef = doc(db, 'users', toUserId);

      try {
        await updateDoc(fromUserRef, {
          sentRequests: arrayRemove(toUserId),
        });
      } catch (err) {
        console.error('Error updating sender sentRequests:', err);
      }

      try {
        await updateDoc(toUserRef, {
          receivedRequests: arrayRemove(fromUserId),
        });
      } catch (err) {
        console.error('Error updating receiver receivedRequests:', err);
      }

      return {
        ok: true,
        message: 'Connection request cancelled',
      };
    } catch (error) {
      console.error('Error cancelling connection request:', error);
      return {
        ok: false,
        error: 'Failed to cancel connection request',
      };
    }
  },

  // Get user's connections
  getUserConnections: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.warn(`User document doesn't exist for ${userId}, initializing...`);
        // Initialize user document with empty arrays
        await setDoc(userRef, {
          connections: [],
          sentRequests: [],
          receivedRequests: [],
          chats: [],
        }, { merge: true });
        
        return {
          ok: true,
          connections: [],
          sentRequests: [],
          receivedRequests: [],
        };
      }

      const userData = userDoc.data();
      const connections = userData.connections || [];
      const sentRequests = userData.sentRequests || [];
      const receivedRequests = userData.receivedRequests || [];

      console.log(`[getUserConnections] User: ${userId}`, {
        connections,
        sentRequests,
        receivedRequests,
      });

      return {
        ok: true,
        connections,
        sentRequests,
        receivedRequests,
      };
    } catch (error) {
      console.error('Error fetching user connections:', error);
      return {
        ok: false,
        error: 'Failed to fetch connections',
      };
    }
  },

  // Get user's connection status with another user
  getConnectionStatus: async (userId, targetUserId) => {
    try {
      // Check direct connection
      const directRef = doc(db, 'connections', `${userId}_${targetUserId}`);
      const directSnap = await getDoc(directRef);

      if (directSnap.exists()) {
        return {
          ok: true,
          status: directSnap.data().status,
        };
      }

      // Check reverse connection
      const reverseRef = doc(db, 'connections', `${targetUserId}_${userId}`);
      const reverseSnap = await getDoc(reverseRef);

      if (reverseSnap.exists()) {
        return {
          ok: true,
          status: reverseSnap.data().status,
        };
      }

      return {
        ok: true,
        status: 'none',
      };
    } catch (error) {
      console.error('Error checking connection status:', error);
      return {
        ok: false,
        error: 'Failed to check connection status',
      };
    }
  },

  // Remove connection
  removeConnection: async (userId, targetUserId) => {
    try {
      // Remove the connection documents
      const directRef = doc(db, 'connections', `${userId}_${targetUserId}`);
      const reverseRef = doc(db, 'connections', `${targetUserId}_${userId}`);

      await deleteDoc(directRef).catch(() => {});
      await deleteDoc(reverseRef).catch(() => {});

      // Remove from both users' connections
      const userRef = doc(db, 'users', userId);
      const targetUserRef = doc(db, 'users', targetUserId);

      await updateDoc(userRef, {
        connections: arrayRemove(targetUserId),
      });

      await updateDoc(targetUserRef, {
        connections: arrayRemove(userId),
      });

      return {
        ok: true,
        message: 'Connection removed',
      };
    } catch (error) {
      console.error('Error removing connection:', error);
      return {
        ok: false,
        error: 'Failed to remove connection',
      };
    }
  },
};

export default connectionsAPI;
