import type { NfcTag } from '@/features/nfc/types';

/** Tags written for the app carry mobile://nfc/<code>; that's also the app's deep link. */
const TAG_URI_PREFIX = 'mobile://nfc/';
// Matches the backend's public_code column (varchar 120); anything else isn't ours.
const CODE_PATTERN = /^[A-Za-z0-9_-]{1,120}$/;

const asCode = (value: string) => {
  const code = value.trim().replace(/\/+$/, '');
  return CODE_PATTERN.test(code) ? code : null;
};

/** The badge code a tag carries, from its app link or a plain-text record; null if none. */
export function tagCode(tag: NfcTag): string | null {
  for (const record of tag.records) {
    if (record.kind === 'uri' && record.uri.toLowerCase().startsWith(TAG_URI_PREFIX)) {
      const code = asCode(record.uri.slice(TAG_URI_PREFIX.length));
      if (code) return code;
    }
  }
  for (const record of tag.records) {
    if (record.kind === 'text') {
      const code = asCode(record.text);
      if (code) return code;
    }
  }
  return null;
}
