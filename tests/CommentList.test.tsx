import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CommentList from '../src/components/events/CommentList';
import type { CommentRecord } from '../src/types/models';

const comment = (id: string, message: string) => ({
  id, eventId: 'e1', userId: 'u1', userDisplayName: 'Thanaree', userAvatarUrl: null,
  message, images: [], createdAt: new Date().toISOString(),
}) as unknown as CommentRecord;

const view = (comments: CommentRecord[], isLoading: boolean) => <MemoryRouter><CommentList comments={comments} isLoading={isLoading} /></MemoryRouter>;

describe('CommentList loading', () => {
  it('shows a comment-shaped skeleton while loading', () => {
    const { container } = render(view([], true));
    expect(screen.getByRole('status', { name: 'กำลังโหลดความคิดเห็น' })).toBeInTheDocument();
    expect(container.querySelectorAll('.event-comment-skeleton')).toHaveLength(3);
  });

  it('fades loaded comments in and highlights only ones that arrive later', () => {
    const { container, rerender } = render(view([], true));
    rerender(view([comment('1', 'first')], false));
    expect(container.querySelector('.event-comment-item.is-new')).toBeNull();
    expect(container.querySelector('.event-comment-item.is-entering')).not.toBeNull();

    rerender(view([comment('1', 'first'), comment('2', 'second')], false));
    const fresh = container.querySelectorAll('.event-comment-item.is-new');
    expect(fresh).toHaveLength(1);
    expect(fresh[0]).toHaveTextContent('second');
  });

  it('starts over when the next event loads', () => {
    const { container, rerender } = render(view([comment('1', 'a')], false));
    rerender(view([], true));
    rerender(view([comment('9', 'other event')], false));
    expect(container.querySelector('.event-comment-item.is-new')).toBeNull();
  });
});
