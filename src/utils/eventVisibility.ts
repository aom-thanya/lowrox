import type { EventRecord, UserId } from '../types/models';
// One access predicate for listings, counts, details and join checks.
export function isPublicEvent(event: EventRecord | null | undefined) {
  return Boolean(event && ['published', 'cancelled', 'completed'].includes(event.status)
    && (event.visibility == null || event.visibility === 'public')
    && !event.deletedAt && !event.deleted_at && !event.isDeleted);
}
export function eventHasEnded(event: Pick<EventRecord, 'date' | 'endDate' | 'status'>, now = Date.now()) {
  return event.status === 'completed' || new Date(event.endDate || event.date).getTime() <= now;
}
export function eventIsOngoing(event: EventRecord, now = Date.now()) {
  return event.status !== 'cancelled' && !eventHasEnded(event, now) && new Date(event.date).getTime() <= now;
}
export function eventStatusLabel(event: EventRecord, now = Date.now()) {
  if (event.status === 'cancelled') return 'ยกเลิก';
  if (eventHasEnded(event, now)) return 'จบแล้ว';
  if (eventIsOngoing(event, now)) return 'กำลังดำเนินอยู่';
  if (Number.isFinite(event.capacity) && Number.isFinite(event.participantCount) && event.participantCount! >= event.capacity!) return 'เต็มแล้ว';
  if (event.registrationClosed || !event.joinUrl) return 'ปิดรับ';
  return 'เปิดรับ';
}
export function selectHostedEvents(events: EventRecord[], userId: UserId, now = Date.now()) {
  const visible = events.filter(event => isPublicEvent(event) && String(event.hostUserId) === String(userId));
  const upcoming = visible.filter(event => event.status !== 'cancelled' && !eventHasEnded(event, now));
  upcoming.sort((a, b) => Number(eventIsOngoing(b, now)) - Number(eventIsOngoing(a, now)) || new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = visible.filter(event => event.status !== 'cancelled' && eventHasEnded(event, now)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const cancelled = visible.filter(event => event.status === 'cancelled').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return { upcoming, past, cancelled };
}
