import React, { useId, useRef } from 'react';
export default function Tabs({ items, value, onChange, children, label }) {
  const id = useId();
  const refs = useRef([]);
  return <>
    <div className="common-tabs" role="tablist" aria-label={label}>
      {items.map((item, index) => <button key={item.value} ref={element => { refs.current[index] = element; }} type="button" role="tab"
        id={`${id}-${item.value}`} aria-controls={`${id}-panel`} aria-selected={item.value === value} tabIndex={item.value === value ? 0 : -1}
        onClick={() => onChange(item.value)} onKeyDown={event => {
          let next;
          if (event.key === 'ArrowRight') next = (index + 1) % items.length;
          if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = items.length - 1;
          if (next !== undefined) { event.preventDefault(); onChange(items[next].value); refs.current[next]?.focus(); }
        }}>{item.label}{item.count !== undefined && <span>{item.count}</span>}</button>)}
    </div>
    <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${value}`} tabIndex={0}>{children}</div>
  </>;
}
