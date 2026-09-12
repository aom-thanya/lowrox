import React, { useEffect, useId, useRef, useState } from 'react';
import Input from './Input';

export default function Select({ id, options, value, onChange, disabled, placeholder = 'ค้นหาและเลือก', ...props }) {
  const listId = useId();
  const root = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const selected = options.find((option) => option.value === value);
  const matches = options.filter((option) => option.label.toLocaleLowerCase('th').includes(query.trim().toLocaleLowerCase('th')));
  const choices = [{ value: '', label: 'ไม่ระบุ' }, ...matches];
  useEffect(() => {
    if (open) root.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);
  const choose = (option) => {
    onChange(option.value);
    setOpen(false);
    setQuery('');
  };
  return <div ref={root} className="search-select" onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setQuery(''); }
  }}>
    <Input {...props} id={id} role="combobox" autoComplete="off" disabled={disabled}
      aria-expanded={open && !disabled} aria-controls={listId} aria-autocomplete="list"
      aria-activedescendant={open ? `${listId}-${active}` : undefined}
      placeholder={placeholder} value={open ? query : (selected?.label || '')}
      onFocus={() => { setOpen(true); setQuery(''); setActive(0); }}
      onChange={(event) => { setQuery(event.target.value); setActive(0); setOpen(true); }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false); }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault(); setOpen(true);
          setActive((current) => Math.max(0, Math.min(choices.length - 1, current + (event.key === 'ArrowDown' ? 1 : -1))));
        }
        if (event.key === 'Enter' && open) { event.preventDefault(); choose(choices[active] || choices[0]); }
      }} />
    {open && !disabled && <ul id={listId} role="listbox" className="select-options" aria-labelledby={id + '-label'}>
      {choices.map((option, index) => <li key={option.value} id={`${listId}-${index}`} role="option"
        aria-selected={index === active} className={index === active ? 'is-active' : ''}
        onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option)}>
        {option.label}
      </li>)}
      {!matches.length && <li className="select-empty" role="presentation">ไม่พบพื้นที่ที่ค้นหา</li>}
    </ul>}
  </div>;
}
