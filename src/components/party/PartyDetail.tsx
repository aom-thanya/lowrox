import React, { useRef } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Activity, BarChart3, Calendar, CalendarDays, Check, Info, MapPin, Rss, Share2, Users, type LucideIcon } from 'lucide-react';
import type { EventRecord } from '../../types/models';
import { formatDateTimeFull } from '../../utils/formatDate';
import { partyLevelLabel } from '../../utils/leveling';
import { coverFor } from '../../utils/partyCover';
import Avatar from '../common/Avatar';
import PartyActivityFeed from './PartyActivityFeed';
import PartyAvatar from './PartyAvatar';
import PartyEvents from './PartyEvents';
import PartyJoinPanel from './PartyJoinPanel';
import { usePartyShare } from './PartyShareButton';
import PartyStats from './PartyStats';

const TABS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: 'overview', label: 'ภาพรวม', icon: Info },
  { value: 'events', label: 'อีเวนต์', icon: CalendarDays },
  { value: 'feed', label: 'ฟีด', icon: Rss },
  { value: 'stats', label: 'สถิติ', icon: BarChart3 },
];

const circle = 'grid size-14 place-items-center rounded-full transition-colors md:size-16';
const navItem = 'flex min-w-0 cursor-pointer flex-col border-0 bg-transparent p-0 font-[inherit] disabled:cursor-not-allowed items-center gap-2 rounded-lg py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600';

// A party page laid out like a club: header with cover, name and a row of round buttons,
// then one section at a time (overview, events, feed, stats) instead of one long page.
export default function PartyDetail({ event, isActive, isEnded, isCancelled, onChange, onRequireLogin, chat }: {
  event: EventRecord;
  isActive: boolean;
  isEnded: boolean;
  isCancelled: boolean;
  onChange: (event: EventRecord) => void;
  onRequireLogin: () => void;
  chat: React.ReactNode;
}) {
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(item => item.value === params.get('tab')) ? params.get('tab')! : 'overview';
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { share, copied, error } = usePartyShare(event);
  const cover = coverFor(event);
  const participants = event.participants ?? [];

  const select = (value: string) => {
    const next = new URLSearchParams(params);
    if (value === 'overview') next.delete('tab'); else next.set('tab', value);
    setParams(next, { replace: true, state: location.state });
  };
  const onTabKey = (keyEvent: React.KeyboardEvent, index: number) => {
    const keys: Record<string, number> = { ArrowRight: (index + 1) % TABS.length, ArrowLeft: (index - 1 + TABS.length) % TABS.length, Home: 0, End: TABS.length - 1 };
    if (!(keyEvent.key in keys)) return;
    keyEvent.preventDefault();
    select(TABS[keys[keyEvent.key]].value);
    tabRefs.current[keys[keyEvent.key]]?.focus();
  };

  return (
    <>
      <div className="event-detail-card">
        <div className="event-detail-cover overflow-hidden">
          {cover ? <img className="absolute inset-0 size-full object-cover" src={cover} alt="" /> : <Activity size={64} aria-hidden="true" />}
          {(isCancelled || isEnded) && (
            <div className="event-detail-overlay event-overlay-bg">
              <div className={isCancelled ? 'event-overlay-badge-error' : 'event-overlay-badge-neutral'}>{isCancelled ? 'ตี้นี้ถูกยกเลิกแล้ว' : 'ตี้นี้จบลงแล้ว'}</div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 md:px-8 md:pb-8">
          <PartyAvatar style={event.style} size="lg" className="-mt-9" />
          <h1 className="heading-2 event-detail-title mt-3">{event.title}</h1>

          <ul className="mt-3 flex list-none flex-wrap p-0 items-center gap-x-5 gap-y-2 text-neutral-600">
            <li className="flex items-center gap-1.5"><Activity size={18} aria-hidden="true" />{event.type}</li>
            <li className="flex items-center gap-1.5"><Users size={18} aria-hidden="true" />{participants.length}/{event.capacity ?? participants.length} คน</li>
            <li><span className="level-chip" data-level={event.levelId ?? 'all'}>{partyLevelLabel(event.levelId)}</span></li>
          </ul>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-neutral-600">
            <span className="flex items-center gap-1.5"><Calendar size={18} aria-hidden="true" />{formatDateTimeFull(event.date)}</span>
            <span className="flex min-w-0 items-center gap-1.5"><MapPin size={18} className="shrink-0" aria-hidden="true" /><span className="truncate">{event.location}</span></span>
          </p>

          <div className="mt-6 grid grid-cols-5 gap-1 border-t border-neutral-200 pt-6">
            <button type="button" className={`${navItem} text-neutral-800`} onClick={share} disabled={!isActive} aria-label={copied ? 'คัดลอกข้อความชวนแล้ว' : 'แชร์ตี้'}>
              <span className={`${circle} ${isActive ? 'bg-neutral-100 hover:bg-neutral-200' : 'bg-neutral-50 text-neutral-400'}`}>
                {copied ? <Check size={24} aria-hidden="true" /> : <Share2 size={24} aria-hidden="true" />}
              </span>
              <span className={isActive ? '' : 'text-neutral-400'}>{copied ? 'คัดลอกแล้ว' : 'แชร์'}</span>
            </button>
            <div role="tablist" aria-label="ส่วนของตี้" className="col-span-4 grid grid-cols-4 gap-1">
              {TABS.map((item, index) => {
                const selected = item.value === tab;
                const Icon = item.icon;
                return (
                  <button key={item.value} ref={element => { tabRefs.current[index] = element; }} type="button" role="tab"
                    id={`party-tab-${item.value}`} aria-controls="party-panel" aria-selected={selected} tabIndex={selected ? 0 : -1}
                    onClick={() => select(item.value)} onKeyDown={keyEvent => onTabKey(keyEvent, index)}
                    className={`${navItem} ${selected ? 'font-bold text-brand-700' : 'text-neutral-800'}`}>
                    <span className={`${circle} ${selected ? 'bg-brand-500 text-white shadow-md' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-error" role="alert">{error}</p>}
        </div>
      </div>

      <section className="event-detail-comments" role="tabpanel" id="party-panel" aria-labelledby={`party-tab-${tab}`}>
        {tab === 'overview' && (
          <div className="grid gap-8">
            <PartyJoinPanel event={event} isActive={isActive} onChange={onChange} onRequireLogin={onRequireLogin} />
            <div>
              <h2 className="heading-4">รายละเอียด</h2>
              <p className="body-lg event-detail-copy">{event.description}</p>
            </div>
            <div>
              <h2 className="heading-4 mb-3">หัวตี้</h2>
              <Link to={`/users/${event.hostUserId ?? event.organizer?.id}`} className="event-detail-organizer-person public-member-link">
                <Avatar src={event.organizer?.avatarUrl} size="medium" />
                <span className="text-lg font-medium">{event.organizer?.name || 'ไม่ระบุชื่อ'}</span>
              </Link>
            </div>
          </div>
        )}
        {tab === 'events' && <PartyEvents party={event} />}
        {tab === 'feed' && (
          <div className="grid gap-8">
            {chat}
            <div>
              <h2 className="heading-4 mb-2">กิจกรรมล่าสุด</h2>
              <PartyActivityFeed party={event} />
            </div>
          </div>
        )}
        {tab === 'stats' && <PartyStats party={event} />}
      </section>
    </>
  );
}
