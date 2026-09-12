import React from 'react';
import { UserRound } from 'lucide-react';

export default function Avatar({ src, name = '', size = 'medium' }) {
  return <span className={`avatar avatar-${size}`}>
    {src ? <img src={src} alt={`รูปโปรไฟล์${name ? `ของ ${name}` : ''}`} /> : <UserRound aria-label="รูปโปรไฟล์เริ่มต้น" role="img" />}
  </span>;
}
