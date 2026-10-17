import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Onboarding from '../src/pages/Onboarding';
import { useAuth } from '../src/context/AuthContext';

vi.mock('../src/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../src/context/UnsavedChangesContext', () => ({
  useUnsavedChanges: vi.fn(() => ({
    setDirty: vi.fn(),
    requestAction: vi.fn(action => action())
  }))
}));

describe('Onboarding (3 quick steps)', () => {
  const updateOnboardingStatus = vi.fn();
  const saveOnboardingData = vi.fn(async (data) => data);

  const renderOnboarding = (user) => {
    vi.mocked(useAuth, { partial: true }).mockReturnValue({ user, updateOnboardingStatus, saveOnboardingData });
    return render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/level" element={<div data-testid="level-page" />} />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => vi.clearAllMocks());

  test('redirects to the level page if onboarding is completed', () => {
    renderOnboarding({ onboardingStatus: 'completed' });
    expect(screen.getByTestId('level-page')).toBeInTheDocument();
  });

  test('shows the level on the first screen, then finishes in two taps', async () => {
    renderOnboarding({ onboardingStatus: 'not_started' });
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    // 5 km is preselected; typing the time reveals the level immediately.
    fireEvent.change(screen.getByPlaceholderText('เช่น 35'), { target: { value: '35' } });
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'ไปต่อ →' }));

    // One tap on a goal moves on.
    fireEvent.click(await screen.findByRole('button', { name: /หาบัดดี้ลงแข่ง/ }));
    expect(await screen.findByText('3 / 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /ไม่มี พร้อมลุย/ }));

    await waitFor(() => expect(updateOnboardingStatus).toHaveBeenCalledWith('completed'));
    const saved = saveOnboardingData.mock.calls[0][0];
    expect(saved.fitnessLevel).toMatchObject({ runningDistance: '5', runningDuration: '35' });
    expect(saved.goals[0].goalType).toBe('buddy_event');
    expect(saved.safetyCheck).toEqual({ mainSelection: ['none'], concerns: [] });
    expect(await screen.findByTestId('level-page')).toBeInTheDocument();
  });

  test('reported health concerns are saved', async () => {
    renderOnboarding({ onboardingStatus: 'not_started' });
    fireEvent.click(screen.getByRole('button', { name: 'ยังไม่เคยจับเวลา' }));
    fireEvent.click(screen.getByRole('button', { name: 'ข้ามไปก่อน →' }));
    fireEvent.click(await screen.findByRole('button', { name: /ยังไม่แน่ใจ/ }));

    fireEvent.click(await screen.findByRole('button', { name: /มี ขอบอกหน่อย/ }));
    fireEvent.click(screen.getByRole('button', { name: 'บาดเจ็บหรือปวด' }));
    fireEvent.click(screen.getByRole('button', { name: /เสร็จแล้ว ดูเลเวลของฉัน/ }));

    await waitFor(() => expect(saveOnboardingData).toHaveBeenCalled());
    expect(saveOnboardingData.mock.calls[0][0].safetyCheck.concerns).toHaveLength(1);
  });

  test('shows confirm dialog on exit attempt', () => {
    renderOnboarding({ onboardingStatus: 'not_started' });
    fireEvent.click(screen.getByLabelText('Close onboarding'));
    expect(screen.getByText('จะพักก่อนใช่ไหม?')).toBeInTheDocument();
  });
});
