import { tagCode } from '@/features/nfc/tag-code';
import type { NfcRecord } from '@/features/nfc/types';

// Omit per record kind; Omit on the whole union would drop every kind-specific field.
type RecordInput = {
  [K in NfcRecord['kind']]: Omit<Extract<NfcRecord, { kind: K }>, 'key'>;
}[NfcRecord['kind']];

const tag = (...records: RecordInput[]) => ({
  records: records.map((record, i) => ({ ...record, key: `record-${i}` }) as NfcRecord),
});

describe('tagCode', () => {
  it('reads the code from the app link', () => {
    expect(tagCode(tag({ kind: 'uri', uri: 'mobile://nfc/trsat-stairs' }))).toBe('trsat-stairs');
    expect(tagCode(tag({ kind: 'uri', uri: 'MOBILE://nfc/trsat-stairs/' }))).toBe('trsat-stairs');
  });

  it('falls back to a plain-text code', () => {
    expect(tagCode(tag({ kind: 'text', text: ' trsat-stairs\n', language: 'en' }))).toBe(
      'trsat-stairs',
    );
  });

  it('prefers the app link over text on the same tag', () => {
    expect(
      tagCode(
        tag(
          { kind: 'text', text: 'hello', language: 'en' },
          { kind: 'uri', uri: 'mobile://nfc/trsat-stairs' },
        ),
      ),
    ).toBe('trsat-stairs');
  });

  it('finds nothing on tags that are not ours', () => {
    expect(tagCode(tag({ kind: 'uri', uri: 'https://example.com/trsat-stairs' }))).toBeNull();
    expect(tagCode(tag({ kind: 'text', text: 'Welcome to Rijeka!', language: 'en' }))).toBeNull();
    expect(tagCode(tag({ kind: 'mime', mimeType: 'text/plain', text: 'trsat-stairs' }))).toBeNull();
    expect(tagCode({ records: [] })).toBeNull();
  });
});
