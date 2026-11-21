import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PartySlots from '../src/components/party/PartySlots';

describe('PartySlots', () => {
  it('shows each member photo and links to their profile', () => {
    const { container } = render(
      <MemoryRouter>
        <PartySlots capacity={4} showNames linkProfiles participants={[
          { id: 13, name: 'Thanaree', avatarUrl: 'https://example.com/a.png' },
          { id: 20, name: 'Guest' },
        ]} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'ดูโปรไฟล์ของ Thanaree' })).toHaveAttribute('href', '/users/13');
    expect(screen.getByRole('link', { name: 'ดูโปรไฟล์ของ Guest' })).toHaveAttribute('href', '/users/20');
    expect(container.querySelector('img.party-slot-photo')).toHaveAttribute('src', 'https://example.com/a.png');
    expect(container.querySelectorAll('.initial-avatar')).toHaveLength(1);
    expect(screen.getAllByText('ว่าง')).toHaveLength(2);
  });

  it('stays plain without linkProfiles', () => {
    render(<MemoryRouter><PartySlots capacity={2} participants={[{ id: 1, name: 'A' }]} /></MemoryRouter>);
    expect(screen.queryByRole('link')).toBeNull();
  });
});
