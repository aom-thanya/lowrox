import type { User, Profile, OnboardingData } from '../types/models';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

import { restoreSession, startSession, readCurrentUser, updateCurrentUser } from '../services/userRepository';
import { profileFromUser, validateProfile } from '../utils/profile';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: true; user: User } | { success: false; error: string }>;
  logout: () => void;
  updateOnboardingStatus: (status: string) => void;
  loadProfile: () => Promise<Profile>;
  saveProfile: (draft: Profile) => Promise<Profile>;
  loadOnboardingData: () => Promise<OnboardingData | null>;
  saveOnboardingData: (data: OnboardingData) => Promise<OnboardingData>;
}
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
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

  const login = useCallback(async (username: string, password: string): ReturnType<AuthContextValue['login']> => {
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
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mockSession');
    setUser(null);
  }, []);

  const userId = user?.id;
  const updateOnboardingStatus = useCallback((status: string) => {
    if (userId != null) {
      const updatedUser = updateCurrentUser(userId, { onboardingStatus: status });
      setUser(updatedUser);
    }
  }, [userId]);

  const loadProfile = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (userId == null) throw new Error('Not authenticated');
    const current = readCurrentUser(userId);
    setUser(current);
    return profileFromUser(current);
  }, [userId]);

  const saveProfile = useCallback(async (draft: Profile) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const profile = profileFromUser(draft);
    profile.displayName = profile.displayName.trim();
    // The area list is large; load it only when a profile is actually saved.
    const { default: areas } = await import('../data/thaiAreas.json');
    if (Object.keys(validateProfile(profile, areas)).length) throw new Error('Invalid profile');
    if (userId == null) throw new Error('Not authenticated');
    const updated = updateCurrentUser(userId, profile);
    setUser(updated);
    return profileFromUser(updated);
  }, [userId]);

  const loadOnboardingData = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (userId == null) throw new Error('Not authenticated');
    const current = readCurrentUser(userId);
    return current.onboardingData || null;
  }, [userId]);

  const saveOnboardingData = useCallback(async (onboardingData: OnboardingData) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (userId == null) throw new Error('Not authenticated');
    const updated = updateCurrentUser(userId, { onboardingData });
    setUser(updated);
    return onboardingData;
  }, [userId]);

  // Stable value so consumers don't re-render unless auth state or a callback actually changes.
  const value = useMemo(
    () => ({ user, loading, login, logout, updateOnboardingStatus, loadProfile, saveProfile, loadOnboardingData, saveOnboardingData }),
    [user, loading, login, logout, updateOnboardingStatus, loadProfile, saveProfile, loadOnboardingData, saveOnboardingData]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
