import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Create a new video meeting
export const createMeeting = async (userId, userName, meetingData) => {
  try {
    const roomId = `peer-${Math.random().toString(36).substring(7)}`;
    const safeName = userName || 'Anonymous';
    
    const meeting = {
      roomId,
      title: meetingData.title,
      description: meetingData.description || '',
      hostId: userId,
      hostName: safeName,
      participants: [userId], // Store just user IDs for Firestore rules to work
      participantsList: [{ id: userId, name: safeName, joinedAt: Timestamp.now() }], // Store detailed info separately
      participantCount: 1,
      maxParticipants: meetingData.maxParticipants || 50,
      isActive: true,
      createdAt: Timestamp.now(),
      startedAt: Timestamp.now(),
      scheduledFor: meetingData.scheduledFor || null,
      category: meetingData.category || 'General',
      isPublic: meetingData.isPublic !== false,
    };

    const docRef = await addDoc(collection(db, 'videoMeetings'), meeting);
    return { id: docRef.id, ...meeting };
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

// Schedule a video meeting for later
export const scheduleMeeting = async (userId, userName, meetingData) => {
  try {
    const roomId = `peer-${Math.random().toString(36).substring(7)}`;
    const safeName = userName || 'Anonymous';
    
    const meeting = {
      roomId,
      title: meetingData.title,
      description: meetingData.description || '',
      hostId: userId,
      hostName: safeName,
      participants: [userId], // Store just user IDs for Firestore rules to work
      participantsList: [{ id: userId, name: safeName }], // Store detailed info separately
      participantCount: 1,
      maxParticipants: meetingData.maxParticipants || 50,
      isActive: false,
      createdAt: Timestamp.now(),
      scheduledFor: meetingData.scheduledFor, // Required for scheduled meetings
      category: meetingData.category || 'General',
      isPublic: meetingData.isPublic !== false,
      invitedUsers: meetingData.invitedUsers || [],
    };

    const docRef = await addDoc(collection(db, 'videoMeetings'), meeting);
    return { id: docRef.id, ...meeting };
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    throw error;
  }
};

// Get all active meetings
export const getActiveMeetings = async () => {
  try {
    const q = query(
      collection(db, 'videoMeetings'),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })).sort((a, b) => (b.startedAt?.toDate() || new Date(0)) - (a.startedAt?.toDate() || new Date(0)));
  } catch (error) {
    console.error('Error getting active meetings:', error);
    throw error;
  }
};

// Get all upcoming meetings
export const getUpcomingMeetings = async () => {
  try {
    const now = Timestamp.now();
    const q = query(
      collection(db, 'videoMeetings'),
      where('scheduledFor', '>=', now)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(meeting => meeting.isActive === false) // Filter client-side
      .sort((a, b) => (a.scheduledFor?.toDate() || new Date(0)) - (b.scheduledFor?.toDate() || new Date(0)));
  } catch (error) {
    console.error('Error getting upcoming meetings:', error);
    throw error;
  }
};

// Get user's hosted meetings
export const getUserHostedMeetings = async (userId) => {
  try {
    const q = query(
      collection(db, 'videoMeetings'),
      where('hostId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })).sort((a, b) => (b.createdAt?.toDate() || new Date(0)) - (a.createdAt?.toDate() || new Date(0)));
  } catch (error) {
    console.error('Error getting user hosted meetings:', error);
    throw error;
  }
};

// Get user's joined meetings
export const getUserJoinedMeetings = async (userId) => {
  try {
    const q = query(
      collection(db, 'videoMeetings'),
      where('participants', 'array-contains-any', [userId])
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting user joined meetings:', error);
    // Fallback: query by hosting
    return getUserHostedMeetings(userId);
  }
};

// Get public meetings by category
export const getMeetingsByCategory = async (category) => {
  try {
    const q = query(
      collection(db, 'videoMeetings'),
      where('isPublic', '==', true),
      where('category', '==', category),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })).sort((a, b) => (b.startedAt?.toDate() || new Date(0)) - (a.startedAt?.toDate() || new Date(0)));
  } catch (error) {
    console.error('Error getting meetings by category:', error);
    throw error;
  }
};

// Get meeting details
export const getMeetingDetails = async (meetingId) => {
  try {
    const docRef = doc(db, 'videoMeetings', meetingId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting meeting details:', error);
    throw error;
  }
};

// Join a meeting
export const joinMeeting = async (meetingId, userId, userName) => {
  try {
    const docRef = doc(db, 'videoMeetings', meetingId);
    const meetingSnap = await getDoc(docRef);
    
    if (!meetingSnap.exists()) {
      throw new Error('Meeting not found');
    }

    const meeting = meetingSnap.data();
    const participants = meeting.participants || [];
    const participantsList = meeting.participantsList || [];

    // Check if user already joined
    const alreadyJoined = participants.includes(userId);
    
    if (!alreadyJoined) {
      await updateDoc(docRef, {
        participants: arrayUnion(userId), // Add just the user ID
        participantsList: arrayUnion({ id: userId, name: userName, joinedAt: Timestamp.now() }), // Add detailed info
        participantCount: meeting.participantCount + 1,
      });
    }

    return getMeetingDetails(meetingId);
  } catch (error) {
    console.error('Error joining meeting:', error);
    throw error;
  }
};

// Leave a meeting
export const leaveMeeting = async (meetingId, userId) => {
  try {
    const docRef = doc(db, 'videoMeetings', meetingId);
    const meetingSnap = await getDoc(docRef);
    
    if (!meetingSnap.exists()) {
      throw new Error('Meeting not found');
    }

    const meeting = meetingSnap.data();
    const updatedParticipants = (meeting.participants || []).filter(p => p !== userId);
    const updatedParticipantsList = (meeting.participantsList || []).filter(p => p.id !== userId);

    await updateDoc(docRef, {
      participants: updatedParticipants,
      participantsList: updatedParticipantsList,
      participantCount: Math.max(0, meeting.participantCount - 1),
      isActive: updatedParticipants.length > 0 && meeting.isActive,
    });

    // Delete meeting if no participants left
    if (updatedParticipants.length === 0) {
      await deleteDoc(docRef);
    }

    return true;
  } catch (error) {
    console.error('Error leaving meeting:', error);
    throw error;
  }
};

// End meeting (host only)
export const endMeeting = async (meetingId, userId) => {
  try {
    const docRef = doc(db, 'videoMeetings', meetingId);
    const meetingSnap = await getDoc(docRef);
    
    if (!meetingSnap.exists()) {
      throw new Error('Meeting not found');
    }

    const meeting = meetingSnap.data();
    if (meeting.hostId !== userId) {
      throw new Error('Only host can end meeting');
    }

    await updateDoc(docRef, {
      isActive: false,
      endedAt: Timestamp.now(),
    });

    return true;
  } catch (error) {
    console.error('Error ending meeting:', error);
    throw error;
  }
};

// Update meeting (host only)
export const updateMeeting = async (meetingId, userId, updates) => {
  try {
    const docRef = doc(db, 'videoMeetings', meetingId);
    const meetingSnap = await getDoc(docRef);
    
    if (!meetingSnap.exists()) {
      throw new Error('Meeting not found');
    }

    const meeting = meetingSnap.data();
    if (meeting.hostId !== userId) {
      throw new Error('Only host can update meeting');
    }

    await updateDoc(docRef, updates);
    return getMeetingDetails(meetingId);
  } catch (error) {
    console.error('Error updating meeting:', error);
    throw error;
  }
};

// Delete meeting (host only)
export const deleteMeeting = async (meetingId, userId) => {
  try {
    const docRef = doc(db, 'videoMeetings', meetingId);
    const meetingSnap = await getDoc(docRef);
    
    if (!meetingSnap.exists()) {
      throw new Error('Meeting not found');
    }

    const meeting = meetingSnap.data();
    if (meeting.hostId !== userId) {
      throw new Error('Only host can delete meeting');
    }

    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting meeting:', error);
    throw error;
  }
};

// Search meetings
export const searchMeetings = async (searchTerm) => {
  try {
    const q = query(
      collection(db, 'videoMeetings'),
      where('isPublic', '==', true),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    const meetings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Client-side filtering
    return meetings.filter(meeting =>
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching meetings:', error);
    throw error;
  }
};

// Get meeting statistics
export const getMeetingStats = async (meetingId) => {
  try {
    const meeting = await getMeetingDetails(meetingId);
    if (!meeting) return null;

    return {
      totalParticipants: meeting.participantCount,
      maxParticipants: meeting.maxParticipants,
      duration: meeting.endedAt
        ? (meeting.endedAt.toDate() - meeting.startedAt.toDate()) / 1000 / 60
        : null,
      durationMinutes: meeting.endedAt
        ? Math.round((meeting.endedAt.toDate() - meeting.startedAt.toDate()) / 1000 / 60)
        : 'Ongoing',
      participants: meeting.participants || [],
    };
  } catch (error) {
    console.error('Error getting meeting stats:', error);
    throw error;
  }
};
