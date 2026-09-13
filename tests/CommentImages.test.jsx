import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, it, expect } from 'vitest';
import CommentComposer from '../src/components/events/CommentComposer';
import { prepareCommentImage, validateCommentImage } from '../src/utils/commentImages';
import { postComment, getCommentsByEventId } from '../src/services/commentRepository';
vi.mock('../src/utils/commentImages', async importOriginal => ({ ...await importOriginal(), prepareCommentImage: vi.fn() }));
const photo = { id:'photo',name:'photo.jpg',url:'data:image/jpeg;base64,AAAA',width:100,height:100 };
it('accepts phone extensions and rejects oversized/non-image files', () => {
  for (const name of ['photo.HEIC','photo.heif','photo.jpeg','photo.jepg','photo.png']) expect(() => validateCommentImage({ name,size:100,type:'' })).not.toThrow();
  expect(() => validateCommentImage({name:'x.jpg',size:21*1024*1024,type:'image/jpeg'})).toThrow();
  expect(() => validateCommentImage({name:'x.pdf',size:100,type:'application/pdf'})).toThrow();
});
it('previews multiple images, removes one, retains draft on failure and submits image-only', async () => {
  prepareCommentImage.mockImplementation(async file => ({...photo,id:file.name,name:file.name}));
  const submit=vi.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce({});
  render(<CommentComposer user={{id:'u'}} onSubmit={submit} isSubmitting={false}/>);
  fireEvent.change(screen.getByLabelText('เลือกรูปความคิดเห็น'),{target:{files:[new File(['a'],'a.jpg'),new File(['b'],'b.png')]}});
  await screen.findByAltText('a.jpg');
  expect(screen.getByAltText('b.png')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'ลบรูป a.jpg'}));
  fireEvent.click(screen.getByRole('button',{name:'ส่งความคิดเห็น'}));
  await screen.findByRole('alert');
  expect(screen.getByAltText('b.png')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'ส่งความคิดเห็น'}));
  await waitFor(()=>expect(screen.queryByAltText('b.png')).not.toBeInTheDocument());
  expect(submit).toHaveBeenLastCalledWith('',[expect.objectContaining({name:'b.png'})]);
});
it('stores image-only comments and rejects excessive attachments', async () => {
  const result=await postComment('image-test',{id:'u'},'',[photo]);
  expect((await getCommentsByEventId('image-test'))[0].images).toEqual([photo]);
  expect(result.message).toBe('');
  await expect(postComment('image-test',{id:'u'},'test',Array(9).fill(photo))).rejects.toThrow();
});
