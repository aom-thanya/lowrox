import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import FindBuddyCTA from '../src/components/home/FindBuddyCTA';
import { useAuth } from '../src/context/AuthContext';

vi.mock('../src/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('FindBuddyCTA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderCTA = () => {
    return render(
      <BrowserRouter>
        <FindBuddyCTA />
      </BrowserRouter>
    );
  };

  test('opens login modal when not logged in', async () => {
    useAuth.mockReturnValue({ user: null });
    renderCTA();
    
    const btn = screen.getByRole('button', { name: 'เริ่มหา Buddy' });
    fireEvent.click(btn);
    
    // Login modal should appear (mock LoginForm should be present)
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  test('navigates to /buddies when logged in and onboarding complete', async () => {
    useAuth.mockReturnValue({ 
      user: { id: 1, onboardingStatus: 'completed' } 
    });
    renderCTA();
    
    const btn = screen.getByRole('button', { name: 'เริ่มหา Buddy' });
    fireEvent.click(btn);
    
    expect(await screen.findByText('กำลังตรวจสอบ...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/buddies');
    });
  });

  test('navigates to /onboarding with state when logged in but onboarding incomplete', async () => {
    useAuth.mockReturnValue({ 
      user: { id: 1, onboardingStatus: 'pending' } 
    });
    renderCTA();
    
    const btn = screen.getByRole('button', { name: 'เริ่มหา Buddy' });
    fireEvent.click(btn);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/onboarding', { 
        state: { redirectOnComplete: '/buddies' } 
      });
    });
  });
});
