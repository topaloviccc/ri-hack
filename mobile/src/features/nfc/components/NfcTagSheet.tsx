import { ScrollView, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { NfcRecord, NfcTag } from '@/features/nfc/types';

const KIND_LABELS = { text: 'Text', uri: 'Link', mime: 'Data', other: 'Unknown record' } as const;

function RecordBody({ record }: { record: NfcRecord }) {
  switch (record.kind) {
    case 'text':
      return <Text selectable>{record.text}</Text>;
    case 'uri':
      return <Text selectable>{record.uri}</Text>;
    case 'mime':
      return (
        <>
          <Text variant="mono">{record.mimeType}</Text>
          <Text selectable>{record.text}</Text>
        </>
      );
    case 'other':
      return (
        <Text variant="mono">{`${record.type || 'no type'} · ${record.byteLength} bytes`}</Text>
      );
  }
}

export type NfcTagSheetProps = {
  tag: NfcTag | null;
  onClose: () => void;
};

/** Shows what a scanned NFC tag contains. */
export function NfcTagSheet({ tag, onClose }: NfcTagSheetProps) {
  return (
    <BottomSheet visible={!!tag} title="NFC tag" onClose={onClose}>
      <ScrollView className="max-h-96" contentContainerClassName="gap-3 px-4 pb-2">
        {tag?.id ? <Text variant="mono">{`ID ${tag.id}`}</Text> : null}
        {tag?.records.length === 0 ? (
          <Text variant="caption">This tag has no readable content.</Text>
        ) : null}
        {tag?.records.map((record) => (
          <Card key={record.key} className="gap-1 p-3">
            <Text variant="label">{KIND_LABELS[record.kind]}</Text>
            <RecordBody record={record} />
          </Card>
        ))}
      </ScrollView>
      <View className="px-4 pt-2">
        <Button label="Close" onPress={onClose} className="self-stretch" />
      </View>
    </BottomSheet>
  );
}
