import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { vi } from 'vitest';
import MyLevel from '../src/pages/MyLevel';
import PartyCreate from '../src/pages/PartyCreate';
import { useAuth } from '../src/context/AuthContext';
import { createInitialOnboardingData } from '../src/context/OnboardingContext';

vi.mock('../src/context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../src/context/UnsavedChangesContext', () => ({
  useUnsavedChanges: vi.fn(() => ({ setDirty: vi.fn(), requestAction: vi.fn((action: () => void) => action()) }))
}));

function makeUser() {
  const onboardingData = createInitialOnboardingData();
  onboardingData.fitnessLevel = { ...onboardingData.fitnessLevel, runningDistance: '5', runningDuration: '52' };
  onboardingData.goals = [{ ...onboardingData.goals[0], goalType: 'buddy_event' }];
  onboardingData.availabilityWindows = [{ ...onboardingData.availabilityWindows[0], areaLabel: 'สวนลุมพินี', timePresets: ['early_morning'] }];
  return { id: 'u-test', displayName: 'มายด์', tier: 'free', onboardingStatus: 'completed', onboardingData };
}

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}{location.search}</div>;
}

const renderAt = (path: string, element: React.ReactElement, routePath: string) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path={routePath} element={element} />
      <Route path="*" element={<LocationProbe />} />
    </Routes>
  </MemoryRouter>
);

beforeEach(() => {
  localStorage.clear();
  vi.mocked(useAuth, { partial: true }).mockReturnValue({ user: makeUser(), logout: vi.fn() });
});

describe('My level', () => {
  test('shows the level from onboarding, and logging a faster run levels up', async () => {
    renderAt('/level', <MyLevel />, '/level');

    expect(screen.getByRole('heading', { level: 1, name: /Beginner/ })).toBeInTheDocument();
    expect(screen.getByText('52:00')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /บันทึกการซ้อม/ }));
    fireEvent.change(screen.getByLabelText('นาที'), { target: { value: '38' } });
    expect(within(screen.getByRole('dialog', { name: 'บันทึกการวิ่ง' })).getByText('Intermediate')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'บันทึก' }));

    const banner = await screen.findByText('🎉 เลเวลอัป!');
    expect(banner.closest('[role="status"]')).toHaveTextContent('จาก Beginner สู่ Intermediate');
    expect(screen.getByRole('heading', { level: 1, name: /Intermediate/ })).toBeInTheDocument();
  });

  test('free members can tick the first plan session; the rest are locked', () => {
    renderAt('/level', <MyLevel />, '/level');
    const checks = screen.getAllByRole('button', { name: /ทำเครื่องหมายว่าเสร็จ/ });

    fireEvent.click(checks[0]);
    expect(screen.getByText('1/3 เสร็จแล้ว')).toBeInTheDocument();
    expect(checks[1]).toBeDisabled();
  });
});

describe('Party creation', () => {
  test('one tap opens a party with sensible defaults and lands on it', async () => {
    renderAt('/parties/new', <PartyCreate />, '/parties/new');
    fireEvent.click(screen.getByRole('button', { name: 'เปิดตี้' }));

    expect((await screen.findByTestId('location')).textContent).toMatch(/^\/events\/p-/);
    const [party] = JSON.parse(localStorage.getItem('lowrox:parties')!);
    expect(party).toMatchObject({ isParty: true, levelId: 'beginner', capacity: 4, location: 'สวนลุมพินี' });
    expect(party.participants[0]).toMatchObject({ id: 'u-test', name: 'มายด์' });
  });
});
