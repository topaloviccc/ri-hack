import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';

export function RedemptionCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <View className="w-full items-center gap-3 rounded-xl border border-border bg-background p-4">
      <Text variant="label" className="text-center">Your coupon code</Text>
      <View className="w-full flex-row items-center justify-center gap-3">
        <Text variant="title" className="text-center tracking-widest" selectable
          accessibilityLabel={`Coupon code ${code.split('').join(' ')}`}>
          {code}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copied ? 'Coupon code copied' : 'Copy coupon code'}
          onPress={async () => {
            await Clipboard.setStringAsync(code);
            setCopied(true);
          }}
          className="min-h-11 min-w-11 flex-row items-center justify-center gap-1 rounded-xl bg-secondary/30 px-2 active:opacity-70"
        >
          <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} />
          <Text variant="caption">{copied ? 'Copied' : 'Copy'}</Text>
        </Pressable>
      </View>
      <Text variant="caption" className="text-center">Show this code when you use your coupon.</Text>
    </View>
  );
}
