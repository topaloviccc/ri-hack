/** Stable decorative demo values for real UUIDs; never used for authoritative data. */
export function demoSample<T>(id: string, samples: readonly T[]): T {
  if (samples.length === 0) throw new Error('Demo samples must not be empty');
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return samples[hash % samples.length];
}
