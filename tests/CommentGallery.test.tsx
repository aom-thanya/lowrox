import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, it, expect } from 'vitest';
import CommentList from '../src/components/events/CommentList';

it('opens the selected image, navigates, closes and restores focus', () => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', ''); });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) { this.removeAttribute('open'); });
  render(<MemoryRouter><CommentList comments={[{id:'c',eventId:'e',userId:'u',message:'',userDisplayName:'Tester',createdAt:'2026-01-01',images:[{id:'a',url:'a.jpg',name:'a.jpg',width:100,height:100},{id:'b',url:'b.jpg',name:'b.jpg',width:100,height:100}]}]} isLoading={false} /></MemoryRouter>);
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
