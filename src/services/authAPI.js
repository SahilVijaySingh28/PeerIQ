// DEMO MODE: Storage only (email & password verification, no backend required)

// Demo OTP for testing
const DEMO_OTP = '1234';

// Helper to get all stored users from localStorage
const getStoredUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('peeriq_users')) || {};
  } catch {
    return {};
  }
};

// Helper to save users to localStorage
const saveStoredUsers = (users) => {
  localStorage.setItem('peeriq_users', JSON.stringify(users));
};

// Generate simple token (in demo mode, just a base64 encoded user id)
const generateToken = (email) => {
  return btoa(`${email}:${Date.now()}`);
};

// Authentication APIs - DEMO MODE
export const authAPI = {
  // Register/Signup
  signup: async ({ email, password, name }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getStoredUsers();

        // Check if user already exists
        if (users[email]) {
          resolve({
            ok: false,
            error: 'Email already registered',
          });
          return;
        }

        // Validate inputs
        if (!email || !password || !name) {
          resolve({
            ok: false,
            error: 'All fields are required',
          });
          return;
        }

        if (password.length < 6) {
          resolve({
            ok: false,
            error: 'Password must be at least 6 characters',
          });
          return;
        }

        // Create new user
        const userId = `user_${Date.now()}`;
        const token = generateToken(email);
        const newUser = {
          id: userId,
          email,
          name,
          password, // Stored in plain text for demo (NOT production!)
          emailVerified: false,
          createdAt: new Date().toISOString(),
        };

        users[email] = newUser;
        saveStoredUsers(users);

        resolve({
          ok: true,
          user: { id: userId, email, name, emailVerified: false },
          token,
        });
      }, 500); // Simulate network delay
    });
  },

  // Login
  login: async ({ email, password }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getStoredUsers();
        const user = users[email];

        // Check if user exists and password matches
        if (!user || user.password !== password) {
          resolve({
            ok: false,
            error: 'Invalid email or password',
          });
          return;
        }

        const token = generateToken(email);

        resolve({
          ok: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
          },
          token,
        });
      }, 500);
    });
  },

  // Logout
  logout: async (token) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In demo mode, just acknowledge logout
        resolve({ ok: true });
      }, 200);
    });
  },

  // Send OTP for email verification
  sendOtp: async (email, token) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getStoredUsers();
        const user = users[email];

        if (!user) {
          resolve({
            ok: false,
            error: 'User not found',
          });
          return;
        }

        // In demo mode, store the OTP with expiration (5 minutes)
        user.otp = DEMO_OTP;
        user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        saveStoredUsers(users);

        console.log(`📧 Demo OTP for ${email}: ${DEMO_OTP}`);

        resolve({
          ok: true,
          message: `OTP sent to ${email}. Demo OTP: ${DEMO_OTP}`,
        });
      }, 500);
    });
  },

  // Verify email with OTP
  verifyEmail: async (email, otp, token) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getStoredUsers();
        const user = users[email];

        if (!user) {
          resolve({
            ok: false,
            error: 'User not found',
          });
          return;
        }

        // Check OTP
        if (user.otp !== otp) {
          resolve({
            ok: false,
            error: 'Invalid OTP',
          });
          return;
        }

        // Check OTP expiration
        if (new Date() > new Date(user.otpExpiresAt)) {
          resolve({
            ok: false,
            error: 'OTP has expired',
          });
          return;
        }

        // Mark email as verified
        user.emailVerified = true;
        user.collegeEmail = email;
        user.otp = null;
        user.otpExpiresAt = null;
        saveStoredUsers(users);

        resolve({
          ok: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            collegeEmail: email,
            emailVerified: true,
          },
        });
      }, 500);
    });
  },

  // Get user profile
  getProfile: async (token) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In demo mode, decode token to get email
        try {
          const decoded = atob(token);
          const email = decoded.split(':')[0];
          const users = getStoredUsers();
          const user = users[email];

          if (!user) {
            resolve({
              ok: false,
              error: 'User not found',
            });
            return;
          }

          resolve({
            ok: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              collegeEmail: user.collegeEmail || null,
              emailVerified: user.emailVerified,
            },
          });
        } catch (error) {
          resolve({
            ok: false,
            error: 'Invalid token',
          });
        }
      }, 300);
    });
  },
};

export default authAPI;
