import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import Header from '../src/components/Header';
import { ProtectedRoute } from '../src/components/ProtectedRoute';
import { useAuth } from '../src/context/AuthContext';

vi.mock('../src/context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../src/context/UnsavedChangesContext', () => ({
  useUnsavedChanges: vi.fn(() => ({ setDirty: vi.fn(), requestAction: vi.fn((action: () => void) => action()) }))
}));
vi.mock('../src/services/lineAuth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/services/lineAuth')>();
  return { ...actual, approveMockLineConsent: vi.fn(async () => actual.MOCK_LINE_PROFILE) };
});

describe('Login with LINE (modal only)', () => {
  const loginWithLine = vi.fn();

  const renderApp = (path = '/') => render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<Header />} />
        <Route path="/onboarding" element={<div data-testid="onboarding-page" />} />
        <Route path="/level" element={<div data-testid="level-page" />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile/settings" element={<div data-testid="settings-page" />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

  const openLoginModal = () => fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));
  const signInWithLine = () => {
    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบด้วย LINE' }));
    fireEvent.click(screen.getByRole('button', { name: 'อนุญาต' }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth, { partial: true }).mockReturnValue({ user: null, loading: false, loginWithLine });
  });

  test('offers LINE as the only sign-in method', () => {
    renderApp();
    openLoginModal();

    expect(screen.getByRole('button', { name: 'เข้าสู่ระบบด้วย LINE' })).toBeInTheDocument();
    expect(screen.queryByLabelText('ชื่อผู้ใช้')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('รหัสผ่าน')).not.toBeInTheDocument();
  });

  test('a LINE account without a Lowrox account is registered and sent to onboarding', async () => {
    loginWithLine.mockResolvedValueOnce({ user: { id: 'line-1', onboardingStatus: 'not_started' }, isNew: true });
    renderApp();
    openLoginModal();

    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบด้วย LINE' }));
    expect(screen.getByText('โหมดจำลอง: ยังไม่ได้เชื่อมต่อกับ LINE จริง')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'อนุญาต' }));

    expect(await screen.findByTestId('onboarding-page')).toBeInTheDocument();
    expect(loginWithLine).toHaveBeenCalledWith(expect.objectContaining({ userId: expect.any(String) }));
  });

  test('an existing account with completed onboarding goes to the level page', async () => {
    loginWithLine.mockResolvedValueOnce({ user: { id: 'line-1', onboardingStatus: 'completed' }, isNew: false });
    renderApp();
    openLoginModal();
    signInWithLine();

    expect(await screen.findByTestId('level-page')).toBeInTheDocument();
  });

  test('a guest on a protected page gets the modal on the homepage, then returns to that page', async () => {
    const user = { id: 'line-1', onboardingStatus: 'completed' };
    loginWithLine.mockImplementationOnce(async () => {
      vi.mocked(useAuth, { partial: true }).mockReturnValue({ user, loading: false, loginWithLine });
      return { user, isNew: false };
    });
    renderApp('/profile/settings');

    expect(screen.getByRole('button', { name: 'เข้าสู่ระบบด้วย LINE' })).toBeInTheDocument();
    signInWithLine();

    expect(await screen.findByTestId('settings-page')).toBeInTheDocument();
  });

  test('closing the modal opened by a protected page keeps it closed', () => {
    renderApp('/profile/settings');

    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));

    expect(screen.queryByRole('button', { name: 'เข้าสู่ระบบด้วย LINE' })).not.toBeInTheDocument();
  });

  test('cancelling consent keeps the user on the modal with a message', () => {
    renderApp();
    openLoginModal();

    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบด้วย LINE' }));
    fireEvent.click(screen.getByRole('button', { name: 'ยกเลิก' }));

    expect(screen.getByRole('alert')).toHaveTextContent('ยกเลิกการเชื่อมต่อ LINE แล้ว');
    expect(loginWithLine).not.toHaveBeenCalled();
  });

  test('shows an error when the LINE connection fails', async () => {
    loginWithLine.mockRejectedValueOnce(new Error('network'));
    renderApp();
    openLoginModal();
    signInWithLine();

    expect(await screen.findByText('เชื่อมต่อ LINE ไม่สำเร็จ กรุณาลองอีกครั้ง')).toBeInTheDocument();
  });
});
