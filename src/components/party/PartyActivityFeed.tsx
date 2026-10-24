import React, { useMemo, useState } from 'react';
import { Footprints, MessageSquare, Share, ThumbsUp, Trophy } from 'lucide-react';
import type { EventRecord, PartyActivity } from '../../types/models';
import { buildPartyActivities } from '../../data/mockPartyActivities';
import { formatDistance, formatPace } from '../../utils/leveling';
import { shareText } from '../../utils/partyShare';
import InitialAvatar from '../common/InitialAvatar';

const PAGE = 5;
const postedAt = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// "53น. 32วิ" / "1ชม. 52น.", like a watch summary.
const elapsed = (minutes: number) => {
  const seconds = Math.round(minutes * 60);
  const [h, m, s] = [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60];
  return h ? `${h}ชม. ${m}น.` : `${m}น. ${s}วิ`;
};

// Mock map: a park with a lake and paths, with the run drawn on top. No map tiles needed.
function RouteMap({ route }: { route: PartyActivity['route'] }) {
  const path = route.map(([x, y], index) => `${index ? 'L' : 'M'}${x} ${y}`).join(' ');
  return (
    <svg viewBox="-15 0 130 100" preserveAspectRatio="xMidYMid slice" className="block h-56 w-full bg-[#ECEAE4] sm:h-72" aria-hidden="true">
      <path d="M-15 6 H115 M-15 95 H115" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M-15 14 Q50 4 115 12 L115 88 Q50 98 -15 90Z" fill="#B9E0A5" />
      <ellipse cx="72" cy="28" rx="13" ry="8" fill="#A8D3F0" />
      <ellipse cx="28" cy="66" rx="9" ry="6" fill="#A8D3F0" />
      <path d="M4 40 Q40 30 60 52 T100 60 M20 18 Q30 50 18 86 M70 88 Q76 60 96 40" fill="none" stroke="#4FAE7C" strokeWidth="0.8" strokeDasharray="2 1.5" />
      <path d={path} fill="none" stroke="#FF6B00" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={route[0][0]} cy={route[0][1]} r="2.2" fill="#16A36A" stroke="#FFFFFF" strokeWidth="0.8" />
    </svg>
  );
}

function ActivityPost({ activity, party }: { activity: PartyActivity; party: EventRecord }) {
  const [kudoed, setKudoed] = useState(false);
  const [copied, setCopied] = useState(false);
  const kudos = activity.kudos + (kudoed ? 1 : 0);
  const effort = { distanceKm: activity.distanceKm, durationMin: activity.durationMin };
  const share = async () => {
    const text = `${activity.member.name} วิ่ง ${formatDistance(activity.distanceKm)} เพซ ${formatPace(effort)} /กม. กับตี้ "${party.title}" 🔥\nมาวิ่งด้วยกัน: ${window.location.origin}/events/${party.id}`;
    try {
      if (await shareText(text) === 'copied') { setCopied(true); setTimeout(() => setCopied(false), 2500); }
    } catch { /* nothing to copy to; the button just stays as is */ }
  };

  return (
    <li className="border-b border-neutral-200 py-6 first:pt-2 last:border-b-0">
      <div className="flex items-start gap-3">
        <InitialAvatar id={activity.member.id} name={activity.member.name} size="lg" />
        <div className="grid min-w-0 gap-0.5">
          <p className="font-bold text-neutral-900">{activity.member.name}</p>
          <p className="text-sm text-neutral-600">{postedAt.format(new Date(activity.date))} · {activity.device}</p>
          <p className="flex min-w-0 items-center gap-1.5 text-sm text-neutral-600">
            <Footprints size={16} className="shrink-0" aria-hidden="true" /><span className="truncate">{activity.place}</span>
          </p>
        </div>
      </div>

      <h4 className="mt-4 text-2xl font-bold text-neutral-900">{activity.title}</h4>

      <dl className="mt-4 grid grid-cols-[repeat(3,auto)_1fr] gap-x-6 gap-y-1 sm:gap-x-10">
        <div><dt className="text-sm text-neutral-600">ระยะทาง</dt><dd className="text-xl font-semibold whitespace-nowrap text-neutral-900">{formatDistance(activity.distanceKm)}</dd></div>
        <div><dt className="text-sm text-neutral-600">เพซ</dt><dd className="text-xl font-semibold whitespace-nowrap text-neutral-900">{formatPace(effort)} /กม.</dd></div>
        <div><dt className="text-sm text-neutral-600">เวลา</dt><dd className="text-xl font-semibold whitespace-nowrap text-neutral-900">{elapsed(activity.durationMin)}</dd></div>
        {activity.achievements > 0 && (
          <div className="justify-self-end text-right"><dt className="text-sm text-neutral-600">ความสำเร็จ</dt>
            <dd className="inline-flex items-center gap-1 text-xl font-semibold text-neutral-900"><Trophy size={20} className="text-warning" aria-hidden="true" />{activity.achievements}</dd></div>
        )}
      </dl>

      <div className="-mx-6 mt-4 md:-mx-8"><RouteMap route={activity.route} /></div>

      <p className="mt-4 text-sm text-neutral-600">
        {kudos ? `${kudos} คนให้ kudos` : 'เป็นคนแรกที่ให้ kudos!'}{activity.comments > 0 && ` · ${activity.comments} ความคิดเห็น`}
      </p>
      <div className="mt-2 grid grid-cols-3 text-neutral-800">
        <button type="button" onClick={() => setKudoed(value => !value)} aria-pressed={kudoed} aria-label="ให้ kudos"
          className={`flex min-h-11 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-inherit hover:bg-neutral-50 ${kudoed ? 'text-brand-600' : ''}`}>
          <ThumbsUp size={24} fill={kudoed ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
        <a href="#comments" aria-label="ไปที่ความคิดเห็น" className="flex min-h-11 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-inherit hover:bg-neutral-50">
          <MessageSquare size={24} aria-hidden="true" />
        </a>
        <button type="button" onClick={share} aria-label={copied ? 'คัดลอกแล้ว' : 'แชร์กิจกรรมนี้'} title={copied ? 'คัดลอกแล้ว ไปแปะได้เลย!' : undefined}
          className="flex min-h-11 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-inherit hover:bg-neutral-50">
          <Share size={24} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

// The party's feed: runs members posted after its sessions, newest first.
export default function PartyActivityFeed({ party }: { party: EventRecord }) {
  const activities = useMemo(() => buildPartyActivities(party), [party.id]);
  const [shown, setShown] = useState(PAGE);
  if (!activities.length) return <p className="text-neutral-500">ยังไม่มีใครโพสต์ ซ้อมรอบแรกเสร็จแล้วมาอวดกันได้เลย!</p>;
  return (
    <>
      <ul className="m-0 list-none p-0">{activities.slice(0, shown).map(activity => <ActivityPost key={activity.id} activity={activity} party={party} />)}</ul>
      {shown < activities.length && (
        <button type="button" className="btn btn-secondary btn-md mt-2 w-full" onClick={() => setShown(count => count + PAGE)}>ดูเพิ่ม</button>
      )}
    </>
  );
}
