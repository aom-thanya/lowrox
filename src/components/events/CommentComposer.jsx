import React, { useState, useRef } from 'react';
import Image from '../common/Image';
import { ImagePlus, X } from 'lucide-react';
import { prepareCommentImage, MAX_COMMENT_IMAGES, COMMENT_IMAGE_ACCEPT } from '../../utils/commentImages';
import Avatar from '../common/Avatar';
import Textarea from '../common/Textarea';

export default function CommentComposer({ user, onSubmit, isSubmitting }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [preparing, setPreparing] = useState(false);
  const input = useRef(null);
  const busy = useRef(false);
  const addImages = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length || busy.current) return;
    if (images.length + files.length > MAX_COMMENT_IMAGES) {
      setError('แนบได้สูงสุด 8 รูปต่อความคิดเห็น'); return;
    }
    busy.current = true;
    setPreparing(true);
    setError('');
    const added = [];
    const errors = [];
    for (const file of files) {
      try { added.push(await prepareCommentImage(file)); }
      catch { errors.push(`${file.name}: เตรียมรูปไม่สำเร็จ กรุณาใช้รูปที่รองรับ ขนาดไม่เกิน 20 MB`); }
    }
    setImages(current => [...current, ...added]);
    setError(errors.join('\n'));
    setPreparing(false);
    busy.current = false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (busy.current || isSubmitting || (!message.trim() && !images.length)) {
      return;
    }

    try {
      setError('');
      busy.current = true;
      await onSubmit(message, images);
      setMessage('');
      setImages([]);
    } catch (err) {
      setError('ส่งความคิดเห็นไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally { busy.current = false; }
  };

  return (
    <div className="event-comment-composer">
      <Avatar src={user.avatarUrl} size="small" className="event-comment-avatar" />
      <form onSubmit={handleSubmit} className="event-comment-form">
        <label htmlFor="event-comment" className="event-detail-label">เพิ่มความคิดเห็น</label>
        <Textarea
          id="event-comment"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="เพิ่มความคิดเห็น..."
          className="event-comment-textarea"
          disabled={isSubmitting}
          maxLength={1000}
        />
        <input ref={input} type="file" multiple accept={COMMENT_IMAGE_ACCEPT} onChange={addImages} hidden aria-label="เลือกรูปความคิดเห็น" disabled={preparing || isSubmitting} />
        <div className="comment-image-previews">
          {images.map(image => <div className="comment-image-preview" key={image.id}>
            <Image src={image.url} alt={image.name} />
            <button type="button" aria-label={`ลบรูป ${image.name}`} disabled={preparing || isSubmitting} onClick={() => setImages(current => current.filter(item => item.id !== image.id))}><X size={16} /></button>
          </div>)}
        </div>
        <button type="button" className="btn btn-secondary btn-md comment-add-images" onClick={() => input.current.click()} disabled={preparing || isSubmitting || images.length >= MAX_COMMENT_IMAGES}><ImagePlus size={20} /> {preparing ? 'กำลังเตรียมรูป...' : `เพิ่มรูป (${images.length}/8)`}</button>
        <p className="event-detail-helper">แนบได้ 8 รูป รูปละไม่เกิน 20 MB · JPG, JPEG, PNG, WebP, HEIC/HEIF</p>
        <span role="status">{preparing ? 'กำลังเตรียมรูป กรุณารอสักครู่' : ''}</span>
        {error && (
          <div role="alert" className="event-comment-error">{error}</div>
        )}
        <button 
          type="submit" 
          className="btn btn-primary btn-md"
          disabled={(!message.trim() && !images.length) || isSubmitting || preparing}
        >
          {isSubmitting ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}
        </button>
      </form>
    </div>
  );
}
