import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
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
    vi.mocked(useUnsavedChanges, { partial: true }).mockReturnValue({
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

  test('renders hero, pain points, party, steps and plans', () => {
    vi.mocked(useAuth, { partial: true }).mockReturnValue({ user: null });
    renderHome();
    
    // Hero
    expect(screen.getByRole('heading', { level: 1, name: /รู้เลเวล หาบัดดี้/ })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /เช็กเลเวลฟรี/ })[0]).toHaveAttribute('href', '/login');

    // Consumer pain points → solutions
    expect(screen.getByRole('heading', { name: 'เห็นเลเวลชัด' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Safety check ก่อนซ้อม' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'จับคู่เลเวลเดียวกัน' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'แผนซ้อมทีละขั้น' })).toBeInTheDocument();

    // Producer + plans
    expect(screen.getByRole('heading', { name: /ใครก็เป็นหัวตี้ได้/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Member' })).toBeInTheDocument();

    // How it works (anchor target used by the header link)
    expect(screen.getByText('เริ่มได้ใน 3 ขั้นตอน').closest('section')).toHaveAttribute('id', 'how-it-works');
    expect(screen.getByText('เช็กเลเวลของคุณ')).toBeInTheDocument();
    expect(screen.getByText('จอยหรือตั้งตี้ซ้อม')).toBeInTheDocument();
    expect(screen.getByText('ซ้อมแล้วอัปเลเวล')).toBeInTheDocument();
  });

  test('header shows login and find buddy when not logged in', () => {
    vi.mocked(useAuth, { partial: true }).mockReturnValue({ user: null });
    renderHome();
    
    // In mobile and desktop there will be multiple instances, use getAllByRole or check first one
    const loginBtns = screen.getAllByRole('button', { name: 'เข้าสู่ระบบ' });
    expect(loginBtns.length).toBeGreaterThan(0);
    
    const howToLinks = screen.getAllByRole('link', { name: 'วิธีใช้งาน' });
    expect(howToLinks.length).toBeGreaterThan(0);
  });

  test('header shows the training journey and quick log for members', () => {
    vi.mocked(useAuth, { partial: true }).mockReturnValue({
      user: { id: 1, username: 'testuser', displayName: 'Test User', onboardingStatus: 'completed' },
      logout: vi.fn()
    });
    renderHome();

    const mainNav = screen.getByRole('navigation', { name: 'Main Navigation' });
    expect(within(mainNav).getAllByRole('link').map(link => link.textContent)).toEqual(['เลเวลของฉัน', 'ตี้ซ้อม', 'บัดดี้']);
    expect(screen.getAllByRole('link', { name: /บันทึกการวิ่ง/ })[0]).toHaveAttribute('href', '/level?log=1');

    // Phone tab bar mirrors the journey
    const tabbar = screen.getByRole('navigation', { name: 'เมนูหลัก' });
    expect(within(tabbar).getByRole('link', { name: 'บัดดี้' })).toHaveAttribute('href', '/buddies');

    fireEvent.click(screen.getByRole('button', { name: /เมนูโปรไฟล์/ }));
    expect(screen.getByRole('link', { name: 'โปรไฟล์ของฉัน' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'เข้าสู่ระบบ' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ออกจากระบบ' })).toBeInTheDocument();
  });
});
