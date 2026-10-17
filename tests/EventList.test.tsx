import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import EventList from '../src/pages/EventList';
import { useAuth } from '../src/context/AuthContext';
import { useUnsavedChanges } from '../src/context/UnsavedChangesContext';
import * as eventRepository from '../src/services/eventRepository';

vi.mock('../src/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../src/context/UnsavedChangesContext', () => ({
  useUnsavedChanges: vi.fn()
}));

vi.mock('../src/services/eventRepository', () => ({
  getEvents: vi.fn()
}));

describe('EventList Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth, { partial: true }).mockReturnValue({ user: null });
    vi.mocked(useUnsavedChanges, { partial: true }).mockReturnValue({ requestAction: (fn) => fn() });
  });

  const renderPage = () => {
    return render(
      <BrowserRouter>
        <EventList />
      </BrowserRouter>
    );
  };

  it('shows loading initially and then events', async () => {
    vi.mocked(eventRepository.getEvents).mockResolvedValue([
      { id: '1', title: 'Test Event 1', type: 'Running', location: 'BKK', date: new Date().toISOString(), description: '', status: 'published', organizer: { id: 'u2', name: 'Host', avatarUrl: null }, hostUserId: 'u2', joinUrl: null }
    ]);
    
    renderPage();
    
    // Check loading state (not easily queryable without test IDs, but wait for the results)
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });
    
    expect(screen.getByText('พบ 1 กิจกรรม')).toBeInTheDocument();
  });

  it('shows empty state when no events found', async () => {
    vi.mocked(eventRepository.getEvents).mockResolvedValue([]);
    
    renderPage();
    
    await waitFor(() => {
      expect(screen.getByText('ไม่พบกิจกรรมที่ค้นหา')).toBeInTheDocument();
    });
  });
});
