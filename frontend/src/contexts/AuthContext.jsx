import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

/**
 * In-memory token store.
 * The access token NEVER goes into localStorage — it lives only in JS memory.
 * This eliminates the XSS attack surface for token theft.
 *
 * The refresh token is stored as a server-set httpOnly cookie
 * (set by the backend on login/register/refresh) so JS cannot read it.
 */
let _inMemoryAccessToken = null;

export function getAccessToken() {
  return _inMemoryAccessToken;
}

export function setAccessToken(token) {
  _inMemoryAccessToken = token;
}

export function clearAccessToken() {
  _inMemoryAccessToken = null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshAttempted = useRef(false);

  useEffect(() => {
    /**
     * On app load, attempt a silent refresh using the httpOnly cookie.
     * If the cookie is still valid, this restores the session without
     * requiring the user to log in again.
     */
    const restoreSession = async () => {
      if (refreshAttempted.current) return;
      refreshAttempted.current = true;

      try {
        // The cookie is sent automatically (withCredentials: true in api.js)
        const data = await api.post('/auth/refresh');
        setAccessToken(data.data.accessToken);
        setUser(data.data.user);
      } catch {
        // No valid session — user needs to log in
        clearAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    // Listen for unauthorized events dispatched by api.js interceptor
    const handleUnauthorized = () => {
      clearAccessToken();
      setUser(null);
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.post('/auth/login', { email, password });
      // Store access token in memory only
      setAccessToken(data.data.accessToken);
      setUser(data.data.user);
      // refreshToken is set as httpOnly cookie by backend — we never touch it
      return { success: true, user: data.data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

