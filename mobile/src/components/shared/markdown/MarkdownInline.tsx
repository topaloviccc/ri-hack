import { Alert, Text as NativeText } from 'react-native';
import * as Linking from 'expo-linking';
import type { MarkdownNode } from './parse-markdown';
import { markdownText } from './parse-markdown';

export function openMarkdownLink(url: string) {
  Linking.openURL(url).catch(() => Alert.alert('Could not open link', 'Please try again.'));
}

export function MarkdownInline({ nodes }: { nodes: MarkdownNode[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        const children = <MarkdownInline nodes={node.children} />;
        switch (node.type) {
          case 'text':
            return node.content;
          case 'inline':
            return <MarkdownInline key={index} nodes={node.children} />;
          case 'strong':
            return (
              <NativeText key={index} className="font-sans-bold">
                {children}
              </NativeText>
            );
          case 'em':
            return (
              <NativeText key={index} className="font-serif-italic">
                {children}
              </NativeText>
            );
          case 's':
            return (
              <NativeText key={index} className="line-through">
                {children}
              </NativeText>
            );
          case 'code_inline':
            return (
              <NativeText key={index} className="bg-secondary/25 font-mono text-sm">
                {node.content}
              </NativeText>
            );
          case 'softbreak':
            return ' ';
          case 'hardbreak':
            return '\n';
          case 'link':
            return (
              <NativeText
                key={index}
                accessibilityRole="link"
                className="text-text underline"
                onPress={(event) => {
                  event.stopPropagation();
                  openMarkdownLink(node.attrs.href);
                }}
              >
                {children}
              </NativeText>
            );
          case 'image':
            return (
              <NativeText
                key={index}
                accessibilityRole="link"
                className="underline"
                onPress={() => openMarkdownLink(node.attrs.src)}
              >
                {node.content || markdownText(node.children) || 'Image'}
              </NativeText>
            );
          default:
            return node.children.length ? (
              <MarkdownInline key={index} nodes={node.children} />
            ) : (
              node.content
            );
        }
      })}
    </>
  );
}
