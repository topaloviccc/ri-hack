const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar day as 'YYYY-MM-DD' (the format react-native-calendars uses). */
export const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** 'HH:mm' in local time. */
export const formatTime = (iso: string) => {
  const date = new Date(iso);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** ISO -> 'Saturday, 24 October, 14:05' in local time. */
export const formatDateTime = (iso: string) =>
  `${formatDayHeading(toDateKey(new Date(iso)))}, ${formatTime(iso)}`;

/** '2026-10-24' -> 'Saturday, 24 October' */
export const formatDayHeading = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};
