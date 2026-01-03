import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('auraestate_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { user } = await api.getCurrentUser();
      setUser(user);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      api.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const { user, token } = await api.login(email, password);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const { user, token } = await api.register(userData);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const { user: updatedUser } = await api.updateProfile(profileData);
      setUser(prev => ({ ...prev, ...updatedUser }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    refreshUser: fetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
