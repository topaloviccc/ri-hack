import { useState } from 'react';
import { View } from 'react-native';
import * as Linking from 'expo-linking';
import { Text } from '@/components/ui/Text';
import type { CoverImage } from '@/features/courses/types';

export function CoverImageCredit({ image, compact = false, onImage = false }: {
  image?: CoverImage | null; compact?: boolean; onImage?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!image) return null;
  const open = (url: string) => { void Linking.openURL(url).catch(() => setFailed(true)); };
  const textClass = onImage ? 'text-xs text-on-image' : 'text-xs';
  return (
    <View className="gap-1">
      {!compact && image.caption ? <Text variant="caption">{image.caption}</Text> : null}
      <Text
        variant="caption" className={textClass} numberOfLines={compact ? 1 : undefined}
        accessibilityRole="link" accessibilityLabel={`Photo by ${image.author}. View image source.`}
        onPress={(event) => { event.stopPropagation(); open(image.sourceUrl); }}
      >
        Photo: {image.author} · Wikimedia Commons
      </Text>
      <Text
        variant="caption" className={textClass} accessibilityRole="link"
        accessibilityLabel={`Image license: ${image.license}`}
        onPress={(event) => { event.stopPropagation(); open(image.licenseUrl); }}
      >
        {image.license}
      </Text>
      {failed ? <Text variant="caption">Could not open the image source.</Text> : null}
    </View>
  );
}
