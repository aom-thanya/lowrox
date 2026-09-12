import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import Login from '../src/pages/Login';
import { useAuth } from '../src/context/AuthContext';

vi.mock('../src/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('Login Page', () => {
  const mockLogin = vi.fn();

  const renderLogin = () => {
    return render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<div data-testid="profile-page">Profile</div>} />
          <Route path="/onboarding" element={<div data-testid="onboarding-page">Onboarding</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: mockLogin, user: null });
  });

  test('shows validation errors when fields are empty', async () => {
    renderLogin();
    
    const submitButton = screen.getByRole('button', { name: /เข้าสู่ระบบ/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('กรุณากรอกชื่อผู้ใช้')).toBeInTheDocument();
    expect(await screen.findByText('กรุณากรอกรหัสผ่าน')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('authenticates and redirects to /profile if onboarding is completed', async () => {
    mockLogin.mockResolvedValueOnce({ onboardingStatus: 'completed' });
    renderLogin();
    
    fireEvent.change(screen.getByLabelText(/ชื่อผู้ใช้/i), { target: { value: 'test' } });
    fireEvent.change(screen.getByLabelText(/รหัสผ่าน/i), { target: { value: 'password' } });
    
    const submitButton = screen.getByRole('button', { name: /เข้าสู่ระบบ/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test', 'password');
    });

    expect(await screen.findByTestId('profile-page')).toBeInTheDocument();
  });

  test('authenticates and redirects to /onboarding if onboarding is not started', async () => {
    mockLogin.mockResolvedValueOnce({ onboardingStatus: 'not_started' });
    renderLogin();
    
    fireEvent.change(screen.getByLabelText(/ชื่อผู้ใช้/i), { target: { value: 'new' } });
    fireEvent.change(screen.getByLabelText(/รหัสผ่าน/i), { target: { value: 'password' } });
    
    const submitButton = screen.getByRole('button', { name: /เข้าสู่ระบบ/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('new', 'password');
    });

    expect(await screen.findByTestId('onboarding-page')).toBeInTheDocument();
  });

  test('displays error message on failed login', async () => {
    mockLogin.mockRejectedValueOnce(new Error('ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง'));
    renderLogin();
    
    fireEvent.change(screen.getByLabelText(/ชื่อผู้ใช้/i), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByLabelText(/รหัสผ่าน/i), { target: { value: 'wrong' } });
    
    const submitButton = screen.getByRole('button', { name: /เข้าสู่ระบบ/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง')).toBeInTheDocument();
  });
});
