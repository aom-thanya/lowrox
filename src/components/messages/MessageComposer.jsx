import React, { useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import Textarea from '../common/Textarea';

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function MessageComposer({ value, onChange, onSend, disabled, placeholder }) {
  const composingRef = useRef(false);

  const handleKeyDown = useCallback((e) => {
    if (composingRef.current) return; // IME composing — do not send

    if (e.key === 'Enter' && !e.shiftKey && !isMobile()) {
      e.preventDefault();
      onSend();
    }
  }, [onSend]);

  const handleCompositionStart = () => { composingRef.current = true; };
  const handleCompositionEnd = () => { composingRef.current = false; };

  return (
    <div className="msg-composer">
      <Textarea
        className="msg-composer-input"
        placeholder={placeholder || 'พิมพ์ข้อความ…'}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        disabled={disabled}
        maxLength={2000}
        rows={1}
      />
      <button
        type="button"
        className="btn btn-primary msg-composer-send"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="ส่งข้อความ"
      >
        <Send size={20} />
      </button>
    </div>
  );
}
