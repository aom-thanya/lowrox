import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import Settings from '../src/pages/Settings';
import { useAuth } from '../src/context/AuthContext';
import { useUnsavedChanges } from '../src/context/UnsavedChangesContext';
import * as userRepository from '../src/services/userRepository';

vi.mock('../src/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../src/context/UnsavedChangesContext', () => ({
  useUnsavedChanges: vi.fn()
}));

vi.mock('../src/services/userRepository', () => ({
  updateCurrentUser: vi.fn()
}));

// Polyfill HTMLDialogElement for jsdom
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = vi.fn(function() {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function() {
    this.removeAttribute('open');
  });
}

describe('Settings Page', () => {
  const mockLogout = vi.fn();
  const mockSetDirty = vi.fn();
  const mockRequestAction = vi.fn((action) => action());
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    useAuth.mockReturnValue({
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        showProfile: true
      },
      logout: mockLogout
    });

    useUnsavedChanges.mockReturnValue({
      setDirty: mockSetDirty,
      requestAction: mockRequestAction
    });

    userRepository.updateCurrentUser.mockImplementation((id, draft) => ({
      id,
      username: 'testuser',
      email: 'test@example.com',
      ...draft
    }));
  });

  const renderSettings = () => render(<Settings />);

  test('loads and displays user login information', async () => {
    renderSettings();
    
    // Wait for the data to load
    expect(await screen.findByText('testuser')).toBeInTheDocument();
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('ข้อมูลนี้จะไม่แสดงในโปรไฟล์สาธารณะ')).toBeInTheDocument();
  });

  test('does not show email if user has no email', async () => {
    useAuth.mockReturnValue({
      user: { id: 1, username: 'noemailuser' },
      logout: mockLogout
    });
    renderSettings();
    
    await screen.findByText('noemailuser');
    expect(screen.queryByText('อีเมล')).not.toBeInTheDocument();
  });

  test('toggling the profile visibility updates draft state and enables save', async () => {
    renderSettings();
    
    const toggle = await screen.findByRole('switch', { name: 'แสดงโปรไฟล์ในการหา Buddy' });
    const saveBtn = screen.getByRole('button', { name: 'บันทึกการเปลี่ยนแปลง' });
    
    // Initially checked (true) and save is disabled
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(saveBtn).toBeDisabled();
    
    // Click toggle
    fireEvent.click(toggle);
    
    // Now unchecked (false) and save is enabled
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(saveBtn).not.toBeDisabled();
    
    // Expect setDirty to be called with true
    expect(mockSetDirty).toHaveBeenCalledWith(true);
  });

  test('saving changes calls updateCurrentUser and shows success toast', async () => {
    renderSettings();
    
    const toggle = await screen.findByRole('switch', { name: 'แสดงโปรไฟล์ในการหา Buddy' });
    fireEvent.click(toggle);
    
    const saveBtn = screen.getByRole('button', { name: 'บันทึกการเปลี่ยนแปลง' });
    fireEvent.click(saveBtn);
    
    await waitFor(() => {
      expect(userRepository.updateCurrentUser).toHaveBeenCalledWith(1, { showProfile: false });
    });
    
    expect(await screen.findByText('บันทึกการตั้งค่าแล้ว')).toBeInTheDocument();
    
    // Save button should be disabled again
    expect(saveBtn).toBeDisabled();
  });

  test('canceling reverts the draft to saved state', async () => {
    renderSettings();
    
    const toggle = await screen.findByRole('switch', { name: 'แสดงโปรไฟล์ในการหา Buddy' });
    fireEvent.click(toggle);
    
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    
    const cancelBtn = screen.getByRole('button', { name: 'ยกเลิก' });
    fireEvent.click(cancelBtn);
    
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(mockSetDirty).toHaveBeenCalledWith(false);
  });

  test('logout button opens confirm dialog, and confirming logs user out', async () => {
    renderSettings();
    
    const logoutBtn = await screen.findByRole('button', { name: 'ออกจากระบบ' });
    
    // This will call requestAction, which calls the callback directly because we mocked it that way
    // In our mock, requestAction immediately executes the callback (showing the dialog)
    fireEvent.click(logoutBtn);
    
    const dialogTitle = await screen.findByText('ออกจากระบบ?');
    expect(dialogTitle).toBeInTheDocument();
    
    // The dialog should NOT show the unsaved changes warning since we haven't changed anything
    expect(screen.queryByText('การเปลี่ยนแปลงที่ยังไม่บันทึกจะถูกยกเลิก')).not.toBeInTheDocument();
    
    // Find the confirm button inside the dialog
    // The dialog renders 2 buttons: "ยกเลิก" and "ออกจากระบบ"
    const confirmLogoutBtn = screen.getAllByRole('button', { name: 'ออกจากระบบ' })[1];
    fireEvent.click(confirmLogoutBtn);
    
    expect(mockLogout).toHaveBeenCalled();
  });

  test('logout dialog warns about unsaved changes if form is dirty', async () => {
    renderSettings();
    
    const toggle = await screen.findByRole('switch', { name: 'แสดงโปรไฟล์ในการหา Buddy' });
    fireEvent.click(toggle); // Make dirty
    
    const logoutBtn = screen.getAllByRole('button', { name: 'ออกจากระบบ' })[0];
    fireEvent.click(logoutBtn);
    
    expect(await screen.findByText('ออกจากระบบ?')).toBeInTheDocument();
    expect(screen.getByText('การเปลี่ยนแปลงที่ยังไม่บันทึกจะถูกยกเลิก')).toBeInTheDocument();
  });
});
