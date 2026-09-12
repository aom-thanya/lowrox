import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProfileEditor from '../src/pages/ProfileEditor';
import { useUnsavedChanges, UnsavedChangesProvider } from '../src/context/UnsavedChangesContext';
import { useAuth } from '../src/context/AuthContext';

vi.mock('../src/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { displayName: 'Test User' },
    loadProfile: vi.fn(() => ({})),
    saveProfile: vi.fn()
  }))
}));

vi.mock('../src/services/userRepository', () => ({
  readCurrentUser: vi.fn(() => ({
    displayName: 'Test User',
    bio: 'Test Bio',
    provinceId: '1',
    districtId: '101'
  })),
  saveProfile: vi.fn(async (data) => data)
}));

vi.mock('../src/context/UnsavedChangesContext', () => ({
  useUnsavedChanges: vi.fn(() => ({
    setDirty: vi.fn(),
    requestAction: vi.fn(action => action())
  })),
  UnsavedChangesProvider: ({ children }) => <>{children}</>
}));

// We only need a high-level test for the Confirm Dialog and Validation
describe('ProfileEditor Page', () => {
  const renderProfile = () => {
    return render(
      <MemoryRouter>
        <UnsavedChangesProvider>
          <ProfileEditor />
        </UnsavedChangesProvider>
      </MemoryRouter>
    );
  };

  test('validates display name length', async () => {
    renderProfile();
    
    // Wait for data to load
    const nameInput = await screen.findByDisplayValue('Test User');
    
    // Change name to 1 character (invalid)
    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.blur(nameInput);
    
    expect(await screen.findByText('ชื่อที่แสดงต้องมี 2–50 ตัวอักษร')).toBeInTheDocument();
    
    // Save button should be disabled
    const saveBtn = screen.getByRole('button', { name: 'บันทึกการเปลี่ยนแปลง' });
    expect(saveBtn).toBeDisabled();
  });

  test('validates bio length limit', async () => {
    renderProfile();
    
    const bioInput = await screen.findByDisplayValue('Test Bio');
    const longText = 'A'.repeat(301);
    
    fireEvent.change(bioInput, { target: { value: longText } });
    fireEvent.blur(bioInput);
    
    expect(await screen.findByText(/แนะนำตัวต้องไม่เกิน 300 ตัวอักษร/)).toBeInTheDocument();
    
    const saveBtn = screen.getByRole('button', { name: 'บันทึกการเปลี่ยนแปลง' });
    expect(saveBtn).toBeDisabled();
  });
});
