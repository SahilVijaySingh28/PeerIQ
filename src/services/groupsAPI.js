import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  getDoc,
  arrayUnion,
  arrayRemove,
  where,
  increment,
} from 'firebase/firestore';

const groupsAPI = {
  // Create a new group
  createGroup: async (groupData, userId) => {
    try {
      const groupMetadata = {
        name: groupData.name,
        description: groupData.description,
        category: groupData.category,
        maxMembers: groupData.maxMembers,
        topics: groupData.topics || [],
        isPublic: groupData.isPublic,
        creatorId: userId,
        creatorName: groupData.creatorName,
        members: [userId],
        createdAt: new Date(),
        avatar: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
      };

      const docRef = await addDoc(collection(db, 'groups'), groupMetadata);
      return { ok: true, id: docRef.id, ...groupMetadata };
    } catch (error) {
      console.error('Error creating group:', error);
      return { ok: false, error: error.message };
    }
  },

  // Get all groups
  getAllGroups: async () => {
    try {
      const q = query(collection(db, 'groups'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const groups = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      return { ok: true, groups };
    } catch (error) {
      console.error('Error fetching groups:', error);
      return { ok: false, error: error.message, groups: [] };
    }
  },

  // Get user's groups
  getUserGroups: async (userId) => {
    try {
      const q = query(collection(db, 'groups'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const groups = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(group => group.members?.includes(userId));
      return { ok: true, groups };
    } catch (error) {
      console.error('Error fetching user groups:', error);
      return { ok: false, error: error.message, groups: [] };
    }
  },

  // Join a group
  joinGroup: async (groupId, userId) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        return { ok: false, error: 'Group not found' };
      }

      const groupData = groupDoc.data();
      const members = groupData.members || [];

      // Check if already a member
      if (members.includes(userId)) {
        return { ok: false, error: 'You are already a member of this group' };
      }

      // Check if group is full
      if (members.length >= groupData.maxMembers) {
        return { ok: false, error: 'Group is full' };
      }

      // Add user to group
      await updateDoc(groupRef, {
        members: arrayUnion(userId),
      });

      return { ok: true };
    } catch (error) {
      console.error('Error joining group:', error);
      return { ok: false, error: error.message };
    }
  },

  // Leave a group
  leaveGroup: async (groupId, userId) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        return { ok: false, error: 'Group not found' };
      }

      const groupData = groupDoc.data();

      // If user is the creator, they can't leave (must delete group)
      if (groupData.creatorId === userId) {
        return { ok: false, error: 'Group creator cannot leave. Delete the group instead.' };
      }

      // Remove user from group
      await updateDoc(groupRef, {
        members: arrayRemove(userId),
      });

      return { ok: true };
    } catch (error) {
      console.error('Error leaving group:', error);
      return { ok: false, error: error.message };
    }
  },

  // Delete a group
  deleteGroup: async (groupId, userId) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        return { ok: false, error: 'Group not found' };
      }

      const groupData = groupDoc.data();

      // Only creator can delete
      if (groupData.creatorId !== userId) {
        return { ok: false, error: 'Only group creator can delete the group' };
      }

      // Delete group
      await deleteDoc(groupRef);

      return { ok: true };
    } catch (error) {
      console.error('Error deleting group:', error);
      return { ok: false, error: error.message };
    }
  },

  // Get group details
  getGroupDetails: async (groupId) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        return { ok: false, error: 'Group not found' };
      }

      return { ok: true, group: { id: groupDoc.id, ...groupDoc.data() } };
    } catch (error) {
      console.error('Error fetching group details:', error);
      return { ok: false, error: error.message };
    }
  },

  // Update group
  updateGroup: async (groupId, userId, updates) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        return { ok: false, error: 'Group not found' };
      }

      const groupData = groupDoc.data();

      // Only creator can update
      if (groupData.creatorId !== userId) {
        return { ok: false, error: 'Only group creator can update the group' };
      }

      // Update group
      await updateDoc(groupRef, updates);

      return { ok: true };
    } catch (error) {
      console.error('Error updating group:', error);
      return { ok: false, error: error.message };
    }
  },

  // Search groups
  searchGroups: async (searchQuery) => {
    try {
      const q = query(collection(db, 'groups'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const groups = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(group => {
          const matchesSearch =
            group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (group.topics && group.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase())));
          return matchesSearch;
        });
      return { ok: true, groups };
    } catch (error) {
      console.error('Error searching groups:', error);
      return { ok: false, error: error.message, groups: [] };
    }
  },

  // Post announcement to group
  postAnnouncement: async (groupId, userId, userName, title, content) => {
    try {
      const announcement = {
        groupId,
        authorId: userId,
        authorName: userName,
        title,
        content,
        createdAt: new Date(),
        likes: [],
        comments: [],
      };

      const docRef = await addDoc(collection(db, 'announcements'), announcement);
      return { ok: true, id: docRef.id, ...announcement };
    } catch (error) {
      console.error('Error posting announcement:', error);
      return { ok: false, error: error.message };
    }
  },

  // Get group announcements
  getGroupAnnouncements: async (groupId) => {
    try {
      const q = query(
        collection(db, 'announcements'),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const announcements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      return { ok: true, announcements };
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return { ok: false, error: error.message, announcements: [] };
    }
  },

  // Like/Unlike announcement
  toggleAnnouncementLike: async (announcementId, userId) => {
    try {
      const announcementRef = doc(db, 'announcements', announcementId);
      const announcementDoc = await getDoc(announcementRef);

      if (!announcementDoc.exists()) {
        return { ok: false, error: 'Announcement not found' };
      }

      const likes = announcementDoc.data().likes || [];
      const isLiked = likes.includes(userId);

      if (isLiked) {
        await updateDoc(announcementRef, {
          likes: arrayRemove(userId),
        });
      } else {
        await updateDoc(announcementRef, {
          likes: arrayUnion(userId),
        });
      }

      return { ok: true, liked: !isLiked };
    } catch (error) {
      console.error('Error toggling like:', error);
      return { ok: false, error: error.message };
    }
  },

  // Add comment to announcement
  addAnnouncementComment: async (announcementId, userId, userName, comment) => {
    try {
      const announcementRef = doc(db, 'announcements', announcementId);
      const announcementDoc = await getDoc(announcementRef);

      if (!announcementDoc.exists()) {
        return { ok: false, error: 'Announcement not found' };
      }

      const newComment = {
        id: `${userId}_${Date.now()}`,
        authorId: userId,
        authorName: userName,
        text: comment,
        createdAt: new Date(),
      };

      await updateDoc(announcementRef, {
        comments: arrayUnion(newComment),
      });

      return { ok: true, comment: newComment };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { ok: false, error: error.message };
    }
  },

  // Delete announcement (only author or creator)
  deleteAnnouncement: async (announcementId, userId, groupId) => {
    try {
      const announcementRef = doc(db, 'announcements', announcementId);
      const announcementDoc = await getDoc(announcementRef);

      if (!announcementDoc.exists()) {
        return { ok: false, error: 'Announcement not found' };
      }

      const announcementData = announcementDoc.data();
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);
      const groupData = groupDoc.data();

      // Only author or group creator can delete
      if (announcementData.authorId !== userId && groupData.creatorId !== userId) {
        return { ok: false, error: 'Permission denied' };
      }

      await deleteDoc(announcementRef);
      return { ok: true };
    } catch (error) {
      console.error('Error deleting announcement:', error);
      return { ok: false, error: error.message };
    }
  },

  // Get member list with details
  getGroupMembers: async (groupId) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        return { ok: false, error: 'Group not found' };
      }

      const memberIds = groupDoc.data().members || [];
      const members = [];

      for (const memberId of memberIds) {
        const userRef = doc(db, 'users', memberId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const displayName = userData.displayName || userData.name || 'Unknown';
          members.push({
            id: memberId,
            name: displayName,
            displayName: displayName,
            avatar: userData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`,
            email: userData.email || '',
            isCreator: groupDoc.data().creatorId === memberId,
          });
        }
      }

      return { ok: true, members };
    } catch (error) {
      console.error('Error fetching members:', error);
      return { ok: false, error: error.message, members: [] };
    }
  },

  // Remove member from group (creator only)
  removeMember: async (groupId, memberId, userId) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        return { ok: false, error: 'Group not found' };
      }

      const groupData = groupDoc.data();

      // Only creator can remove members
      if (groupData.creatorId !== userId) {
        return { ok: false, error: 'Only group creator can remove members' };
      }

      // Can't remove the creator
      if (memberId === groupData.creatorId) {
        return { ok: false, error: 'Cannot remove group creator' };
      }

      await updateDoc(groupRef, {
        members: arrayRemove(memberId),
      });

      return { ok: true };
    } catch (error) {
      console.error('Error removing member:', error);
      return { ok: false, error: error.message };
    }
  },

  // Get group activity/stats
  getGroupStats: async (groupId) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        return { ok: false, error: 'Group not found' };
      }

      const groupData = groupDoc.data();
      const q = query(
        collection(db, 'announcements'),
        where('groupId', '==', groupId)
      );
      const announcementsSnapshot = await getDocs(q);

      return {
        ok: true,
        stats: {
          memberCount: groupData.members?.length || 0,
          maxMembers: groupData.maxMembers,
          announcementCount: announcementsSnapshot.size,
          createdAt: groupData.createdAt,
          isPublic: groupData.isPublic,
          category: groupData.category,
        },
      };
    } catch (error) {
      console.error('Error fetching group stats:', error);
      return { ok: false, error: error.message, stats: {} };
    }
  },

  // Get public groups only
  getPublicGroups: async () => {
    try {
      const q = query(
        collection(db, 'groups'),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const groups = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      return { ok: true, groups };
    } catch (error) {
      console.error('Error fetching public groups:', error);
      return { ok: false, error: error.message, groups: [] };
    }
  },

  // Filter groups by category
  getGroupsByCategory: async (category) => {
    try {
      const q = query(
        collection(db, 'groups'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const groups = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      return { ok: true, groups };
    } catch (error) {
      console.error('Error fetching groups by category:', error);
      return { ok: false, error: error.message, groups: [] };
    }
  },
};

export default groupsAPI;
