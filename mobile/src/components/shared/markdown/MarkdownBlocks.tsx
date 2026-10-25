import { Fragment } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { MarkdownInline } from './MarkdownInline';
import { MarkdownTable } from './MarkdownMedia';
import { MarkdownDisclosure } from './MarkdownWidgets';
import { MarkdownParagraph } from './MarkdownParagraph';
import { MarkdownList, MarkdownQuote } from './MarkdownContainers';
import type { MarkdownNode } from './parse-markdown';

const headingSizes: Record<string, string> = {
  h1: 'text-2xl',
  h2: 'text-xl',
  h3: 'text-lg',
  h4: 'text-base',
  h5: 'text-base',
  h6: 'text-sm',
};

const renderChildren = (nodes: MarkdownNode[]) => <MarkdownBlocks nodes={nodes} />;

export function MarkdownBlocks({ nodes }: { nodes: MarkdownNode[] }) {
  return (
    <View className="gap-4">
      {nodes.map((node, index) => {
        switch (node.type) {
          case 'heading':
            return (
              <Text
                key={index}
                variant="heading"
                accessibilityRole="header"
                className={headingSizes[node.tag] ?? 'text-lg'}
              >
                <MarkdownInline nodes={node.children} />
              </Text>
            );
          case 'paragraph':
            return <MarkdownParagraph key={index} node={node} />;
          case 'bullet_list':
          case 'ordered_list':
            return <MarkdownList key={index} node={node} renderChildren={renderChildren} />;
          case 'blockquote':
            return <MarkdownQuote key={index} node={node} renderChildren={renderChildren} />;
          case 'reveal':
            return (
              <MarkdownDisclosure key={index} id={node.key} title={node.attrs.title}>
                <MarkdownBlocks nodes={node.children} />
              </MarkdownDisclosure>
            );
          case 'table':
            return <MarkdownTable key={index} node={node} />;
          case 'fence':
          case 'code_block':
            return (
              <ScrollView key={index} horizontal className="rounded-xl bg-background p-4">
                <Text variant="mono" className="leading-6 text-text" selectable>
                  {node.content.replace(/\n$/, '')}
                </Text>
              </ScrollView>
            );
          case 'hr':
            return <View key={index} className="border-t border-border" />;
          case 'inline':
            return (
              <Text key={index} className="leading-7">
                <MarkdownInline nodes={node.children} />
              </Text>
            );
          default:
            return (
              <Fragment key={index}>
                {node.children.length ? (
                  <MarkdownBlocks nodes={node.children} />
                ) : node.content ? (
                  <Text>{node.content}</Text>
                ) : null}
              </Fragment>
            );
        }
      })}
    </View>
  );
}
