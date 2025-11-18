import React, { createContext, useContext, useEffect, useState } from 'react';
import authAPI from '../services/firebaseAuth';

const UserContext = createContext(null);

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Helper to update user state
  const updateUser = (updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  async function login({ email, password }) {
    setLoading(true);
    try {
      const result = await authAPI.login({ email, password });
      
      if (result.ok) {
        const userData = {
          ...result.user,
          token: result.token,
          emailVerified: result.user.emailVerified || false,
        };
        setUser(userData);
        return { ok: true, user: userData };
      } else {
        return { ok: false, error: result.error };
      }
    } catch (err) {
      return { ok: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  }

  async function signup({ email, password, name }) {
    setLoading(true);
    try {
      const result = await authAPI.signup({ email, password, name });
      
      if (result.ok) {
        const userData = {
          ...result.user,
          token: result.token,
          emailVerified: result.user.emailVerified || false,
        };
        setUser(userData);
        return { ok: true, user: userData };
      } else {
        return { ok: false, error: result.error };
      }
    } catch (err) {
      return { ok: false, error: 'Signup failed' };
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp(email) {
    if (!user?.id) {
      return { ok: false, error: 'Not authenticated' };
    }
    const result = await authAPI.sendOtp(email, user.id);
    return result;
  }

  async function verifyEmail(email, otp) {
    if (!user?.id) {
      return { ok: false, error: 'Not authenticated' };
    }
    const result = await authAPI.verifyEmail(email, otp, user.id);
    
    if (result.ok) {
      // Update user state with verified status
      updateUser({
        emailVerified: true,
        collegeEmail: result.user.collegeEmail,
      });
    }
    return result;
  }

  async function signupWithGoogle() {
    setLoading(true);
    try {
      const result = await authAPI.signupWithGoogle();
      
      if (result.ok) {
        const userData = {
          ...result.user,
          token: result.token,
          emailVerified: result.user.emailVerified || false,
        };
        setUser(userData);
        return { ok: true, user: userData };
      } else {
        return { ok: false, error: result.error };
      }
    } catch (err) {
      return { ok: false, error: 'Google signup failed' };
    } finally {
      setLoading(false);
    }
  }

  async function loginWithGoogle() {
    setLoading(true);
    try {
      const result = await authAPI.loginWithGoogle();
      
      if (result.ok) {
        const userData = {
          ...result.user,
          token: result.token,
          emailVerified: result.user.emailVerified || false,
        };
        setUser(userData);
        return { ok: true, user: userData };
      } else {
        return { ok: false, error: result.error };
      }
    } catch (err) {
      return { ok: false, error: 'Google login failed' };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    authAPI.logout();
    setUser(null);
    localStorage.removeItem('user');
  }

  const value = { user, loading, login, signup, loginWithGoogle, signupWithGoogle, logout, verifyEmail, sendOtp };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export default UserContext;
