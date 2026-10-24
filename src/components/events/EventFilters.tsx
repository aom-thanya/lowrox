import React from 'react';
import { Check, X } from 'lucide-react';
import { PARTY_PERSONAS, findPersona } from '../../utils/partyPersonas';

export const SPORT_TYPES = [
  { value: 'Running', label: 'วิ่ง' },
  { value: 'Trail', label: 'วิ่งเทรล' },
  { value: 'HYROX', label: 'HYROX' },
  { value: 'Cycling', label: 'ปั่นจักรยาน' },
  { value: 'Badminton', label: 'แบดมินตัน' },
];
// Provinces the parties actually meet in; matched against the location text.
export const AREAS = ['กรุงเทพฯ', 'เชียงใหม่', 'ภูเก็ต', 'ชลบุรี', 'ขอนแก่น', 'นครราชสีมา'];

export interface EventFilterValues { type: string; area: string; level: string; persona: string }

// No preflight in this project, so buttons need their browser border and background cleared by hand.
const reset = 'cursor-pointer font-[inherit]';
const chip = (selected: boolean) =>
  `${reset} inline-flex min-h-10 items-center gap-1.5 rounded-full border border-solid px-4 text-sm transition-colors ${
    selected ? 'border-brand-500 bg-brand-500 font-semibold text-white' : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400'
  }`;

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 border-t border-neutral-200 pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-sm font-bold text-neutral-900">{title}</h3>
      {children}
    </section>
  );
}

// Filters for the party list. Every tap applies straight away, so there is no search button to forget.
export default function EventFilters({ values, onToggle, myLevel, suggestedPersona }: {
  values: EventFilterValues;
  onToggle: (key: keyof EventFilterValues, value: string) => void;
  myLevel?: { id: string; label: string } | null;
  suggestedPersona?: string | null;
}) {
  const selectedPersona = findPersona(values.persona);
  return (
    <div className="grid gap-5">
      {myLevel && (
        <Group title="เลเวล">
          <button type="button" className={`${chip(Boolean(values.level))} justify-self-start`} aria-pressed={Boolean(values.level)} onClick={() => onToggle('level', myLevel.id)}>
            {values.level && <Check size={16} aria-hidden="true" />}ตี้เลเวลของฉัน ({myLevel.label})
          </button>
        </Group>
      )}

      <Group title="คุณเป็นสายไหน?">
        <div className="grid gap-1">
          {PARTY_PERSONAS.map(option => {
            const selected = values.persona === option.id;
            return (
              <button key={option.id} type="button" aria-pressed={selected} onClick={() => onToggle('persona', option.id)}
                className={`${reset} flex min-h-11 items-center justify-between gap-2 rounded-md border-0 px-3 text-left transition-colors ${selected ? 'bg-brand-50 font-semibold text-brand-700' : 'bg-transparent text-neutral-800 hover:bg-neutral-50'}`}>
                <span className="flex flex-wrap items-center gap-2">
                  {option.label}
                  {option.id === suggestedPersona && <span className="event-persona-suggested">ตรงกับเป้าของคุณ</span>}
                </span>
                {selected && <Check size={18} className="shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        {selectedPersona && <p className="px-3 text-sm text-neutral-600">{selectedPersona.hint}</p>}
      </Group>

      <Group title="ประเภทกีฬา">
        <div className="flex flex-wrap gap-2">
          {SPORT_TYPES.map(sport => (
            <button key={sport.value} type="button" className={chip(values.type === sport.value)} aria-pressed={values.type === sport.value} onClick={() => onToggle('type', sport.value)}>
              {sport.label}
            </button>
          ))}
        </div>
      </Group>

      <Group title="พื้นที่">
        <div className="flex flex-wrap gap-2">
          {AREAS.map(area => (
            <button key={area} type="button" className={chip(values.area === area)} aria-pressed={values.area === area} onClick={() => onToggle('area', area)}>
              {area}
            </button>
          ))}
        </div>
      </Group>
    </div>
  );
}

// The filters in use, each removable on its own.
export function ActiveFilters({ items, onRemove, onClear }: { items: { key: string; label: string }[]; onRemove: (key: string) => void; onClear: () => void }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map(item => (
        <button key={item.key} type="button" onClick={() => onRemove(item.key)} aria-label={`ลบตัวกรอง ${item.label}`}
          className={`${reset} inline-flex min-h-9 items-center gap-1.5 rounded-full border-0 bg-brand-50 pr-2.5 pl-3.5 text-sm font-medium text-brand-800 hover:bg-brand-100`}>
          {item.label}<X size={14} aria-hidden="true" />
        </button>
      ))}
      <button type="button" onClick={onClear} className={`${reset} min-h-9 border-0 bg-transparent px-2 text-sm font-semibold text-neutral-600 underline underline-offset-2 hover:text-neutral-900`}>
        ล้างทั้งหมด
      </button>
    </div>
  );
}
