// Intl.DateTimeFormat construction is expensive; build each formatter once and reuse it.
const shortDateTime = new Intl.DateTimeFormat('th-TH', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

const fullDateTime = new Intl.DateTimeFormat('th-TH', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short'
});

export const formatDateTimeShort = (dateString: string) => shortDateTime.format(new Date(dateString));
export const formatDateTimeFull = (dateString: string) => fullDateTime.format(new Date(dateString));

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? '' : 's'} ago`;

// "just now", "5 mins ago", "1 hr ago", "2 days ago"; past 30 days, the short date.
export function formatTimeAgo(dateString: string, now = Date.now()) {
  const elapsed = Math.max(0, now - new Date(dateString).getTime());
  if (elapsed < MINUTE) return 'just now';
  if (elapsed < HOUR) return plural(Math.floor(elapsed / MINUTE), 'min');
  if (elapsed < DAY) return plural(Math.floor(elapsed / HOUR), 'hr');
  if (elapsed < 30 * DAY) return plural(Math.floor(elapsed / DAY), 'day');
  return formatDateTimeShort(dateString);
}
