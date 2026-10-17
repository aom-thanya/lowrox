import React from 'react';

export type SparklePoint = { top: string; left: string; size: number; delay: number };

// Decorative twinkling four-point stars. Positions are fixed so layout never shifts.
export default function Sparkles({ points, className = '' }: { points: SparklePoint[]; className?: string }) {
  return (
    <div className={`home-sparkles ${className}`} aria-hidden="true">
      {points.map((point, index) => (
        <svg
          key={index}
          className="home-sparkle"
          viewBox="0 0 24 24"
          width={point.size}
          height={point.size}
          style={{ top: point.top, left: point.left, animationDelay: `${point.delay}s` }}
        >
          <path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" />
        </svg>
      ))}
    </div>
  );
}
