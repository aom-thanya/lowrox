// One access predicate for listings, counts, details and join checks.
export function isPublicEvent(event) {
  return Boolean(event && ['published', 'cancelled', 'completed'].includes(event.status)
    && (event.visibility == null || event.visibility === 'public')
    && !event.deletedAt && !event.deleted_at && !event.isDeleted);
}
export function eventHasEnded(event, now = Date.now()) {
  return event.status === 'completed' || new Date(event.endDate || event.date).getTime() <= now;
}
export function eventIsOngoing(event, now = Date.now()) {
  return event.status !== 'cancelled' && !eventHasEnded(event, now) && new Date(event.date).getTime() <= now;
}
export function eventStatusLabel(event, now = Date.now()) {
  if (event.status === 'cancelled') return 'ยกเลิก';
  if (eventHasEnded(event, now)) return 'จบแล้ว';
  if (eventIsOngoing(event, now)) return 'กำลังดำเนินอยู่';
  if (Number.isFinite(event.capacity) && Number.isFinite(event.participantCount) && event.participantCount >= event.capacity) return 'เต็มแล้ว';
  if (event.registrationClosed || !event.joinUrl) return 'ปิดรับ';
  return 'เปิดรับ';
}
export function selectHostedEvents(events, userId, now = Date.now()) {
  const visible = events.filter(event => isPublicEvent(event) && String(event.hostUserId) === String(userId));
  const upcoming = visible.filter(event => event.status !== 'cancelled' && !eventHasEnded(event, now));
  upcoming.sort((a, b) => Number(eventIsOngoing(b, now)) - Number(eventIsOngoing(a, now)) || new Date(a.date) - new Date(b.date));
  const past = visible.filter(event => event.status !== 'cancelled' && eventHasEnded(event, now)).sort((a, b) => new Date(b.date) - new Date(a.date));
  const cancelled = visible.filter(event => event.status === 'cancelled').sort((a, b) => new Date(b.date) - new Date(a.date));
  return { upcoming, past, cancelled };
}
