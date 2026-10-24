import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfileMenu from '../src/components/ProfileMenu';

it('opens account links and closes on Escape, outside click, and navigation', () => {
  render(<MemoryRouter><ProfileMenu onLogout={vi.fn()} user={{ id: 'test', displayName: 'Runner' }} /></MemoryRouter>);
  const trigger = screen.getByRole('button', { name: 'เมนูโปรไฟล์ Runner' });
  expect(screen.queryByRole('link', { name: 'โปรไฟล์ของฉัน' })).not.toBeInTheDocument();
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('link', { name: 'เชื่อมต่ออุปกรณ์' })).toHaveAttribute('href', '/profile/devices');
  expect(screen.getByRole('link', { name: 'ตั้งค่าบัญชี' })).toHaveAttribute('href', '/profile/settings');
  expect(screen.getByRole('link', { name: 'อัปเกรดเป็น Member' })).toHaveAttribute('href', '/#plans');
  expect(screen.queryByRole('link', { name: 'Message' })).not.toBeInTheDocument();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(trigger);
  fireEvent.pointerDown(document.body);
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole('link', { name: 'โปรไฟล์ของฉัน' }));
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});
