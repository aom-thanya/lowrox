import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import EventList from '../src/pages/EventList';
import { pageItems } from '../src/components/common/Pagination';
import { useAuth } from '../src/context/AuthContext';
import { useUnsavedChanges } from '../src/context/UnsavedChangesContext';
import * as eventRepository from '../src/services/eventRepository';
import type { EventRecord } from '../src/types/models';

vi.mock('../src/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../src/context/UnsavedChangesContext', () => ({
  useUnsavedChanges: vi.fn()
}));

vi.mock('../src/services/eventRepository', () => ({
  getEvents: vi.fn()
}));

const event = (id: string, title: string): EventRecord => ({
  id, title, type: 'Running', location: 'BKK', date: new Date().toISOString(), description: '', status: 'published',
  organizer: { id: 'u2', name: 'Host', avatarUrl: null }, hostUserId: 'u2', joinUrl: null
});

describe('EventList Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, '', '/events');
    vi.mocked(useAuth, { partial: true }).mockReturnValue({ user: null });
    vi.mocked(useUnsavedChanges, { partial: true }).mockReturnValue({ requestAction: (fn: () => void) => fn() });
  });

  const renderPage = () => {
    return render(
      <BrowserRouter>
        <EventList />
      </BrowserRouter>
    );
  };

  it('shows loading initially and then events', async () => {
    vi.mocked(eventRepository.getEvents).mockResolvedValue({ events: [event('1', 'Test Event 1')], total: 1, page: 1, pageCount: 1 });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });

    expect(screen.getByText('พบ 1 กิจกรรม')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'หน้าของรายการตี้ซ้อม' })).not.toBeInTheDocument();
  });

  it('shows empty state when no events found', async () => {
    vi.mocked(eventRepository.getEvents).mockResolvedValue({ events: [], total: 0, page: 1, pageCount: 1 });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('ไม่พบกิจกรรมที่ค้นหา')).toBeInTheDocument();
    });
  });

  it('filters by persona and goes back to page 1', async () => {
    window.history.replaceState(null, '', '/events?page=3');
    vi.mocked(eventRepository.getEvents).mockResolvedValue({ events: [event('1', 'Party')], total: 30, page: 3, pageCount: 3 });
    renderPage();
    await screen.findByText('Party');

    fireEvent.click(screen.getByRole('button', { name: 'เตรียมลง HYROX' }));

    await waitFor(() => expect(eventRepository.getEvents).toHaveBeenLastCalledWith(expect.objectContaining({ persona: 'hyrox', page: 1 })));
    expect(screen.getByRole('button', { name: 'เตรียมลง HYROX' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('ซ้อมวิ่งสลับสถานี หาคู่ลง Doubles')).toBeInTheDocument();
  });

  it('marks the persona that fits the user goal', async () => {
    vi.mocked(useAuth, { partial: true }).mockReturnValue({ user: { id: 'u1', onboardingData: { goals: [{ goalType: 'improve_time' }] } } as never });
    vi.mocked(eventRepository.getEvents).mockResolvedValue({ events: [], total: 0, page: 1, pageCount: 1 });
    renderPage();

    expect(await screen.findByRole('button', { name: /อยากวิ่งเร็วขึ้น.*ตรงกับเป้าของคุณ/ })).toBeInTheDocument();
  });

  it('pages through results', async () => {
    vi.mocked(eventRepository.getEvents).mockResolvedValue({ events: [event('1', 'Party')], total: 40, page: 1, pageCount: 4 });
    renderPage();
    await screen.findByText('Party');

    expect(screen.getByText('พบ 40 กิจกรรม · หน้า 1 จาก 4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'หน้า 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'หน้าก่อนหน้า' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'หน้าถัดไป' }));
    await waitFor(() => expect(eventRepository.getEvents).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })));
  });
});

describe('pageItems', () => {
  it('keeps first, last and neighbours, collapsing the rest', () => {
    expect(pageItems(1, 3)).toEqual([1, 2, 3]);
    expect(pageItems(1, 8)).toEqual([1, 2, 'gap', 8]);
    expect(pageItems(5, 8)).toEqual([1, 'gap', 4, 5, 6, 'gap', 8]);
    expect(pageItems(8, 8)).toEqual([1, 'gap', 7, 8]);
  });
});
