import * as Linking from 'expo-linking';
import { useState } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { CoverImage } from '@/features/courses/types';

export type CoverImageCreditProps = {
  image?: CoverImage | null;
  /** One line, for cards and list rows. */
  compact?: boolean;
  /** Light text for use over a photo. */
  onImage?: boolean;
};

/** Author and license of a retrieved Commons photo; renders nothing without one. */
export function CoverImageCredit({
  image,
  compact = false,
  onImage = false,
}: CoverImageCreditProps) {
  const [hasFailed, setHasFailed] = useState(false);
  if (!image) return null;

  const open = (url: string) => {
    Linking.openURL(url).catch(() => setHasFailed(true));
  };
  const textClassName = onImage ? 'text-xs text-on-image' : 'text-xs';
  return (
    <View className="gap-1">
      {!compact && image.caption ? <Text variant="caption">{image.caption}</Text> : null}
      <Text
        variant="caption"
        className={textClassName}
        numberOfLines={compact ? 1 : undefined}
        accessibilityRole="link"
        accessibilityLabel={`Photo by ${image.author}. View image source.`}
        // Credits sit inside pressable cards; a tap here must not open the card too.
        onPress={(event) => {
          event.stopPropagation();
          open(image.sourceUrl);
        }}
      >
        Photo: {image.author} · Wikimedia Commons
      </Text>
      <Text
        variant="caption"
        className={textClassName}
        accessibilityRole="link"
        accessibilityLabel={`Image license: ${image.license}`}
        onPress={(event) => {
          event.stopPropagation();
          open(image.licenseUrl);
        }}
      >
        {image.license}
      </Text>
      {hasFailed ? <Text variant="caption">Couldn&apos;t open the image source.</Text> : null}
    </View>
  );
}
