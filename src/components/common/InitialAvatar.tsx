import React from 'react';

const TONES = ['tone-orange', 'tone-blue', 'tone-green', 'tone-purple', 'tone-pink', 'tone-teal'];

// Colored circle with the first letter of a name; the color is stable per id.
export default function InitialAvatar({ id, name, size = 'md', className = '' }: { id: string | number; name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const hash = [...String(id)].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (
    <span className={`initial-avatar is-${size} ${TONES[hash % TONES.length]} ${className}`} aria-hidden="true">
      {name.trim().charAt(0) || '?'}
    </span>
  );
}
