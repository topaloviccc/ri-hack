const THOUSAND = 1000;

/** 1234 -> '1.2k', 48000 -> '48k', 950 -> '950' */
export const formatCount = (n: number) => {
  if (n < THOUSAND) return String(n);
  const k = n / THOUSAND;
  return `${k < 10 ? k.toFixed(1).replace(/\.0$/, '') : Math.round(k)}k`;
};

/** 1234 -> '1,234'. Fixed locale so numbers read the same on every device. */
export const formatNumber = (n: number) => n.toLocaleString('en-GB');

/** (1, 'course') -> '1 course', (1240, 'coin') -> '1,240 coins'. */
export const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${formatNumber(count)} ${count === 1 ? singular : plural}`;

/** 95 -> '1 h 35 min', 45 -> '45 min' */
export const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
};

/** ISO -> '2h ago' / '3d ago' relative to now. */
export const formatTimeAgo = (iso: string) => {
  const hours = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000));
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
};

const KB = 1024;

/** 820000 -> '801 KB', 1480000 -> '1.4 MB' */
export const formatBytes = (bytes: number) => {
  if (bytes < KB * KB) return `${Math.max(1, Math.round(bytes / KB))} KB`;
  return `${(bytes / (KB * KB)).toFixed(1).replace(/\.0$/, '')} MB`;
};

/** 'beginner' -> 'Beginner' */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
