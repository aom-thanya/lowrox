import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import Login from '../src/pages/Login';
import { useAuth } from '../src/context/AuthContext';

vi.mock('../src/context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../src/services/lineAuth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/services/lineAuth')>();
  return { ...actual, approveMockLineConsent: vi.fn(async () => actual.MOCK_LINE_PROFILE) };
});

describe('Login with LINE', () => {
  const loginWithLine = vi.fn();

  const renderLogin = (from?: string) => render(
    <MemoryRouter initialEntries={[{ pathname: '/login', state: from ? { from: { pathname: from } } : undefined }]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<div data-testid="onboarding-page" />} />
        <Route path="/level" element={<div data-testid="level-page" />} />
        <Route path="/events/:id" element={<div data-testid="event-page" />} />
      </Routes>
    </MemoryRouter>
  );

  const signInWithLine = () => {
    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบด้วย LINE' }));
    fireEvent.click(screen.getByRole('button', { name: 'อนุญาต' }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth, { partial: true }).mockReturnValue({ user: null, loginWithLine });
  });

  test('offers LINE as the only sign-in method', () => {
    renderLogin();

    expect(screen.getByRole('button', { name: 'เข้าสู่ระบบด้วย LINE' })).toBeInTheDocument();
    expect(screen.queryByLabelText('ชื่อผู้ใช้')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('รหัสผ่าน')).not.toBeInTheDocument();
  });

  test('a LINE account without a Lowrox account is registered and sent to onboarding', async () => {
    loginWithLine.mockResolvedValueOnce({ user: { id: 'line-1', onboardingStatus: 'not_started' }, isNew: true });
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบด้วย LINE' }));
    expect(screen.getByText('โหมดจำลอง: ยังไม่ได้เชื่อมต่อกับ LINE จริง')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'อนุญาต' }));

    expect(await screen.findByTestId('onboarding-page')).toBeInTheDocument();
    expect(loginWithLine).toHaveBeenCalledWith(expect.objectContaining({ userId: expect.any(String) }));
  });

  test('an existing account with completed onboarding goes to the level page', async () => {
    loginWithLine.mockResolvedValueOnce({ user: { id: 'line-1', onboardingStatus: 'completed' }, isNew: false });
    renderLogin();
    signInWithLine();

    expect(await screen.findByTestId('level-page')).toBeInTheDocument();
  });

  test('returns to the protected page the user came from', async () => {
    loginWithLine.mockResolvedValueOnce({ user: { id: 'line-1', onboardingStatus: 'completed' }, isNew: false });
    renderLogin('/events/e1');
    signInWithLine();

    expect(await screen.findByTestId('event-page')).toBeInTheDocument();
  });

  test('cancelling consent keeps the user on the page with a message', () => {
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบด้วย LINE' }));
    fireEvent.click(screen.getByRole('button', { name: 'ยกเลิก' }));

    expect(screen.getByRole('alert')).toHaveTextContent('ยกเลิกการเชื่อมต่อ LINE แล้ว');
    expect(loginWithLine).not.toHaveBeenCalled();
  });

  test('shows an error when the LINE connection fails', async () => {
    loginWithLine.mockRejectedValueOnce(new Error('network'));
    renderLogin();
    signInWithLine();

    expect(await screen.findByText('เชื่อมต่อ LINE ไม่สำเร็จ กรุณาลองอีกครั้ง')).toBeInTheDocument();
  });
});
