import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { MarkdownTask } from './MarkdownWidgets';
import { markdownText, type MarkdownNode } from './parse-markdown';

type ContainerProps = { node: MarkdownNode; renderChildren: (nodes: MarkdownNode[]) => ReactNode };

export function MarkdownQuote({ node, renderChildren }: ContainerProps) {
  const first = node.children[0];
  const inline = first?.children[0];
  const lead = inline?.children[0];
  const marker =
    lead?.type === 'text'
      ? /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i.exec(lead.content)
      : null;
  let children = node.children;
  if (marker) {
    const content = [...inline.children];
    content[0] = { ...lead, content: lead.content.slice(marker[0].length) };
    if (!content[0].content && content[1]?.type === 'softbreak') content.splice(0, 2);
    children = [{ ...first, children: [{ ...inline, children: content }] }, ...children.slice(1)];
  }
  return (
    <View className="gap-3 rounded-r-xl border-l-4 border-primary bg-secondary/15 p-4">
      {marker ? <Text variant="label">{marker[1].toUpperCase()}</Text> : null}
      {renderChildren(children)}
    </View>
  );
}

export function MarkdownList({ node, renderChildren }: ContainerProps) {
  const ordered = node.type === 'ordered_list';
  const start = Number(node.attrs.start ?? 1);
  return (
    <View className="gap-2">
      {node.children.map((item, index) => {
        if (item.attrs.task)
          return (
            <View key={index}>
              <MarkdownTask
                id={item.key}
                label={markdownText(item.children[0]?.children ?? [])}
                checked={item.attrs.task === 'checked'}
              >
                {renderChildren(item.children.slice(0, 1))}
              </MarkdownTask>
              {item.children.length > 1 ? (
                <View className="pl-8">{renderChildren(item.children.slice(1))}</View>
              ) : null}
            </View>
          );
        return (
          <View key={index} className="flex-row items-start gap-2">
            <Text variant="body" className="min-w-5 leading-7">
              {ordered ? `${start + index}.` : '•'}
            </Text>
            <View className="min-w-0 flex-1">{renderChildren(item.children)}</View>
          </View>
        );
      })}
    </View>
  );
}
