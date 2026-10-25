import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';

export type BottomSheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/** Slide-up panel over a dimmed backdrop; tapping the backdrop or Back closes it. */
export function BottomSheet({ visible, title, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={onClose}
        className="flex-1 bg-overlay/40"
      />
      <View className="rounded-t-card bg-surface pt-4" style={{ paddingBottom: insets.bottom + 8 }}>
        <Text variant="heading" className="px-4 pb-2" accessibilityRole="header">
          {title}
        </Text>
        {children}
      </View>
    </Modal>
  );
}
