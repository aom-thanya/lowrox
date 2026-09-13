import { it, expect, vi, afterEach } from 'vitest';
import { prepareCommentImage } from '../src/utils/commentImages';
vi.mock('heic2any', () => ({ default: vi.fn(async () => new Blob(['jpeg'], { type:'image/jpeg' })) }));
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
it('falls back to HEIC conversion, resizes and revokes temporary URLs', async () => {
  let reads=0;
  vi.stubGlobal('Image', class {
    naturalWidth=4000; naturalHeight=3000;
    set src(value) { queueMicrotask(()=>{ if (++reads===1) this.onerror(); else this.onload(); }); }
  });
  const revoke=vi.fn();
  vi.stubGlobal('URL', {createObjectURL:vi.fn(()=> 'blob:test'),revokeObjectURL:revoke});
  const draw=vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue({fillRect:vi.fn(),drawImage:draw});
  vi.spyOn(HTMLCanvasElement.prototype,'toDataURL').mockReturnValue('data:image/jpeg;base64,test');
  const result=await prepareCommentImage(new File(['heic'],'IMG.HEIC',{type:'image/heic'}));
  expect(result).toMatchObject({width:1600,height:1200,url:'data:image/jpeg;base64,test'});
  expect((await import('heic2any')).default).toHaveBeenCalled();
  expect(revoke).toHaveBeenCalledTimes(2);
  expect(draw).toHaveBeenCalled();
});
