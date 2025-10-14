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

      // Detect if it's WordPress backend (contains /wp-json/) or mock server
      const isWordPress = normalizedURL.includes('/wp-json/');
      const loginPath = isWordPress ? '/v1/auth/login' : '/api/auth/login';

      console.log('[Auth] Using login path:', loginPath);

      const response = await axios.post(`${normalizedURL}${loginPath}`, {
        username,
        password
      });

      const { token: newToken, user: userData } = response.data.success !== undefined
        ? response.data  // WordPress format
        : { token: response.data.token, user: response.data.user }; // Mock server format

      // Save to state
      setToken(newToken);
      setUser(userData);
      setBaseURL(normalizedURL);

      // Persist to localStorage (WITHOUT credentials for security)
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('baseURL', normalizedURL);
      // NOTE: We do NOT save username/password for security reasons
      // User will need to re-login when token expires (every 2 days)

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

  // Auto-login: verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (token && baseURL) {
        setIsLoading(true);
        try {
          // Detect if it's WordPress backend or mock server
          const isWordPress = baseURL.includes('/wp-json/');
          const validatePath = isWordPress ? '/v1/auth/validate' : '/api/auth/me';

          console.log('[Auth] Auto-login: Verifying token...');
          
          const response = await axios.get(`${baseURL}${validatePath}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Update user data if changed
          const userData = response.data.user;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          console.log('[Auth] Auto-login successful:', userData.username);
          setIsLoading(false);
        } catch (err) {
          console.warn('[Auth] Token expired or invalid, logging out:', err);
          // Clear everything and force re-login
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsLoading(false);
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
