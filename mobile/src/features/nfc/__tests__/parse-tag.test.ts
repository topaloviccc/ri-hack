import { parseTag } from '@/features/nfc/parse-tag';

const bytes = (text: string) => Array.from(new TextEncoder().encode(text));
const T = [0x54];
const U = [0x55];

describe('parseTag', () => {
  it('decodes a UTF-8 text record and its language', () => {
    const payload = [0x02, ...bytes('en'), ...bytes('Zdravo, Rijeka ✓')];
    const tag = parseTag({ id: '04a1b2', ndefMessage: [{ tnf: 0x01, type: T, payload }] });
    expect(tag).toEqual({
      id: '04a1b2',
      records: [{ key: 'record-0', kind: 'text', language: 'en', text: 'Zdravo, Rijeka ✓' }],
    });
  });

  it('decodes a UTF-16 text record', () => {
    const payload = [0x80 | 0x02, ...bytes('hr'), 0x00, 0x48, 0x00, 0x69];
    expect(parseTag({ ndefMessage: [{ tnf: 0x01, type: 'T', payload }] }).records[0]).toMatchObject(
      {
        kind: 'text',
        text: 'Hi',
      },
    );
  });

  it('expands the URI prefix byte', () => {
    const payload = [0x04, ...bytes('example.com/visit/1')];
    expect(parseTag({ ndefMessage: [{ tnf: 0x01, type: U, payload }] }).records[0]).toMatchObject({
      kind: 'uri',
      uri: 'https://example.com/visit/1',
    });
  });

  it('reads MIME records as text and keeps unknown ones as metadata', () => {
    const tag = parseTag({
      ndefMessage: [
        { tnf: 0x02, type: bytes('application/json'), payload: bytes('{"place":1}') },
        { tnf: 0x04, type: 'example.com:visit', payload: [1, 2, 3] },
      ],
    });
    expect(tag.records).toEqual([
      { key: 'record-0', kind: 'mime', mimeType: 'application/json', text: '{"place":1}' },
      { key: 'record-1', kind: 'other', type: 'example.com:visit', byteLength: 3 },
    ]);
  });

  it('returns no records for a tag without NDEF data', () => {
    expect(parseTag({ id: '04ff' }).records).toEqual([]);
  });
});
