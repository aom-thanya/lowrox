import { describe, it, expect } from 'vitest';
import { getCommentsByEventId, postComment } from '../src/services/commentRepository';

describe('commentRepository', () => {
  it('getCommentsByEventId returns array of comments', async () => {
    const comments = await getCommentsByEventId('e1');
    expect(Array.isArray(comments)).toBe(true);
    expect(comments.length).toBeGreaterThan(0);
  });

  it('postComment requires user', async () => {
    await expect(postComment('e1', null, 'Hello')).rejects.toThrow('Unauthorized');
  });

  it('postComment requires valid message', async () => {
    const user = { id: 'u1', displayName: 'Test' };
    await expect(postComment('e1', user, '   ')).rejects.toThrow();
  });

  it('postComment adds a comment successfully', async () => {
    const user = { id: 'u1', displayName: 'Test' };
    const newComment = await postComment('e1', user, 'This is a test comment');
    
    expect(newComment.message).toBe('This is a test comment');
    expect(newComment.userId).toBe('u1');
    
    const comments = await getCommentsByEventId('e1');
    expect(comments.some(c => c.id === newComment.id)).toBe(true);
  });
});
