import type { User, Profile, OnboardingData } from '../types/models';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { restoreSession, startLineSession, readCurrentUser, updateCurrentUser } from '../services/userRepository';
import { takePendingLineLogin, type LineProfile } from '../services/lineAuth';
import { profileFromUser, validateProfile } from '../utils/profile';
import { supabase, USE_SUPABASE } from '../lib/supabase';
import { loadMyProfile, saveOnboarding, sendLoginLink, signInWithLineCode, signOut, updateMyProfile, verifyLoginCode } from '../services/supabase/userApi';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** True when sign-in goes through Supabase Auth (email), false for the offline LINE mock. */
  usesEmailLogin: boolean;
  loginWithLine: (profile: LineProfile) => Promise<{ user: User; isNew: boolean }>;
  /** Finishes a real LINE Login on /auth/line/callback. Returns where the member was headed. */
  completeLineLogin: (code: string, state: string | null) => Promise<{ user: User; next: string }>;
  sendEmailLink: (email: string, next: string) => Promise<void>;
  verifyEmailCode: (email: string, code: string) => Promise<User>;
  logout: () => void;
  updateOnboardingStatus: (status: string) => void;
  updateUser: (changes: Partial<User>) => Promise<User>;
  loadProfile: () => Promise<Profile>;
  saveProfile: (draft: Profile) => Promise<Profile>;
  loadOnboardingData: () => Promise<OnboardingData | null>;
  saveOnboardingData: (data: OnboardingData) => Promise<OnboardingData>;
}
const AuthContext = createContext<AuthContextValue | null>(null);

const mockDelay = (ms: number) => (USE_SUPABASE ? Promise.resolve() : new Promise(resolve => setTimeout(resolve, ms)));

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef<User | null>(null);
  userRef.current = user;

  useEffect(() => {
    if (!USE_SUPABASE) {
      const checkSession = async () => {
        try {
          await mockDelay(800);
          setUser(restoreSession());
        } catch (error) {
          console.error('Session check failed', error);
        } finally {
          setLoading(false);
        }
      };
      checkSession();
      return;
    }

    let active = true;
    const refresh = async () => {
      try {
        const profile = await loadMyProfile();
        if (active) setUser(profile);
      } catch (error) {
        console.error('Could not load the Lowrox profile', error);
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    refresh();
    // Supabase warns against awaiting its own calls inside this callback; defer them.
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') { setUser(null); return; }
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') setTimeout(refresh, 0);
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  // Offline mode: the simulated LINE consent creates or reuses a mock account.
  // With Supabase the button redirects to LINE instead (startLineLogin) and comes back
  // through completeLineLogin.
  const loginWithLine = useCallback(async (profile: LineProfile) => {
    await mockDelay(400);
    const result = startLineSession(profile);
    setUser(result.user);
    return result;
  }, []);

  const completeLineLogin = useCallback(async (code: string, state: string | null) => {
    const pending = takePendingLineLogin(state);
    if (!pending) throw new Error('LINE login state mismatch');
    await signInWithLineCode(code, pending.redirectUri, pending.nonce);
    const user = await loadMyProfile();
    if (!user) throw new Error('Sign-in did not complete');
    setUser(user);
    return { user, next: pending.next };
  }, []);

  const sendEmailLink = useCallback(async (email: string, next: string) => {
    await sendLoginLink(email.trim(), next);
  }, []);

  const verifyEmailCode = useCallback(async (email: string, code: string) => {
    await verifyLoginCode(email.trim(), code.trim());
    const profile = await loadMyProfile();
    if (!profile) throw new Error('Sign-in did not complete');
    setUser(profile);
    return profile;
  }, []);

  const logout = useCallback(() => {
    if (USE_SUPABASE) {
      setUser(null);
      signOut().catch(error => console.error('Sign-out failed', error));
      return;
    }
    localStorage.removeItem('mockSession');
    setUser(null);
  }, []);

  const userId = user?.id;

  const updateUser = useCallback(async (changes: Partial<User>) => {
    if (userId == null) throw new Error('Not authenticated');
    const updated = USE_SUPABASE ? await updateMyProfile(userId, changes) : updateCurrentUser(userId, changes);
    setUser(updated);
    return updated;
  }, [userId]);

  const updateOnboardingStatus = useCallback((status: string) => {
    if (userId == null) return;
    if (!USE_SUPABASE) {
      setUser(updateCurrentUser(userId, { onboardingStatus: status }));
      return;
    }
    // Update the screen now (route guards read it), persist in the background.
    setUser(current => (current ? { ...current, onboardingStatus: status } : current));
    updateMyProfile(userId, { onboardingStatus: status }).catch(error => console.error('Could not save onboarding status', error));
  }, [userId]);

  const loadProfile = useCallback(async () => {
    await mockDelay(200);
    if (userId == null) throw new Error('Not authenticated');
    const current = USE_SUPABASE ? await loadMyProfile() : readCurrentUser(userId);
    if (!current) throw new Error('Not authenticated');
    setUser(current);
    return profileFromUser(current);
  }, [userId]);

  const saveProfile = useCallback(async (draft: Profile) => {
    await mockDelay(400);
    const profile = profileFromUser(draft);
    profile.displayName = profile.displayName.trim();
    // The area list is large; load it only when a profile is actually saved.
    const { default: areas } = await import('../data/thaiAreas.json');
    if (Object.keys(validateProfile(profile, areas)).length) throw new Error('Invalid profile');
    if (userId == null) throw new Error('Not authenticated');
    const updated = USE_SUPABASE ? await updateMyProfile(userId, profile) : updateCurrentUser(userId, profile);
    setUser(updated);
    return profileFromUser(updated);
  }, [userId]);

  const loadOnboardingData = useCallback(async () => {
    await mockDelay(200);
    if (userId == null) throw new Error('Not authenticated');
    const current = USE_SUPABASE ? await loadMyProfile() : readCurrentUser(userId);
    return current?.onboardingData || null;
  }, [userId]);

  const saveOnboardingData = useCallback(async (onboardingData: OnboardingData) => {
    await mockDelay(400);
    if (userId == null) throw new Error('Not authenticated');
    if (USE_SUPABASE) {
      // Only the final onboarding step and the editor (after onboarding) save, so this completes it
      // in the database. The screen's status flips in updateOnboardingStatus, as in the mock flow.
      await saveOnboarding(onboardingData, true);
      setUser(current => (current ? { ...current, onboardingData } : current));
      return onboardingData;
    }
    const updated = updateCurrentUser(userId, { onboardingData });
    setUser(updated);
    return onboardingData;
  }, [userId]);

  // Stable value so consumers don't re-render unless auth state or a callback actually changes.
  const value = useMemo(
    () => ({ user, loading, usesEmailLogin: USE_SUPABASE, loginWithLine, completeLineLogin, sendEmailLink, verifyEmailCode, logout, updateOnboardingStatus, updateUser, loadProfile, saveProfile, loadOnboardingData, saveOnboardingData }),
    [user, loading, loginWithLine, completeLineLogin, sendEmailLink, verifyEmailCode, logout, updateOnboardingStatus, updateUser, loadProfile, saveProfile, loadOnboardingData, saveOnboardingData]
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
