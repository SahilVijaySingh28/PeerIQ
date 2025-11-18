import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  setDoc,
  arrayUnion,
  updateDoc,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const messagesAPI = {
  // Send a message
  sendMessage: async (fromUserId, toUserId, messageText) => {
    try {
      // Generate chat room ID (always use the smaller ID first for consistency)
      const chatRoomId = [fromUserId, toUserId].sort().join('_');
      
      const messagesRef = collection(db, `chatRooms/${chatRoomId}/messages`);
      
      const newMessage = {
        fromUserId,
        toUserId,
        text: messageText,
        timestamp: Timestamp.now(),
        isRead: false,
      };

      const docRef = await addDoc(messagesRef, newMessage);

      // Update chat room last message
      const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
      await setDoc(chatRoomRef, {
        participants: [fromUserId, toUserId],
        lastMessage: messageText,
        lastMessageTime: Timestamp.now(),
        lastMessageFrom: fromUserId,
        updatedAt: Timestamp.now(),
      }, { merge: true });

      // Add to both users' chat list
      const fromUserRef = doc(db, 'users', fromUserId);
      const toUserRef = doc(db, 'users', toUserId);

      await updateDoc(fromUserRef, {
        chats: arrayUnion(chatRoomId),
      }).catch(() => {});

      await updateDoc(toUserRef, {
        chats: arrayUnion(chatRoomId),
      }).catch(() => {});

      return {
        ok: true,
        message: 'Message sent successfully',
        messageId: docRef.id,
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        ok: false,
        error: 'Failed to send message',
      };
    }
  },

  // Get messages between two users
  getMessages: async (userId1, userId2) => {
    try {
      const chatRoomId = [userId1, userId2].sort().join('_');
      const messagesRef = collection(db, `chatRooms/${chatRoomId}/messages`);
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const querySnapshot = await getDocs(q);
      const messages = [];

      querySnapshot.forEach(doc => {
        messages.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date(),
        });
      });

      return {
        ok: true,
        messages,
        chatRoomId,
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return {
        ok: false,
        error: 'Failed to fetch messages',
      };
    }
  },

  // Subscribe to messages in real-time
  subscribeToMessages: (userId1, userId2, callback) => {
    try {
      const chatRoomId = [userId1, userId2].sort().join('_');
      const messagesRef = collection(db, `chatRooms/${chatRoomId}/messages`);
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = [];
        querySnapshot.forEach(doc => {
          messages.push({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(),
          });
        });
        callback(messages);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      return null;
    }
  },

  // Get chat list for a user
  getChatList: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return {
          ok: false,
          error: 'User not found',
        };
      }

      const chatRoomIds = userDoc.data().chats || [];
      const chats = [];

      for (const chatRoomId of chatRoomIds) {
        const chatRef = doc(db, 'chatRooms', chatRoomId);
        const chatDoc = await getDoc(chatRef);

        if (chatDoc.exists()) {
          const [user1, user2] = chatRoomId.split('_');
          const otherUserId = user1 === userId ? user2 : user1;

          // Get other user's info
          const otherUserRef = doc(db, 'users', otherUserId);
          const otherUserDoc = await getDoc(otherUserRef);

          if (otherUserDoc.exists()) {
            chats.push({
              id: chatRoomId,
              otherUserId,
              otherUserName: otherUserDoc.data().name,
              otherUserEmail: otherUserDoc.data().email,
              otherUserAvatar: otherUserDoc.data().avatar || null,
              lastMessage: chatDoc.data().lastMessage || '',
              lastMessageTime: chatDoc.data().lastMessageTime?.toDate?.() || new Date(),
              lastMessageFrom: chatDoc.data().lastMessageFrom,
            });
          }
        }
      }

      // Sort by last message time (most recent first)
      chats.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

      return {
        ok: true,
        chats,
      };
    } catch (error) {
      console.error('Error fetching chat list:', error);
      return {
        ok: false,
        error: 'Failed to fetch chat list',
      };
    }
  },

  // Subscribe to chat list in real-time
  subscribeToChatList: (userId, callback) => {
    try {
      const userRef = doc(db, 'users', userId);

      const unsubscribe = onSnapshot(userRef, async (userDoc) => {
        if (!userDoc.exists()) {
          callback([]);
          return;
        }

        const chatRoomIds = userDoc.data().chats || [];
        const chats = [];

        for (const chatRoomId of chatRoomIds) {
          const chatRef = doc(db, 'chatRooms', chatRoomId);
          const chatDoc = await getDoc(chatRef);

          if (chatDoc.exists()) {
            const [user1, user2] = chatRoomId.split('_');
            const otherUserId = user1 === userId ? user2 : user1;

            const otherUserRef = doc(db, 'users', otherUserId);
            const otherUserDoc = await getDoc(otherUserRef);

            if (otherUserDoc.exists()) {
              chats.push({
                id: chatRoomId,
                otherUserId,
                otherUserName: otherUserDoc.data().name,
                otherUserEmail: otherUserDoc.data().email,
                otherUserAvatar: otherUserDoc.data().avatar || null,
                lastMessage: chatDoc.data().lastMessage || '',
                lastMessageTime: chatDoc.data().lastMessageTime?.toDate?.() || new Date(),
                lastMessageFrom: chatDoc.data().lastMessageFrom,
              });
            }
          }
        }

        chats.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
        callback(chats);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to chat list:', error);
      return null;
    }
  },

  // Get unread message count
  getUnreadCount: async (userId, otherUserId) => {
    try {
      const chatRoomId = [userId, otherUserId].sort().join('_');
      const messagesRef = collection(db, `chatRooms/${chatRoomId}/messages`);
      const q = query(
        messagesRef,
        where('toUserId', '==', userId),
        where('isRead', '==', false)
      );

      const querySnapshot = await getDocs(q);
      return {
        ok: true,
        unreadCount: querySnapshot.size,
      };
    } catch (error) {
      console.error('Error getting unread count:', error);
      return {
        ok: false,
        error: 'Failed to get unread count',
      };
    }
  },
};

export default messagesAPI;
