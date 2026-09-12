import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Home from '../src/pages/Home';
import { useAuth } from '../src/context/AuthContext';
import { useUnsavedChanges } from '../src/context/UnsavedChangesContext';

vi.mock('../src/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../src/context/UnsavedChangesContext', () => ({
  useUnsavedChanges: vi.fn()
}));

describe('Homepage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUnsavedChanges.mockReturnValue({
      requestAction: vi.fn(action => action()),
      setDirty: vi.fn()
    });
  });

  const renderHome = () => {
    return render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
  };

  test('renders hero section and highlights', () => {
    useAuth.mockReturnValue({ user: null });
    renderHome();
    
    // Check hero text
    expect(screen.getByText('หาเพื่อนออกกำลังกาย ในจังหวะที่ใช่สำหรับคุณ')).toBeInTheDocument();
    
    // Check if highlights exist
    expect(screen.getByText('เป้าหมายใกล้กัน')).toBeInTheDocument();
    expect(screen.getByText('จังหวะที่เข้ากัน')).toBeInTheDocument();
    expect(screen.getByText('เวลาที่ลงตัว')).toBeInTheDocument();
    
    // Check if how it works exists
    expect(screen.getByText('เริ่มหา Buddy ใน 3 ขั้นตอน')).toBeInTheDocument();
    expect(screen.getByText('บอกเราเกี่ยวกับคุณ')).toBeInTheDocument();
    expect(screen.getByText('เลือก Buddy ที่สนใจ')).toBeInTheDocument();
    expect(screen.getByText('คุยแล้วนัดกัน')).toBeInTheDocument();
  });

  test('header shows login and find buddy when not logged in', () => {
    useAuth.mockReturnValue({ user: null });
    renderHome();
    
    // In mobile and desktop there will be multiple instances, use getAllByRole or check first one
    const loginBtns = screen.getAllByRole('button', { name: 'เข้าสู่ระบบ' });
    expect(loginBtns.length).toBeGreaterThan(0);
    
    const howToLinks = screen.getAllByRole('link', { name: 'วิธีใช้งาน' });
    expect(howToLinks.length).toBeGreaterThan(0);
  });

  test('header shows profile and buddy links when logged in', () => {
    useAuth.mockReturnValue({ 
      user: { id: 1, username: 'testuser', displayName: 'Test User' },
      logout: vi.fn()
    });
    renderHome();
    
    const buddyLinks = screen.getAllByRole('link', { name: 'หา Buddy' });
    expect(buddyLinks.length).toBeGreaterThan(0);
    
    const profileLinks = screen.getAllByRole('link', { name: /My Profile/i });
    expect(profileLinks.length).toBeGreaterThan(0);
    
    // Verify login button is NOT there
    expect(screen.queryByRole('button', { name: 'เข้าสู่ระบบ' })).not.toBeInTheDocument();
    
    const logoutBtns = screen.getAllByRole('button', { name: 'ออกจากระบบ' });
    expect(logoutBtns.length).toBeGreaterThan(0);
  });
});
