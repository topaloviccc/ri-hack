/** One NDEF record, decoded as far as the app understands it. */
export type NfcRecord =
  | { key: string; kind: 'text'; text: string; language: string }
  | { key: string; kind: 'uri'; uri: string }
  | { key: string; kind: 'mime'; mimeType: string; text: string }
  | { key: string; kind: 'other'; type: string; byteLength: number };

export type NfcTag = {
  /** Hardware serial number (hex); absent when the reader doesn't expose it. */
  id?: string;
  records: NfcRecord[];
};
