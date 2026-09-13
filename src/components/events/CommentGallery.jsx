import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function CommentGallery({ images, initialIndex, onClose, returnFocus }) {
  const [index, setIndex] = useState(initialIndex);
  const dialog = useRef(null);
  const touch = useRef(null);
  const move = (delta) => setIndex(current => (current + delta + images.length) % images.length);
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = returnFocus || document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, []);
  return createPortal(
    <dialog ref={dialog} className="comment-lightbox" aria-label="แกลเลอรีรูปความคิดเห็น"
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={event => {
        if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      }}>
      <div className="comment-lightbox-header">
        <span aria-live="polite">รูป {index + 1} / {images.length}</span>
        <button type="button" aria-label="ปิดแกลเลอรี" onClick={onClose} autoFocus><X size={24} /></button>
      </div>
      <div className="comment-lightbox-stage"
        onTouchStart={event => { touch.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }}
        onTouchEnd={event => {
          if (!touch.current) return;
          const dx = event.changedTouches[0].clientX - touch.current.x;
          const dy = event.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
          touch.current = null;
        }}>
        {images.length > 1 && <button type="button" aria-label="รูปก่อนหน้า" onClick={() => move(-1)}><ChevronLeft size={24} /></button>}
        <img src={images[index].url} alt={`รูปความคิดเห็น ${index + 1}`} />
        {images.length > 1 && <button type="button" aria-label="รูปถัดไป" onClick={() => move(1)}><ChevronRight size={24} /></button>}
      </div>
      {images.length > 1 && <div className="comment-lightbox-thumbnails">{images.map((image, position) => (
        <button key={image.id || position} type="button" aria-label={`ดูรูป ${position + 1}`} aria-pressed={index === position} onClick={() => setIndex(position)}>
          <img src={image.url} alt="" />
        </button>
      ))}</div>}
    </dialog>, document.body
  );
}
