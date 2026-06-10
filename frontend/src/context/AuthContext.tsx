'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface UserProfile {
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  loyaltyPoints: number;
  referralCode: string;
  referredBy?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  profile?: UserProfile;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string, phone?: string, referredBy?: string) => Promise<void>;
  sendOtp: (email: string, phone?: string, name?: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  updateUserLocal: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('dvyug_token');
      const storedUser = localStorage.getItem('dvyug_user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const data = await api.auth.login({ email, password });
      if (data.success && data.token && data.user) {
        localStorage.setItem('dvyug_token', data.token);
        localStorage.setItem('dvyug_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password?: string, phone?: string, referredBy?: string) => {
    setLoading(true);
    try {
      const data = await api.auth.register({ name, email, password, phone, referredBy });
      if (data.success && data.token && data.user) {
        localStorage.setItem('dvyug_token', data.token);
        localStorage.setItem('dvyug_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (email: string, phone?: string, name?: string) => {
    await api.auth.sendOtp({ email, phone, name });
  };

  const verifyOtp = async (email: string, otp: string) => {
    setLoading(true);
    try {
      const data = await api.auth.verifyOtp({ email, otp });
      if (data.success && data.token && data.user) {
        localStorage.setItem('dvyug_token', data.token);
        localStorage.setItem('dvyug_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('dvyug_token');
    localStorage.removeItem('dvyug_user');
    setToken(null);
    setUser(null);
  };

  const updateUserLocal = (updatedUser: User) => {
    localStorage.setItem('dvyug_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, sendOtp, verifyOtp, logout, updateUserLocal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
