import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('token');
    const cached = localStorage.getItem('cached_user');
    // Only show blocking spinner if user has a token but no local cache yet
    return Boolean(token && !cached);
  });

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.data);
          localStorage.setItem('cached_user', JSON.stringify(data.data));
          
          // Warm up logo image cache early
          if (data.data?.tenantId?.logoUrl) {
            const img = new Image();
            img.src = data.data.tenantId.logoUrl;
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('cached_user');
          setUser(null);
        }
      } else {
        localStorage.removeItem('cached_user');
        setUser(null);
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('cached_user', JSON.stringify(data.data));
    setUser(data.data);
    
    if (data.data?.tenantId?.logoUrl) {
      const img = new Image();
      img.src = data.data.tenantId.logoUrl;
    }
    return data.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('cached_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
