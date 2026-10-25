import MarkdownIt, { type Token } from 'markdown-it';

export type MarkdownNode = {
  key: string;
  type: string;
  tag: string;
  content: string;
  attrs: Record<string, string>;
  children: MarkdownNode[];
};
export type MarkdownSection = { nodes: MarkdownNode[]; activity: boolean };
const parser = new MarkdownIt({ html: false, linkify: true });

// Native reflection checklists. Mark raw list-item content before inline parsing so escaped
// brackets and markers inside code blocks remain ordinary Markdown text.
parser.core.ruler.before('inline', 'lesson_tasks', (state) => {
  state.tokens.forEach((token, index) => {
    if (token.type !== 'list_item_open' || state.tokens[index + 1]?.type !== 'paragraph_open')
      return;
    const inline = state.tokens[index + 2];
    const match = inline?.type === 'inline' && /^\[([ xX])\]\s+/.exec(inline.content);
    if (!match) return;
    token.attrSet('task', match[1].toLowerCase() === 'x' ? 'checked' : 'unchecked');
    inline.content = inline.content.slice(match[0].length);
  });
});

// ::: reveal A hint title ... ::: is an authorable, native disclosure, not embedded HTML.
parser.block.ruler.before(
  'fence',
  'lesson_reveal',
  (state, start, end, silent) => {
    const line = (index: number) =>
      state.src.slice(state.bMarks[index] + state.tShift[index], state.eMarks[index]);
    if (state.sCount[start] - state.blkIndent >= 4) return false;
    const match = /^:::\s+reveal\s+(.+?)\s*$/.exec(line(start));
    if (!match) return false;
    let close = start + 1;
    let fence = '';
    let depth = 1;
    for (; close < end; close++) {
      const current = line(close);
      const marker = /^(`{3,}|~{3,})/.exec(current)?.[1];
      if (marker && !fence) fence = marker;
      else if (marker && fence && marker[0] === fence[0] && marker.length >= fence.length)
        fence = '';
      else if (!fence && /^:::\s+reveal\s+/.test(current)) depth++;
      else if (!fence && /^:::\s*$/.test(current) && --depth === 0) break;
    }
    if (close === end) return false;
    if (silent) return true;
    const open = state.push('reveal_open', 'reveal', 1);
    open.block = true;
    open.attrSet('title', match[1]);
    state.md.block.tokenize(state, start + 1, close);
    state.push('reveal_close', 'reveal', -1).block = true;
    state.line = close + 1;
    return true;
  },
  { alt: ['paragraph', 'reference', 'blockquote', 'list'] },
);

function tree(tokens: Token[], parent = 'md'): MarkdownNode[] {
  const root: MarkdownNode[] = [];
  const stack = [root];
  for (const [index, token] of tokens.entries()) {
    if (token.nesting === -1) {
      stack.pop();
      continue;
    }
    const node: MarkdownNode = {
      key: `${parent}.${index}`,
      type: token.type.replace(/_open$/, ''),
      tag: token.tag,
      content: token.content,
      attrs: Object.fromEntries((token.attrs ?? []).map(([name, value]) => [name, String(value)])),
      children: token.children ? tree(token.children, `${parent}.${index}`) : [],
    };
    stack[stack.length - 1].push(node);
    if (token.nesting === 1) stack.push(node.children);
  }
  return root;
}

export function markdownText(nodes: MarkdownNode[]): string {
  return nodes
    .map((node) => (node.children.length ? markdownText(node.children) : node.content))
    .join('');
}

export function parseMarkdown(source: string): MarkdownNode[] {
  return tree(parser.parse(source, {}));
}

/** Keep course cards, splitting only real top-level headings, never text inside fences/quotes. */
export function markdownSections(source: string): MarkdownSection[] {
  const sections: MarkdownSection[] = [];
  for (const node of parseMarkdown(source)) {
    if (!sections.length || (node.type === 'heading' && ['h1', 'h2'].includes(node.tag))) {
      sections.push({
        nodes: [],
        activity:
          node.type === 'heading' &&
          /exercise|puzzle|try |your own/i.test(markdownText(node.children)),
      });
    }
    sections[sections.length - 1].nodes.push(node);
  }
  return sections;
}
