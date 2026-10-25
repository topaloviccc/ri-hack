import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Image } from '@/components/ui/Image';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import type { BlockableApp } from '@/features/focus/types';

export type BlockableAppRowProps = {
  app: BlockableApp;
  isBlocked: boolean;
  onToggle: (packageName: string, isBlocked: boolean) => void;
};

export const BlockableAppRow = memo(function BlockableAppRow({
  app,
  isBlocked,
  onToggle,
}: BlockableAppRowProps) {
  const handleToggle = () => onToggle(app.packageName, !isBlocked);
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={`Block ${app.name} during courses`}
      accessibilityState={{ checked: isBlocked }}
      onPress={handleToggle}
      className="min-h-14 flex-row items-center gap-3 px-4 py-2 active:bg-surface"
    >
      {app.iconUri ? (
        <Image uri={app.iconUri} contentFit="contain" className="h-10 w-10" />
      ) : (
        <View className="h-10 w-10 rounded-full bg-border" />
      )}
      <View className="flex-1">
        <Text variant="body" numberOfLines={1}>
          {app.name}
        </Text>
        <Text variant="caption" numberOfLines={1}>
          {app.packageName}
        </Text>
      </View>
      {/* The row is the accessible control; the switch is only its visual. */}
      <Switch
        value={isBlocked}
        onValueChange={handleToggle}
        importantForAccessibility="no-hide-descendants"
      />
    </Pressable>
  );
});
