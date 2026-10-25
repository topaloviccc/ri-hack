import { ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Image } from '@/components/ui/Image';
import { MarkdownInline } from './MarkdownInline';
import { markdownText, type MarkdownNode } from './parse-markdown';

export function MarkdownImage({ node }: { node: MarkdownNode }) {
  const alt = node.content || markdownText(node.children);
  return (
    <View className="gap-2">
      <Image
        uri={node.attrs.src}
        accessibilityLabel={alt || 'Lesson illustration'}
        contentFit="contain"
        className="aspect-video w-full rounded-xl bg-secondary/15"
      />
      {alt ? (
        <Text variant="caption" className="text-center text-xs text-text/80">
          {alt}
        </Text>
      ) : null}
    </View>
  );
}

export function MarkdownTable({ node }: { node: MarkdownNode }) {
  const rows = node.children.flatMap((group) => group.children);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator accessibilityLabel="Markdown table">
      <View className="overflow-hidden rounded-xl border border-border">
        {rows.map((row, index) => (
          <View key={index} className="flex-row">
            {row.children.map((cell, column) => (
              <View
                key={column}
                className={
                  cell.tag === 'th'
                    ? 'w-40 border-b border-r border-border bg-secondary/20 p-3'
                    : 'w-40 border-b border-r border-border p-3'
                }
              >
                <Text variant={cell.tag === 'th' ? 'label' : 'body'} className="leading-6">
                  <MarkdownInline nodes={cell.children} />
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
