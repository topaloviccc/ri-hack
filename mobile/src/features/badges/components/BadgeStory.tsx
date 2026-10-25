import { View } from 'react-native';

import { MarkdownBlocks, parseMarkdown } from '@/components/shared/markdown';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import type { BadgeResponse } from '@/features/badges/api/badges.dto';

export type BadgeStoryProps = { badge: BadgeResponse };

/** A badge's picture, teaser and story; the story stays hidden until the badge is collected. */
export function BadgeStory({ badge }: BadgeStoryProps) {
  return (
    <View className="gap-3">
      <Image
        uri={badge.imageUrl}
        className="aspect-[4/3] w-full rounded-card bg-border"
        accessibilityLabel={`Photo: ${badge.name}`}
      />
      <Text variant="title" accessibilityRole="header">
        {badge.name}
      </Text>
      {badge.hook ? (
        <Text variant="quote" className="text-2xl">
          {badge.hook}
        </Text>
      ) : null}
      {badge.subtitle ? <Text variant="label">{badge.subtitle}</Text> : null}
      {badge.story ? (
        <MarkdownBlocks nodes={parseMarkdown(badge.story)} />
      ) : (
        <Text variant="caption">Find the tag to read the story.</Text>
      )}
    </View>
  );
}
