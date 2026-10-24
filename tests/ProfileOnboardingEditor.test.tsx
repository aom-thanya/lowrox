import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProfileOnboardingEditor from '../src/pages/ProfileOnboardingEditor';
import { useAuth } from '../src/context/AuthContext';
import { createInitialOnboardingData } from '../src/context/OnboardingContext';
import type { OnboardingData } from '../src/types/models';

vi.mock('../src/context/UnsavedChangesContext', () => ({
  useUnsavedChanges: vi.fn(() => ({
    setDirty: vi.fn(),
    requestAction: vi.fn(action => action())
  }))
}));

vi.mock('../src/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

function savedAnswers(): OnboardingData {
  const data = createInitialOnboardingData();
  data.fitnessLevel = { ...data.fitnessLevel, distanceSelection: '5', runningDistance: '5', runningDuration: '35', durationSelection: 'custom', customDurationHours: '0', customDurationMinutes: '35' };
  data.goals = [{ ...data.goals[0], goalType: 'improve_time' }];
  data.safetyCheck = { mainSelection: ['none'], concerns: [] };
  return data;
}

describe('ProfileOnboardingEditor', () => {
  const saveOnboardingData = vi.fn().mockResolvedValue(undefined);

  const renderEditor = (data: OnboardingData = savedAnswers()) => {
    vi.mocked(useAuth, { partial: true }).mockReturnValue({
      user: { id: 'test' } as never,
      loadOnboardingData: vi.fn().mockResolvedValue(data),
      saveOnboardingData
    });
    return render(<MemoryRouter><ProfileOnboardingEditor /></MemoryRouter>);
  };

  beforeEach(() => saveOnboardingData.mockClear());

  test('shows the onboarding screens prefilled, one at a time', async () => {
    renderEditor();
    expect(await screen.findByRole('heading', { name: 'ครั้งล่าสุดวิ่งได้เท่าไร?' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('35')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'บันทึกการเปลี่ยนแปลง' })).toBeDisabled();

    fireEvent.click(screen.getByRole('tab', { name: /เป้าหมาย/ }));
    expect(screen.getByRole('button', { name: /วิ่งให้เร็วขึ้น/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('changing a goal stays on the step and saves in one go', async () => {
    renderEditor();
    fireEvent.click(await screen.findByRole('button', { name: 'ถัดไป →' }));
    fireEvent.click(screen.getByRole('button', { name: /วิ่งให้ไกลขึ้น/ }));
    expect(screen.getByRole('heading', { name: 'อยากไปให้ถึงอะไร?' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'บันทึกการเปลี่ยนแปลง' }));
    await waitFor(() => expect(saveOnboardingData).toHaveBeenCalledWith(expect.objectContaining({
      goals: [expect.objectContaining({ goalType: 'increase_distance' })],
    })));
    expect(await screen.findByText('บันทึกข้อมูลสำเร็จ')).toBeInTheDocument();
  });

  test('will not save a run time nobody could run', async () => {
    renderEditor();
    fireEvent.change(await screen.findByDisplayValue('35'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'บันทึกการเปลี่ยนแปลง' }));
    expect(await screen.findByText('เวลาวิ่งดูไม่สมจริง ลองเช็คนาทีอีกครั้ง')).toBeInTheDocument();
    expect(saveOnboardingData).not.toHaveBeenCalled();
  });

  test('adds a health concern and the time and area step', async () => {
    renderEditor();
    fireEvent.click(await screen.findByRole('tab', { name: /สุขภาพ/ }));
    fireEvent.click(screen.getByRole('button', { name: /มี ขอบอกหน่อย/ }));
    fireEvent.click(screen.getByRole('button', { name: 'บาดเจ็บหรือปวด' }));

    fireEvent.click(screen.getByRole('tab', { name: /เวลาและพื้นที่/ }));
    fireEvent.change(screen.getByLabelText('พื้นที่ที่สะดวก'), { target: { value: 'สวนลุมพินี' } });
    fireEvent.click(screen.getByRole('button', { name: /หลังเลิกงาน/ }));

    fireEvent.click(screen.getByRole('button', { name: 'บันทึกการเปลี่ยนแปลง' }));
    await waitFor(() => expect(saveOnboardingData).toHaveBeenCalled());
    const saved = saveOnboardingData.mock.calls[0][0] as OnboardingData;
    expect(saved.safetyCheck.concerns.map(concern => concern.concern_type)).toEqual(['injury']);
    expect(saved.availabilityWindows[0]).toMatchObject({ areaLabel: 'สวนลุมพินี', timePresets: ['after_work'] });
  });
});
