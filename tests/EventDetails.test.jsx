import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import EventDetails from '../src/pages/EventDetails';
import { useAuth } from '../src/context/AuthContext';
import { useUnsavedChanges } from '../src/context/UnsavedChangesContext';
import * as eventRepository from '../src/services/eventRepository';
import * as commentRepository from '../src/services/commentRepository';

vi.mock('../src/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../src/context/UnsavedChangesContext', () => ({
  useUnsavedChanges: vi.fn()
}));

vi.mock('../src/services/eventRepository', () => ({
  getEventById: vi.fn(),
  getJoinGroupUrl: vi.fn(),
  isEventEnded: vi.fn()
}));

vi.mock('../src/services/commentRepository', () => ({
  getCommentsByEventId: vi.fn(),
  postComment: vi.fn()
}));

// Polyfill HTMLDialogElement for jsdom
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
}

describe('EventDetails Page', () => {
  const mockEvent = {
    id: 'e1',
    title: 'Test Event 1',
    type: 'Running',
    location: 'BKK',
    date: new Date(Date.now() + 100000).toISOString(),
    description: 'Test description',
    joinUrl: 'http://test.url'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: null });
    useUnsavedChanges.mockReturnValue({ requestAction: (fn) => fn() });
    eventRepository.getEventById.mockResolvedValue(mockEvent);
    eventRepository.isEventEnded.mockReturnValue(false);
    commentRepository.getCommentsByEventId.mockResolvedValue([]);
  });

  const renderPage = () => {
    return render(
      <BrowserRouter>
        <EventDetails />
      </BrowserRouter>
    );
  };

  it('renders event details successfully', async () => {
    renderPage();
    
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  it('shows login message for join group when not logged in', async () => {
    renderPage();
    
    await waitFor(() => {
      expect(screen.getByText('เข้าสู่ระบบเพื่อเข้าร่วมกลุ่มกิจกรรมนี้')).toBeInTheDocument();
    });
    
    // Clicking Join Group should open login modal
    const joinBtn = screen.getByRole('button', { name: /Join Group/i });
    fireEvent.click(joinBtn);
    
    // Check if modal opens (LoginForm is inside it)
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('opens link when joining group while logged in', async () => {
    useAuth.mockReturnValue({ user: { id: 'u1' } });
    eventRepository.getJoinGroupUrl.mockResolvedValue('http://test.url');
    window.open = vi.fn();
    
    renderPage();
    
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });
    
    const joinBtn = screen.getByRole('button', { name: /Join Group/i });
    fireEvent.click(joinBtn);
    
    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith('http://test.url', '_blank', 'noopener,noreferrer');
    });
  });

  it('shows login prompt for comments when not logged in', async () => {
    renderPage();
    
    await waitFor(() => {
      expect(screen.getByText('เข้าสู่ระบบเพื่อแสดงความคิดเห็น')).toBeInTheDocument();
    });
  });

  it('allows posting comment when logged in', async () => {
    useAuth.mockReturnValue({ user: { id: 'u1', displayName: 'Tester' } });
    commentRepository.postComment.mockResolvedValue({
      id: 'cnew',
      message: 'New comment',
      userDisplayName: 'Tester',
      createdAt: new Date().toISOString()
    });
    
    renderPage();
    
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New comment' } });
    
    const submitBtn = screen.getByRole('button', { name: 'ส่งความคิดเห็น' });
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(commentRepository.postComment).toHaveBeenCalledWith(mockEvent.id, expect.any(Object), 'New comment');
      expect(screen.getByText('New comment')).toBeInTheDocument();
    });
  });
});
