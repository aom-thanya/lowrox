import React, { useMemo, useState } from 'react';
import { Footprints, PartyPopper, Users } from 'lucide-react';
import type { EventRecord, PartySession } from '../../types/models';
import { buildPartySessions } from '../../data/mockPartySessions';
import Tabs from '../common/Tabs';

const month = new Intl.DateTimeFormat('th-TH', { month: 'short' });
const weekday = new Intl.DateTimeFormat('th-TH', { weekday: 'short' });
const time = new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' });

const KINDS = {
  workout: { label: 'ซ้อม', icon: Footprints },
  social: { label: 'Social', icon: PartyPopper },
};

function SessionCard({ session }: { session: PartySession }) {
  const date = new Date(session.date);
  const { label, icon: KindIcon } = KINDS[session.kind];
  return (
    <li className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="w-16 shrink-0 overflow-hidden rounded-md border border-neutral-200 text-center" aria-hidden="true">
        <div className="bg-neutral-950 py-0.5 text-xs font-semibold text-white">{month.format(date)}</div>
        <div className="text-3xl leading-tight font-medium text-neutral-900">{date.getDate()}</div>
        <div className="pb-1 text-xs text-neutral-600">{weekday.format(date)}</div>
      </div>
      <div className="grid min-w-0 gap-1">
        <h4 className="truncate text-lg font-bold text-neutral-900">{session.title}</h4>
        <p className="flex min-w-0 items-center gap-1.5 text-sm text-neutral-600">
          <KindIcon size={16} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{label} · {time.format(date)} · {session.location}</span>
        </p>
        <p className="flex items-center gap-1.5 text-sm text-neutral-600">
          <Users size={16} className="shrink-0" aria-hidden="true" /> {session.rsvpCount} คนจอย
        </p>
        <span className="sr-only">{date.toLocaleDateString('th-TH', { dateStyle: 'full' })}</span>
      </div>
    </li>
  );
}

// The party's events, like a club calendar: upcoming soonest first, past newest first.
export default function PartyEvents({ party }: { party: EventRecord }) {
  const [tab, setTab] = useState('upcoming');
  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const sessions = buildPartySessions(party);
    return {
      upcoming: sessions.filter(session => new Date(session.date).getTime() >= now),
      past: sessions.filter(session => new Date(session.date).getTime() < now).reverse(),
    };
  }, [party]);
  const shown = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="grid gap-4">
      <Tabs label="อีเวนต์ของตี้" value={tab} onChange={setTab}
        items={[{ value: 'upcoming', label: 'กำลังจะมา', count: upcoming.length }, { value: 'past', label: 'ที่ผ่านมา', count: past.length }]}>
        {shown.length
          ? <ul className="mt-4 grid list-none gap-3 p-0">{shown.map(session => <SessionCard key={session.id} session={session} />)}</ul>
          : <p className="mt-4 text-neutral-500">{tab === 'upcoming' ? 'ยังไม่มีอีเวนต์ที่กำลังจะมา' : 'ยังไม่มีอีเวนต์ที่ผ่านมา'}</p>}
      </Tabs>
    </div>
  );
}
