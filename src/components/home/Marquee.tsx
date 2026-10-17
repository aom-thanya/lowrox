import React from 'react';

// Infinite horizontal ticker. The list is rendered twice so the loop is seamless;
// the copy is hidden from assistive tech.
export default function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const renderItems = (hidden: boolean) => (
    <ul className="home-marquee-list" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item}>
          {item}
          <span className="home-marquee-star" aria-hidden="true">✦</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`home-marquee${reverse ? ' is-reverse' : ''}`}>
      <div className="home-marquee-track">
        {renderItems(false)}
        {renderItems(true)}
      </div>
    </div>
  );
}
