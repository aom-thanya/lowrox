import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { restoreSession, startSession, readCurrentUser, updateCurrentUser } from '../services/userRepository';
import { profileFromUser, validateProfile } from '../utils/profile';
import areas from '../data/thaiAreas.json';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Mocking API call latency
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setUser(restoreSession());
      } catch (error) {
        console.error("Session check failed", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (username, password) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Basic mock logic: test/password is "completed", new/password is "not_started"
    if (username === 'test' && password === 'password') {
      const mockUser = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
        tier: 'premium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        onboardingStatus: 'completed' // Keeping this for routing logic as requested
      };
      const savedUser = startSession(mockUser);
      setUser(savedUser);
      return { success: true, user: savedUser };
    } else if (username === 'new' && password === 'password') {
      const mockUser = {
        id: 2,
        username: 'new',
        email: 'new@example.com',
        tier: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        onboardingStatus: 'not_started' // Keeping this for routing logic
      };
      const savedUser = startSession(mockUser);
      setUser(savedUser);
      return { success: true, user: savedUser };
    }
    
    return { success: false, error: 'ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง' };
  };

  const logout = () => {
    localStorage.removeItem('mockSession');
    setUser(null);
  };

  const updateOnboardingStatus = (status) => {
    if (user) {
      const updatedUser = updateCurrentUser(user.id, { onboardingStatus: status });
      setUser(updatedUser);
    }
  };

  const userId = user?.id;
  const loadProfile = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const current = readCurrentUser(userId);
    setUser(current);
    return profileFromUser(current);
  }, [userId]);

  const saveProfile = useCallback(async (draft) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const profile = profileFromUser(draft);
    profile.displayName = profile.displayName.trim();
    if (Object.keys(validateProfile(profile, areas)).length) throw new Error('Invalid profile');
    const updated = updateCurrentUser(userId, profile);
    setUser(updated);
    return profileFromUser(updated);
  }, [userId]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateOnboardingStatus, loadProfile, saveProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
