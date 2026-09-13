import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, it, expect } from 'vitest';
import CommentList from '../src/components/events/CommentList';

it('opens the selected image, navigates, closes and restores focus', () => {
  HTMLDialogElement.prototype.showModal = vi.fn(function () { this.setAttribute('open', ''); });
  HTMLDialogElement.prototype.close = vi.fn(function () { this.removeAttribute('open'); });
  render(<CommentList comments={[{id:'c',userDisplayName:'Tester',createdAt:'2026-01-01',images:[{id:'a',url:'a.jpg'},{id:'b',url:'b.jpg'}]}]} />);
  const opener=screen.getByRole('button',{name:'ดูรูป 2 จาก Tester'});
  opener.focus();
  fireEvent.click(opener);
  expect(screen.getByRole('img',{name:'รูปความคิดเห็น 2'})).toHaveAttribute('src','b.jpg');
  fireEvent.click(screen.getByRole('button',{name:'รูปถัดไป'}));
  expect(screen.getByRole('img',{name:'รูปความคิดเห็น 1'})).toHaveAttribute('src','a.jpg');
  fireEvent.keyDown(screen.getByRole('dialog'),{key:'ArrowLeft'});
  expect(screen.getByText('รูป 2 / 2')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'ดูรูป 1'}));
  expect(screen.getByText('รูป 1 / 2')).toBeInTheDocument();
  fireEvent(screen.getByRole('dialog'),new Event('cancel',{bubbles:true,cancelable:true}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(opener).toHaveFocus();
});
