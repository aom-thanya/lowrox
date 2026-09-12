import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProfileOnboardingEditor from '../src/pages/ProfileOnboardingEditor';
import { useUnsavedChanges } from '../src/context/UnsavedChangesContext';
import { useAuth } from '../src/context/AuthContext';

vi.mock('../src/context/UnsavedChangesContext', () => ({
  useUnsavedChanges: vi.fn(() => ({
    setDirty: vi.fn(),
    requestAction: vi.fn(action => action())
  })),
  UnsavedChangesProvider: ({ children }) => <>{children}</>
}));

vi.mock('../src/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock the step components to simulate validation triggers
vi.mock('../src/components/onboarding/StepBasicInfo', () => ({
  default: React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      validate: () => false // Always fail validation for this test
    }));
    return <div data-testid="step-basic-info">Basic Info</div>;
  })
}));

vi.mock('../src/components/onboarding/StepFitnessLevel', () => ({
  default: React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({ validate: () => true }));
    return <div data-testid="step-fitness">Fitness</div>;
  })
}));

vi.mock('../src/components/onboarding/StepGoals', () => ({
  default: React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({ validate: () => true }));
    return <div data-testid="step-goals">Goals</div>;
  })
}));

vi.mock('../src/components/onboarding/StepAvailability', () => ({
  default: React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({ validate: () => true }));
    return <div data-testid="step-availability">Availability</div>;
  })
}));

vi.mock('../src/components/onboarding/StepHealth', () => ({
  default: React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({ validate: () => true }));
    return <div data-testid="step-health">Health</div>;
  })
}));

describe('ProfileOnboardingEditor', () => {
  const saveOnboardingData = vi.fn();
  
  const renderEditor = () => {
    useAuth.mockReturnValue({
        user: { onboardingData: {} }, 
        loadOnboardingData: vi.fn(() => ({})),
        saveOnboardingData
    });
    return render(
      <MemoryRouter>
        <UnsavedChangesProvider>
          <ProfileOnboardingEditor />
        </UnsavedChangesProvider>
      </MemoryRouter>
    );
  };

  test('validates all steps when saving and stops if invalid', async () => {
    renderEditor();
    
    // Attempt to save
    const saveBtn = screen.getByRole('button', { name: 'บันทึกการเปลี่ยนแปลง' });
    fireEvent.click(saveBtn);
    
    // Basic Info mock returns false, so it should show error and not save
    expect(await screen.findByText('กรุณาตรวจสอบข้อมูลที่กรอกให้ครบถ้วน')).toBeInTheDocument();
    expect(saveOnboardingData).not.toHaveBeenCalled();
  });
});
