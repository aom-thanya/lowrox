import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Dumbbell, Footprints, MapPin, Minus, Plus, Route as RouteIcon, Timer } from 'lucide-react';
import type { PartyLevel, PartyStyle } from '../types/models';
import PageShell from '../components/common/PageShell';
import PillGroup from '../components/common/PillGroup';
import PartySlots from '../components/party/PartySlots';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMyLevel } from '../hooks/useMyLevel';
import { createParty, participantFrom } from '../services/partyRepository';
import { LEVELS } from '../utils/leveling';
import '../styles/party.css';

const TEMPLATES: { id: PartyStyle; label: string; icon: typeof Dumbbell; type: string; title: string; description: string }[] = [
  { id: 'hyrox', label: 'HYROX', icon: Dumbbell, type: 'HYROX', title: 'HYROX ซ้อมวิ่ง + สถานี', description: 'ซ้อมวิ่งสลับสถานี HYROX หาคู่ลง Doubles ไปด้วย' },
  { id: 'easy', label: 'Easy run', icon: Footprints, type: 'Running', title: 'วิ่ง Easy run ชิล ๆ', description: 'วิ่งช้า ๆ คุยกันได้ ไม่ทิ้งกัน' },
  { id: 'interval', label: 'Interval', icon: Timer, type: 'Running', title: 'วิ่ง Interval ลดเวลา', description: 'วิ่งเร็วสลับพัก ช่วยกันลากเพซ' },
  { id: 'long', label: 'Long run', icon: RouteIcon, type: 'Running', title: 'วิ่ง Long run สะสมระยะ', description: 'วิ่งยาวด้วยเพซสบาย เน้นจบระยะด้วยกัน' },
];
const DEFAULT_PLACES = ['สวนลุมพินี', 'สวนเบญจกิติ', 'สวนจตุจักร'];
const CUSTOM = 'custom';

const dayLabel = new Intl.DateTimeFormat('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });
const atTime = (date: Date, hours: number) => { const next = new Date(date); next.setHours(hours, 0, 0, 0); return next; };
const nextWeekday = (weekday: number) => { const date = new Date(); date.setDate(date.getDate() + (((weekday - date.getDay() + 7) % 7) || 7)); return date; };
const toLocalInput = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

function whenOptions() {
  const tomorrow = atTime(new Date(Date.now() + 86400000), 6);
  const saturday = atTime(nextWeekday(6), 7);
  const sunday = atTime(nextWeekday(0), 7);
  const weekend = [saturday, sunday]
    .filter(date => date.toDateString() !== tomorrow.toDateString())
    .sort((a, b) => a.getTime() - b.getTime())
    .map(date => ({ value: date.toISOString(), label: `${dayLabel.format(date)} 07:00` }));
  return [{ value: tomorrow.toISOString(), label: 'พรุ่งนี้ 06:00' }, ...weekend, { value: CUSTOM, label: 'เลือกเอง' }];
}

// Every field has a sensible default, so the fastest path is a single tap on "เปิดตี้".
export default function PartyCreate() {
  useDocumentTitle('ตั้งหัวตี้ | Lowrox');
  const { user } = useAuth();
  const { summary } = useMyLevel();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const whens = useMemo(whenOptions, []);
  const places = useMemo(() => {
    const mine = (user?.onboardingData?.availabilityWindows ?? []).map(window => window.areaLabel.trim()).filter(Boolean);
    return [...new Set([...mine, ...DEFAULT_PLACES])].slice(0, 4);
  }, [user]);
  const levelOptions = summary
    ? [{ value: summary.level.id, label: `เลเวลเดียวกับฉัน (${summary.level.label})` }, { value: 'all', label: 'ทุกเลเวล' }]
    : [{ value: 'all', label: 'ทุกเลเวล' }];

  const [templateId, setTemplateId] = useState(params.get('type') === 'hyrox' ? 'hyrox' : 'easy');
  const template = TEMPLATES.find(item => item.id === templateId)!;
  const [title, setTitle] = useState('');
  const [when, setWhen] = useState(whens[0].value);
  const [customWhen, setCustomWhen] = useState(toLocalInput(new Date(whens[0].value)));
  const [place, setPlace] = useState(places[0]);
  const [customPlace, setCustomPlace] = useState('');
  const [levelId, setLevelId] = useState<string>(levelOptions[0].value);
  const [capacity, setCapacity] = useState(4);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const finalTitle = title.trim() || template.title;
  const finalPlace = (place === CUSTOM ? customPlace : place).trim();
  const finalDate = when === CUSTOM ? (customWhen ? new Date(customWhen).toISOString() : '') : when;
  const previewParticipants = user ? [participantFrom(user, summary?.level.id)] : [];

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    if (!finalPlace) { setError('ระบุสถานที่นัดซ้อม'); return; }
    if (!finalDate || new Date(finalDate).getTime() <= Date.now()) { setError('เลือกเวลาที่ยังมาไม่ถึง'); return; }
    setSaving(true);
    setError('');
    try {
      const party = await createParty(user, summary?.level.id, {
        title: finalTitle,
        type: template.type,
        date: finalDate,
        location: finalPlace,
        description: note.trim() || template.description,
        levelId: levelId as PartyLevel,
        style: template.id,
        capacity,
      });
      navigate(`/events/${party.id}`, { state: { justCreated: true } });
    } catch {
      setError('เปิดตี้ไม่สำเร็จ กรุณาลองอีกครั้ง');
      setSaving(false);
    }
  };

  return (
    <PageShell className="party-create-page">
      <div className="page-container party-create">
        <Link to="/events" className="party-back"><ArrowLeft size={18} /> กลับหน้ากิจกรรม</Link>
        <h1 className="heading-2">ตั้งหัวตี้</h1>
        <p className="party-create-lead">เลือกไม่กี่อย่าง แล้วรอคนเลเวลใกล้กันมาจอย ทุกช่องตั้งค่าเริ่มต้นไว้ให้แล้ว</p>

        <div className="party-create-grid">
          <form className="party-form" onSubmit={submit} noValidate>
            <fieldset className="party-field">
              <legend>ซ้อมอะไร</legend>
              <div className="party-templates">
                {TEMPLATES.map(({ id, label, icon: Icon }) => (
                  <button key={id} type="button" className={`party-template${templateId === id ? ' is-selected' : ''}`} aria-pressed={templateId === id} onClick={() => setTemplateId(id)}>
                    <Icon size={22} aria-hidden="true" />{label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="party-field">
              <legend>เมื่อไร</legend>
              <PillGroup options={whens} value={when} onSelect={setWhen} className="party-pills" />
              {when === CUSTOM && <input className="form-control" type="datetime-local" aria-label="วันและเวลา" value={customWhen} min={toLocalInput(new Date())} onChange={e => setCustomWhen(e.target.value)} />}
            </fieldset>

            <fieldset className="party-field">
              <legend>ที่ไหน</legend>
              <PillGroup options={[...places.map(item => ({ value: item, label: item })), { value: CUSTOM, label: 'ที่อื่น' }]} value={place} onSelect={setPlace} className="party-pills" />
              {place === CUSTOM && <input className="form-control" aria-label="สถานที่" placeholder="เช่น สวนรถไฟ ประตู 1" value={customPlace} onChange={e => setCustomPlace(e.target.value)} autoFocus />}
            </fieldset>

            <fieldset className="party-field">
              <legend>รับเลเวลไหน</legend>
              <PillGroup options={levelOptions} value={levelId} onSelect={setLevelId} className="party-pills" />
            </fieldset>

            <fieldset className="party-field">
              <legend>รับกี่คน (รวมคุณ)</legend>
              <div className="party-stepper">
                <button type="button" aria-label="ลดจำนวนคน" disabled={capacity <= Math.max(2, previewParticipants.length)} onClick={() => setCapacity(value => value - 1)}><Minus size={18} /></button>
                <output aria-live="polite">{capacity} คน</output>
                <button type="button" aria-label="เพิ่มจำนวนคน" disabled={capacity >= 12} onClick={() => setCapacity(value => value + 1)}><Plus size={18} /></button>
              </div>
            </fieldset>

            <details className="party-more">
              <summary>ตั้งชื่อตี้และรายละเอียดเอง (ไม่บังคับ)</summary>
              <label className="party-more-field">ชื่อตี้<input className="form-control" placeholder={template.title} value={title} onChange={e => setTitle(e.target.value)} maxLength={80} /></label>
              <label className="party-more-field">รายละเอียด<textarea className="form-control" rows={3} placeholder={template.description} value={note} onChange={e => setNote(e.target.value)} maxLength={500} /></label>
            </details>

            {error && <p className="party-form-error" role="alert">{error}</p>}
            <button type="submit" className="btn btn-primary btn-md btn-cta party-submit" disabled={saving}>{saving ? 'กำลังเปิดตี้…' : 'เปิดตี้'}</button>
          </form>

          <aside className="party-preview" aria-label="ตัวอย่างตี้">
            <p className="party-preview-label">ตัวอย่างที่คนอื่นจะเห็น</p>
            <div className="party-preview-card">
              <div className="party-preview-top">
                <span className="level-chip" data-level={levelId}>{levelId === 'all' ? 'ทุกเลเวล' : LEVELS.find(item => item.id === levelId)?.label}</span>
                <span className="party-preview-type">{template.label}</span>
              </div>
              <h2>{finalTitle}</h2>
              <p><CalendarDays size={15} aria-hidden="true" /> {whens.find(item => item.value === when && when !== CUSTOM)?.label ?? (customWhen ? new Date(customWhen).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : 'เลือกเวลา')}</p>
              <p><MapPin size={15} aria-hidden="true" /> {finalPlace || 'เลือกสถานที่'}</p>
              <PartySlots participants={previewParticipants} capacity={capacity} />
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
