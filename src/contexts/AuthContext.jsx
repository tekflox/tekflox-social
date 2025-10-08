import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [baseURL, setBaseURL] = useState(() => 
    localStorage.getItem('baseURL') || 'http://localhost:3002'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = !!token && !!user;

  // Login function
  const login = async (username, password, url) => {
    setIsLoading(true);
    setError(null);

    try {
      // Remove trailing slash if present
      const normalizedURL = url.endsWith('/') ? url.slice(0, -1) : url;

      console.log('[Auth] Attempting login to:', normalizedURL);

      const response = await axios.post(`${normalizedURL}/api/auth/login`, {
        username,
        password
      });

      const { token: newToken, user: userData } = response.data;

      // Save to state
      setToken(newToken);
      setUser(userData);
      setBaseURL(normalizedURL);

      // Persist to localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('baseURL', normalizedURL);

      console.log('[Auth] Login successful:', userData.username);
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      console.error('[Auth] Login failed:', err);
      
      const errorMessage = err.response?.data?.error 
        || 'Erro ao conectar com o servidor. Verifique a URL.';
      
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Try to notify server (optional, doesn't block logout)
      if (token && baseURL) {
        await axios.post(`${baseURL}/api/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.warn('[Auth] Logout notification failed (continuing anyway):', err);
    }

    // Clear state
    setToken(null);
    setUser(null);
    setError(null);

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Keep baseURL for convenience on next login

    console.log('[Auth] Logout successful');
  };

  // Verify token on mount (optional)
  useEffect(() => {
    const verifyToken = async () => {
      if (token && baseURL) {
        try {
          const response = await axios.get(`${baseURL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Update user data if changed
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (err) {
          console.warn('[Auth] Token verification failed, logging out:', err);
          logout();
        }
      }
    };

    verifyToken();
  }, []); // Only on mount

  const value = {
    token,
    user,
    baseURL,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
