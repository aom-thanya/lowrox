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
