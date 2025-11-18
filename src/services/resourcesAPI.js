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
  setDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

// File size limits (in bytes) - Smaller for Firestore storage
const FILE_SIZE_LIMITS = {
  PDF: 1 * 1024 * 1024, // 1MB
  Video: 5 * 1024 * 1024, // 5MB
  Notebook: 2 * 1024 * 1024, // 2MB
  Slide: 2 * 1024 * 1024, // 2MB
  Document: 1 * 1024 * 1024, // 1MB
};

const resourcesAPI = {
  // Upload resource to Firestore (as base64 encoded data)
  uploadResource: async (file, resourceData, userId) => {
    try {
      const resourceType = resourceData.type;
      const maxSize = FILE_SIZE_LIMITS[resourceType] || 1 * 1024 * 1024;

      // Check file size
      if (file.size > maxSize) {
        return {
          ok: false,
          error: `File size exceeds limit for ${resourceType}. Max size: ${maxSize / 1024 / 1024}MB. For larger files, please upgrade to Firebase Blaze plan.`,
        };
      }

      // Convert file to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async () => {
          try {
            const base64Data = reader.result;

            // Save resource with file data to Firestore
            const resourceMetadata = {
              title: resourceData.title,
              description: resourceData.description,
              category: resourceData.category,
              type: resourceData.type,
              tags: resourceData.tags || [],
              uploaderId: userId,
              ownerId: userId,
              uploader: resourceData.uploaderName,
              uploadDate: new Date(),
              fileName: file.name,
              fileSize: `${(file.size / 1024).toFixed(2)} KB`,
              fileType: file.type,
              fileData: base64Data, // Encoded file data
              downloads: 0,
              views: 0,
              ratings: [],
              averageRating: 0,
              reviews: [],
              thumbnail: resourceData.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
            };

            const docRef = await addDoc(collection(db, 'resources'), resourceMetadata);
            resolve({ ok: true, id: docRef.id, ...resourceMetadata });
          } catch (error) {
            reject({
              ok: false,
              error: `Failed to save resource: ${error.message}`,
            });
          }
        };

        reader.onerror = () => {
          reject({
            ok: false,
            error: 'Failed to read file',
          });
        };

        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error uploading resource:', error);
      return { ok: false, error: error.message };
    }
  },

  // Get all resources
  getAllResources: async () => {
    try {
      const q = query(collection(db, 'resources'), orderBy('uploadDate', 'desc'));
      const snapshot = await getDocs(q);
      const resources = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      return { ok: true, resources };
    } catch (error) {
      console.error('Error fetching resources:', error);
      return { ok: false, error: error.message };
    }
  },

  // Get resources by user
  getResourcesByUser: async (userId) => {
    try {
      const q = query(
        collection(db, 'resources'),
        orderBy('uploadDate', 'desc')
      );
      const snapshot = await getDocs(q);
      const resources = snapshot.docs
        .filter(doc => doc.data().uploaderId === userId)
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      return { ok: true, resources };
    } catch (error) {
      console.error('Error fetching user resources:', error);
      return { ok: false, error: error.message };
    }
  },

  // Delete resource
  deleteResource: async (resourceId, userId, fileName) => {
    try {
      // Delete file from storage
      const fileRef = ref(storage, `resources/${userId}/${fileName}`);
      await deleteObject(fileRef);

      // Delete document from Firestore
      await deleteDoc(doc(db, 'resources', resourceId));
      return { ok: true };
    } catch (error) {
      console.error('Error deleting resource:', error);
      return { ok: false, error: error.message };
    }
  },

  // Update download count
  incrementDownloads: async (resourceId) => {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      const resourceDoc = await getDoc(resourceRef);
      if (resourceDoc.exists()) {
        await updateDoc(resourceRef, {
          downloads: (resourceDoc.data().downloads || 0) + 1,
        });
      }
      return { ok: true };
    } catch (error) {
      console.error('Error updating downloads:', error);
      return { ok: false, error: error.message };
    }
  },

  // Update view count
  incrementViews: async (resourceId) => {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      const resourceDoc = await getDoc(resourceRef);
      if (resourceDoc.exists()) {
        await updateDoc(resourceRef, {
          views: (resourceDoc.data().views || 0) + 1,
        });
      }
      return { ok: true };
    } catch (error) {
      console.error('Error updating views:', error);
      return { ok: false, error: error.message };
    }
  },

  // Add rating and review
  addRating: async (resourceId, userId, rating, review) => {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      const resourceDoc = await getDoc(resourceRef);

      if (!resourceDoc.exists()) {
        return { ok: false, error: 'Resource not found' };
      }

      const currentData = resourceDoc.data();
      const ratings = currentData.ratings || [];
      const reviews = currentData.reviews || [];

      // Remove old rating/review from same user if exists
      const filteredRatings = ratings.filter(r => r.userId !== userId);
      const filteredReviews = reviews.filter(r => r.userId !== userId);

      // Add new rating and review
      filteredRatings.push({
        userId,
        rating,
        date: new Date(),
      });

      if (review) {
        filteredReviews.push({
          userId,
          review,
          date: new Date(),
        });
      }

      // Calculate average rating
      const averageRating =
        filteredRatings.reduce((sum, r) => sum + r.rating, 0) /
        filteredRatings.length;

      await updateDoc(resourceRef, {
        ratings: filteredRatings,
        reviews: filteredReviews,
        averageRating: parseFloat(averageRating.toFixed(1)),
      });

      return { ok: true };
    } catch (error) {
      console.error('Error adding rating:', error);
      return { ok: false, error: error.message };
    }
  },

  // Get resource details
  getResourceDetails: async (resourceId) => {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      const resourceDoc = await getDoc(resourceRef);

      if (!resourceDoc.exists()) {
        return { ok: false, error: 'Resource not found' };
      }

      return {
        ok: true,
        resource: {
          id: resourceDoc.id,
          ...resourceDoc.data(),
        },
      };
    } catch (error) {
      console.error('Error fetching resource details:', error);
      return { ok: false, error: error.message };
    }
  },

  // Search resources
  searchResources: async (searchQuery) => {
    try {
      const q = query(collection(db, 'resources'), orderBy('uploadDate', 'desc'));
      const snapshot = await getDocs(q);
      const resources = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(resource => {
          const query = searchQuery.toLowerCase();
          return (
            resource.title.toLowerCase().includes(query) ||
            resource.description.toLowerCase().includes(query) ||
            (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(query)))
          );
        });
      return { ok: true, resources };
    } catch (error) {
      console.error('Error searching resources:', error);
      return { ok: false, error: error.message };
    }
  },
};

export default resourcesAPI;
