import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Mocking API call latency
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const savedSession = localStorage.getItem('mockSession');
        if (savedSession) {
          setUser(JSON.parse(savedSession));
        }
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
      localStorage.setItem('mockSession', JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true, user: mockUser };
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
      localStorage.setItem('mockSession', JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true, user: mockUser };
    }
    
    return { success: false, error: 'ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง' };
  };

  const logout = () => {
    localStorage.removeItem('mockSession');
    setUser(null);
  };

  const updateOnboardingStatus = (status) => {
    if (user) {
      const updatedUser = { ...user, onboardingStatus: status };
      localStorage.setItem('mockSession', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateOnboardingStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
