import type { User, Profile, OnboardingData } from '../types/models';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

import { restoreSession, startLineSession, readCurrentUser, updateCurrentUser } from '../services/userRepository';
import type { LineProfile } from '../services/lineAuth';
import { profileFromUser, validateProfile } from '../utils/profile';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginWithLine: (profile: LineProfile) => Promise<{ user: User; isNew: boolean }>;
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

  // Signs in with a LINE profile, creating the Lowrox account on first use.
  const loginWithLine = useCallback(async (profile: LineProfile) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const result = startLineSession(profile);
    setUser(result.user);
    return result;
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
    () => ({ user, loading, loginWithLine, logout, updateOnboardingStatus, loadProfile, saveProfile, loadOnboardingData, saveOnboardingData }),
    [user, loading, loginWithLine, logout, updateOnboardingStatus, loadProfile, saveProfile, loadOnboardingData, saveOnboardingData]
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
