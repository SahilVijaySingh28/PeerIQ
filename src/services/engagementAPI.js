import { db } from '../config/firebase';
import {
  collection,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

class EngagementAPI {
  /**
   * Add or remove a like from a resource
   */
  async toggleResourceLike(resourceId, userId) {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      const resourceDoc = await getDoc(resourceRef);

      if (!resourceDoc.exists()) {
        return { ok: false, error: 'Resource not found' };
      }

      const resource = resourceDoc.data();
      const likes = resource.likes || [];
      const hasLiked = likes.includes(userId);

      if (hasLiked) {
        await updateDoc(resourceRef, {
          likes: arrayRemove(userId),
        });
      } else {
        await updateDoc(resourceRef, {
          likes: arrayUnion(userId),
        });
      }

      return {
        ok: true,
        liked: !hasLiked,
        likes: hasLiked ? likes.length - 1 : likes.length + 1,
      };
    } catch (error) {
      console.error('Error toggling resource like:', error);
      return { ok: false, error: error.message };
    }
  }

  /**
   * Add a comment to a resource
   */
  async addResourceComment(resourceId, userId, userName, comment) {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      const commentData = {
        id: `${Date.now()}`,
        userId,
        userName,
        text: comment,
        createdAt: new Date(),
      };

      await updateDoc(resourceRef, {
        comments: arrayUnion(commentData),
      });

      return { ok: true, comment: commentData };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { ok: false, error: error.message };
    }
  }

  /**
   * Delete a comment from a resource
   */
  async deleteResourceComment(resourceId, commentId) {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      const resourceDoc = await getDoc(resourceRef);

      if (!resourceDoc.exists()) {
        return { ok: false, error: 'Resource not found' };
      }

      const resource = resourceDoc.data();
      const comment = resource.comments?.find(c => c.id === commentId);

      if (!comment) {
        return { ok: false, error: 'Comment not found' };
      }

      await updateDoc(resourceRef, {
        comments: arrayRemove(comment),
      });

      return { ok: true };
    } catch (error) {
      console.error('Error deleting comment:', error);
      return { ok: false, error: error.message };
    }
  }

  /**
   * Add a rating and review to a resource
   */
  async addResourceRating(resourceId, userId, userName, rating, review = '') {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      const ratingData = {
        id: `${Date.now()}`,
        userId,
        userName,
        rating: Math.min(Math.max(rating, 1), 5), // Ensure rating is between 1-5
        review,
        createdAt: new Date(),
      };

      await updateDoc(resourceRef, {
        ratings: arrayUnion(ratingData),
      });

      // Calculate new average rating
      const resourceDoc = await getDoc(resourceRef);
      const resource = resourceDoc.data();
      const ratings = resource.ratings || [];
      const allRatings = [...ratings, ratingData];
      const averageRating =
        allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

      await updateDoc(resourceRef, {
        averageRating: Math.round(averageRating * 10) / 10,
      });

      return {
        ok: true,
        rating: ratingData,
        averageRating: Math.round(averageRating * 10) / 10,
      };
    } catch (error) {
      console.error('Error adding rating:', error);
      return { ok: false, error: error.message };
    }
  }

  /**
   * Toggle like on an announcement
   */
  async toggleAnnouncementLike(announcementId, userId) {
    try {
      const announcementRef = doc(db, 'announcements', announcementId);
      const announcementDoc = await getDoc(announcementRef);

      if (!announcementDoc.exists()) {
        return { ok: false, error: 'Announcement not found' };
      }

      const announcement = announcementDoc.data();
      const likes = announcement.likes || [];
      const hasLiked = likes.includes(userId);

      if (hasLiked) {
        await updateDoc(announcementRef, {
          likes: arrayRemove(userId),
        });
      } else {
        await updateDoc(announcementRef, {
          likes: arrayUnion(userId),
        });
      }

      return {
        ok: true,
        liked: !hasLiked,
        likes: hasLiked ? likes.length - 1 : likes.length + 1,
      };
    } catch (error) {
      console.error('Error toggling announcement like:', error);
      return { ok: false, error: error.message };
    }
  }

  /**
   * Add a comment to an announcement
   */
  async addAnnouncementComment(announcementId, userId, userName, comment) {
    try {
      const announcementRef = doc(db, 'announcements', announcementId);
      const commentData = {
        id: `${Date.now()}`,
        userId,
        userName,
        text: comment,
        createdAt: new Date(),
      };

      await updateDoc(announcementRef, {
        comments: arrayUnion(commentData),
      });

      return { ok: true, comment: commentData };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { ok: false, error: error.message };
    }
  }

  /**
   * Delete a comment from an announcement
   */
  async deleteAnnouncementComment(announcementId, commentId) {
    try {
      const announcementRef = doc(db, 'announcements', announcementId);
      const announcementDoc = await getDoc(announcementRef);

      if (!announcementDoc.exists()) {
        return { ok: false, error: 'Announcement not found' };
      }

      const announcement = announcementDoc.data();
      const comment = announcement.comments?.find(c => c.id === commentId);

      if (!comment) {
        return { ok: false, error: 'Comment not found' };
      }

      await updateDoc(announcementRef, {
        comments: arrayRemove(comment),
      });

      return { ok: true };
    } catch (error) {
      console.error('Error deleting comment:', error);
      return { ok: false, error: error.message };
    }
  }

  /**
   * Toggle like on a comment in an announcement
   */
  async toggleAnnouncementCommentLike(announcementId, commentId, userId) {
    try {
      const announcementRef = doc(db, 'announcements', announcementId);
      const announcementDoc = await getDoc(announcementRef);

      if (!announcementDoc.exists()) {
        return { ok: false, error: 'Announcement not found' };
      }

      const announcement = announcementDoc.data();
      const comments = announcement.comments || [];
      const commentIndex = comments.findIndex(c => c.id === commentId);

      if (commentIndex === -1) {
        return { ok: false, error: 'Comment not found' };
      }

      const comment = comments[commentIndex];
      const likes = comment.likes || [];
      const hasLiked = likes.includes(userId);

      // Update the specific comment with the new likes array
      const updatedComments = [...comments];
      updatedComments[commentIndex] = {
        ...comment,
        likes: hasLiked ? likes.filter(id => id !== userId) : [...likes, userId],
      };

      await updateDoc(announcementRef, {
        comments: updatedComments,
      });

      return {
        ok: true,
        liked: !hasLiked,
        likes: hasLiked ? likes.length - 1 : likes.length + 1,
      };
    } catch (error) {
      console.error('Error toggling comment like:', error);
      return { ok: false, error: error.message };
    }
  }

  /**
   * Get user's rating for a resource
   */
  async getUserResourceRating(resourceId, userId) {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      const resourceDoc = await getDoc(resourceRef);

      if (!resourceDoc.exists()) {
        return null;
      }

      const resource = resourceDoc.data();
      const userRating = resource.ratings?.find(r => r.userId === userId);
      return userRating || null;
    } catch (error) {
      console.error('Error fetching user rating:', error);
      return null;
    }
  }

  /**
   * Check if user liked a resource
   */
  async hasUserLikedResource(resourceId, userId) {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      const resourceDoc = await getDoc(resourceRef);

      if (!resourceDoc.exists()) {
        return false;
      }

      const resource = resourceDoc.data();
      return (resource.likes || []).includes(userId);
    } catch (error) {
      console.error('Error checking resource like:', error);
      return false;
    }
  }
}

const engagementAPI = new EngagementAPI();
export default engagementAPI;
