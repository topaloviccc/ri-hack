import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { MarkdownInline, openMarkdownLink } from './MarkdownInline';
import { MarkdownImage } from './MarkdownMedia';
import { markdownText, type MarkdownNode } from './parse-markdown';

export function MarkdownParagraph({ node }: { node: MarkdownNode }) {
  const children = node.children.flatMap((child) =>
    child.type === 'inline' ? child.children : [child],
  );
  const chunks: MarkdownNode[][] = [];
  for (const child of children) {
    if (
      child.type === 'image' ||
      (child.type === 'link' && child.children.some((item) => item.type === 'image'))
    )
      chunks.push([child], []);
    else {
      if (!chunks.length) chunks.push([]);
      chunks[chunks.length - 1].push(child);
    }
  }
  return (
    <View className="gap-3">
      {chunks
        .filter((chunk) => chunk.length)
        .map((chunk, index) => {
          const first = chunk[0];
          if (first.type === 'image') return <MarkdownImage key={index} node={first} />;
          if (first.type === 'link' && first.children[0]?.type === 'image')
            return (
              <Pressable
                key={index}
                accessibilityRole="link"
                accessibilityLabel={markdownText(first.children)}
                onPress={() => openMarkdownLink(first.attrs.href)}
              >
                <MarkdownImage node={first.children[0]} />
              </Pressable>
            );
          return (
            <Text key={index} variant="body" className="leading-7">
              <MarkdownInline nodes={chunk} />
            </Text>
          );
        })}
    </View>
  );
}
