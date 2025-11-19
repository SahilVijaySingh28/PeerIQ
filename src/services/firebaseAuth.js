import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Helper function to generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Helper function to create user document in Firestore
const createUserDocument = async (userId, email, name) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      id: userId,
      email,
      name,
      displayName: name, // Store displayName for profile display
      photoURL: null, // Initialize with null for profile photo
      department: null, // Initialize for later updates
      emailVerified: false,
      collegeEmail: null,
      badges: [], // Initialize badges array
      points: 0, // Initialize points
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

// Helper function to get user document
const getUserDocument = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user document:', error);
    throw error;
  }
};

// Generate simple token
const generateToken = (userId) => {
  return btoa(`${userId}:${Date.now()}`);
};

// Firebase Authentication APIs
export const authAPI = {
  // Register/Signup
  signup: async ({ email, password, name }) => {
    try {
      // Set persistence before signup
      await setPersistence(auth, browserLocalPersistence);

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const userId = userCredential.user.uid;

      // Create user document in Firestore
      await createUserDocument(userId, email, name);

      // Generate token
      const token = generateToken(userId);

      return {
        ok: true,
        user: {
          id: userId,
          email,
          name,
          displayName: name,
          photoURL: null,
          department: null,
          emailVerified: false,
        },
        token,
      };
    } catch (error) {
      let errorMessage = 'Signup failed';

      console.error('Signup error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already registered';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.message && error.message.includes('permission')) {
        errorMessage = 'Permission denied - Please check Firestore security rules';
        console.error('Firestore permission error - Check your security rules');
      }

      return {
        ok: false,
        error: errorMessage,
      };
    }
  },

  // Login
  login: async ({ email, password }) => {
    try {
      // Set persistence before login
      await setPersistence(auth, browserLocalPersistence);

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Get user document from Firestore
      const userDoc = await getUserDocument(userId);

      if (!userDoc) {
        return {
          ok: false,
          error: 'User profile not found',
        };
      }

      // Generate token
      const token = generateToken(userId);

      return {
        ok: true,
        user: {
          id: userId,
          email: userDoc.email,
          name: userDoc.name,
          displayName: userDoc.displayName || userDoc.name,
          photoURL: userDoc.photoURL || null,
          department: userDoc.department || null,
          emailVerified: userDoc.emailVerified,
          collegeEmail: userDoc.collegeEmail,
        },
        token,
      };
    } catch (error) {
      let errorMessage = 'Login failed';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }

      return {
        ok: false,
        error: errorMessage,
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      await signOut(auth);
      return { ok: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { ok: true }; // Still logout locally
    }
  },

  // Send OTP for email verification
  sendOtp: async (email, userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const otp = generateOTP();

      // Store OTP with expiration (5 minutes)
      await updateDoc(userRef, {
        otp: otp,
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log(`📧 OTP for ${email}: ${otp}`);

      return {
        ok: true,
        message: `OTP sent to ${email}. Check your browser console for the OTP.`,
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        ok: false,
        error: 'Failed to send OTP',
      };
    }
  },

  // Verify email with OTP
  verifyEmail: async (email, otp, userId) => {
    try {
      // Get user document
      const userDoc = await getUserDocument(userId);

      if (!userDoc) {
        return {
          ok: false,
          error: 'User not found',
        };
      }

      // Check OTP
      if (userDoc.otp !== otp) {
        return {
          ok: false,
          error: 'Invalid OTP',
        };
      }

      // Check OTP expiration
      if (new Date() > new Date(userDoc.otpExpiresAt)) {
        return {
          ok: false,
          error: 'OTP has expired',
        };
      }

      // Update user document - mark email as verified
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        emailVerified: true,
        collegeEmail: email,
        otp: null,
        otpExpiresAt: null,
        updatedAt: new Date().toISOString(),
      });

      return {
        ok: true,
        user: {
          id: userId,
          email: userDoc.email,
          name: userDoc.name,
          displayName: userDoc.displayName || userDoc.name,
          photoURL: userDoc.photoURL || null,
          department: userDoc.department || null,
          collegeEmail: email,
          emailVerified: true,
        },
      };
    } catch (error) {
      console.error('Error verifying email:', error);
      return {
        ok: false,
        error: 'Email verification failed',
      };
    }
  },

  // Get user profile
  getProfile: async (userId) => {
    try {
      const userDoc = await getUserDocument(userId);

      if (!userDoc) {
        return {
          ok: false,
          error: 'User not found',
        };
      }

      return {
        ok: true,
        user: {
          id: userId,
          email: userDoc.email,
          name: userDoc.name,
          displayName: userDoc.displayName || userDoc.name,
          photoURL: userDoc.photoURL || null,
          department: userDoc.department || null,
          collegeEmail: userDoc.collegeEmail || null,
          emailVerified: userDoc.emailVerified,
        },
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        ok: false,
        error: 'Failed to fetch profile',
      };
    }
  },

  // Get current auth user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Sign up with Google
  signupWithGoogle: async () => {
    try {
      // Set persistence before signup
      await setPersistence(auth, browserLocalPersistence);

      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userId = user.uid;

      // Check if user document exists
      const existingUser = await getUserDocument(userId);

      if (!existingUser) {
        // Create new user document for first-time Google sign-up
        await createUserDocument(userId, user.email, user.displayName || 'Google User');
      }

      // Generate token
      const token = generateToken(userId);

      return {
        ok: true,
        user: {
          id: userId,
          email: user.email,
          name: user.displayName || 'Google User',
          displayName: user.displayName || 'Google User',
          photoURL: user.photoURL || null,
          department: existingUser?.department || null,
          emailVerified: existingUser?.emailVerified || false,
        },
        token,
      };
    } catch (error) {
      let errorMessage = 'Google sign-up failed';

      console.error('Google signup error:', error);

      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-up cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up blocked. Please allow pop-ups for this site.';
      }

      return {
        ok: false,
        error: errorMessage,
      };
    }
  },

  // Login with Google
  loginWithGoogle: async () => {
    try {
      // Set persistence before login
      await setPersistence(auth, browserLocalPersistence);

      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userId = user.uid;

      // Get user document from Firestore
      const userDoc = await getUserDocument(userId);

      if (!userDoc) {
        // If user doesn't exist, create document
        await createUserDocument(userId, user.email, user.displayName || 'Google User');
      }

      // Get updated user document
      const updatedUserDoc = userDoc || (await getUserDocument(userId));

      // Generate token
      const token = generateToken(userId);

      return {
        ok: true,
        user: {
          id: userId,
          email: updatedUserDoc.email,
          name: updatedUserDoc.name,
          displayName: updatedUserDoc.displayName || updatedUserDoc.name,
          photoURL: updatedUserDoc.photoURL || null,
          department: updatedUserDoc.department || null,
          emailVerified: updatedUserDoc.emailVerified,
          collegeEmail: updatedUserDoc.collegeEmail,
        },
        token,
      };
    } catch (error) {
      let errorMessage = 'Google login failed';

      console.error('Google login error:', error);

      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up blocked. Please allow pop-ups for this site.';
      }

      return {
        ok: false,
        error: errorMessage,
      };
    }
  },
};

export default authAPI;
