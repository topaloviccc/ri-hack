import { ScrollView, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { BadgeScanResult, type BadgeScanState } from '@/features/badges/components/BadgeScanResult';

export type BadgeScanSheetProps = {
  visible: boolean;
  state: BadgeScanState;
  onClose: () => void;
};

/** Pops up over whatever screen is open when a tag is scanned with the app in front. */
export function BadgeScanSheet({ visible, state, onClose }: BadgeScanSheetProps) {
  return (
    <BottomSheet visible={visible} title="Badge" onClose={onClose}>
      <ScrollView className="max-h-[32rem]" contentContainerClassName="px-4 pb-2">
        <BadgeScanResult state={state} />
      </ScrollView>
      <View className="px-4 pt-2">
        <Button label="Close" onPress={onClose} className="self-stretch" />
      </View>
    </BottomSheet>
  );
}
