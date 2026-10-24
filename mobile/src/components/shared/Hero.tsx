import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Image } from '@/components/ui/Image';
import { Scrim } from '@/components/ui/Scrim';
import { Text } from '@/components/ui/Text';

export type HeroProps = {
  imageUrl: string;
  title: string;
  /** Rendered above the title, e.g. a category chip. */
  eyebrow?: ReactNode;
};

/** Full-width photo header with the title over a scrim, for detail pages. */
export function Hero({ imageUrl, title, eyebrow }: HeroProps) {
  return (
    <View className="h-64 justify-end gap-2 bg-border p-4">
      <Image uri={imageUrl} className="absolute inset-0" />
      <Scrim />
      {eyebrow}
      <Text variant="title" className="text-on-image" accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}
