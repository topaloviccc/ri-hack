import type { NfcRecord, NfcTag } from '@/features/nfc/types';

/** Raw record/tag shapes from react-native-nfc-manager (Android sends `type` as bytes, iOS as text). */
type RawRecord = { tnf: number; type: number[] | string; payload: number[] };
type RawTag = { id?: string; ndefMessage?: RawRecord[] };

const TNF_WELL_KNOWN = 0x01;
const TNF_MIME_MEDIA = 0x02;
const TNF_ABSOLUTE_URI = 0x03;
const RTD_TEXT = 'T';
const RTD_URI = 'U';
const TEXT_UTF16_FLAG = 0x80;
const TEXT_LANG_LENGTH_MASK = 0x3f;

// NFC Forum URI Record Type Definition: the first payload byte abbreviates a prefix.
// prettier-ignore
const URI_PREFIXES = [
  '', 'http://www.', 'https://www.', 'http://', 'https://', 'tel:', 'mailto:',
  'ftp://anonymous:anonymous@', 'ftp://ftp.', 'ftps://', 'sftp://', 'smb://', 'nfs://', 'ftp://',
  'dav://', 'news:', 'telnet://', 'imap:', 'rtsp://', 'urn:', 'pop:', 'sip:', 'sips:', 'tftp:',
  'btspp://', 'btl2cap://', 'btgoep://', 'tcpobex://', 'irdaobex://', 'file://', 'urn:epc:id:',
  'urn:epc:tag:', 'urn:epc:pat:', 'urn:epc:raw:', 'urn:epc:', 'urn:nfc:',
] as const;

const utf8 = (bytes: number[]) => new TextDecoder().decode(new Uint8Array(bytes));

const utf16be = (bytes: number[]) => {
  let text = '';
  for (let i = 0; i + 1 < bytes.length; i += 2)
    text += String.fromCharCode((bytes[i] << 8) | bytes[i + 1]);
  return text;
};

const typeName = (type: RawRecord['type']) => (typeof type === 'string' ? type : utf8(type));

function parseRecord(record: RawRecord, index: number): NfcRecord {
  // Records never reorder within a scanned tag, so position is a stable key.
  const key = `record-${index}`;
  const type = typeName(record.type);
  const { payload } = record;

  if (record.tnf === TNF_WELL_KNOWN && type === RTD_TEXT && payload.length > 0) {
    const status = payload[0];
    const langLength = status & TEXT_LANG_LENGTH_MASK;
    const body = payload.slice(1 + langLength);
    return {
      key,
      kind: 'text',
      language: utf8(payload.slice(1, 1 + langLength)),
      text: status & TEXT_UTF16_FLAG ? utf16be(body) : utf8(body),
    };
  }
  if (record.tnf === TNF_WELL_KNOWN && type === RTD_URI && payload.length > 0) {
    return { key, kind: 'uri', uri: (URI_PREFIXES[payload[0]] ?? '') + utf8(payload.slice(1)) };
  }
  if (record.tnf === TNF_ABSOLUTE_URI) return { key, kind: 'uri', uri: type };
  if (record.tnf === TNF_MIME_MEDIA)
    return { key, kind: 'mime', mimeType: type, text: utf8(payload) };
  return { key, kind: 'other', type, byteLength: payload.length };
}

/** Turns a raw tag event into display-ready records; a tag without NDEF data has none. */
export function parseTag(raw: RawTag): NfcTag {
  return { id: raw.id, records: (raw.ndefMessage ?? []).map(parseRecord) };
}
