import { fireEvent, render, screen } from '@testing-library/react-native';
import * as Linking from 'expo-linking';
import { MarkdownBlocks } from './MarkdownBlocks';
import { MarkdownInteractions } from './MarkdownWidgets';
import { markdownSections, markdownText, parseMarkdown } from './parse-markdown';

const mount = (source: string) => render(<MarkdownBlocks nodes={parseMarkdown(source)} />);

describe('native lesson Markdown', () => {
  it('renders headings, emphasis, nested lists and inline/fenced code as Markdown', async () => {
    await mount(
      '# Volcanoes\n\n**Observe** the *landscape* and `record` a feature.\n\n1. Look closely\n2. Compare\n   - Nested observation\n\n```text\n## literal code heading\n```',
    );
    expect(screen.getByRole('header', { name: 'Volcanoes' })).toBeOnTheScreen();
    expect(screen.getByText('Observe')).toBeOnTheScreen();
    expect(screen.getByText('landscape')).toBeOnTheScreen();
    expect(screen.getByText('record')).toBeOnTheScreen();
    expect(screen.getByText('Nested observation')).toBeOnTheScreen();
    expect(screen.getByText('## literal code heading')).toBeOnTheScreen();
    expect(screen.queryByRole('header', { name: 'literal code heading' })).toBeNull();
  });
  it('keeps fenced headings and multiline lists inside the correct lesson section', () => {
    const sections = markdownSections(
      '## One\n\n```md\n## not a new section\n```\n\n- First\n  - Nested\n\n## Two\n\nEnd.',
    );
    expect(sections).toHaveLength(2);
    expect(markdownText(sections[0].nodes)).toContain('not a new section');
  });
  it('offers tappable reflection checklists independently of course grading', async () => {
    await mount('- [ ] Record **two** observations\n- [x] Choose a patch');
    const first = screen.getByRole('checkbox', { name: 'Record two observations' });
    expect(first).toHaveProp('accessibilityState', expect.objectContaining({ checked: false }));
    await fireEvent.press(first);
    expect(screen.getByRole('checkbox', { name: 'Record two observations' })).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ checked: true }),
    );
    expect(screen.getByRole('checkbox', { name: 'Choose a patch' })).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ checked: true }),
    );
  });
  it('reveals worked examples on demand and renders their Markdown', async () => {
    await mount(
      '::: reveal Compare your explanation\n\n**Try** several patches.\n\n- Keep the method consistent\n:::\n\n## Next section',
    );
    const reveal = screen.getByRole('button', { name: 'Compare your explanation' });
    expect(reveal).toHaveProp('accessibilityState', expect.objectContaining({ expanded: false }));
    expect(screen.queryByText('Keep the method consistent')).toBeNull();
    await fireEvent.press(reveal);
    expect(screen.getByText('Keep the method consistent')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Compare your explanation' })).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ expanded: true }),
    );
    expect(screen.getByRole('header', { name: 'Next section' })).toBeOnTheScreen();
  });
  it('renders callouts, tables and hosted images using native components', async () => {
    await mount(
      '> [!TIP]\n> **Compare** like with like.\n\n| Patch | Feature |\n| --- | --- |\n| A | Rock |\n\n![An illustrative landscape](https://example.test/landscape.jpg)',
    );
    expect(screen.getByText('TIP')).toBeOnTheScreen();
    expect(screen.queryByText('[!TIP]')).toBeNull();
    expect(screen.getByText('Compare')).toBeOnTheScreen();
    expect(screen.getByLabelText('Markdown table')).toHaveProp('horizontal', true);
    expect(screen.getByText('Feature')).toBeOnTheScreen();
    expect(screen.getByText('Rock')).toBeOnTheScreen();
    expect(screen.getByLabelText('An illustrative landscape')).toHaveProp('source', [
      { uri: 'https://example.test/landscape.jpg' },
    ]);
  });
  it('keeps checklist state when virtualized lesson cards unmount and remount', async () => {
    const content = () => <MarkdownBlocks nodes={parseMarkdown('- [ ] Compare patches')} />;
    const view = await render(<MarkdownInteractions>{content()}</MarkdownInteractions>);
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Compare patches' }));
    await view.rerender(<MarkdownInteractions>{null}</MarkdownInteractions>);
    await view.rerender(<MarkdownInteractions>{content()}</MarkdownInteractions>);
    expect(screen.getByRole('checkbox', { name: 'Compare patches' })).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ checked: true }),
    );
  });

  it('opens Markdown links through the platform link handler', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await mount('[Read the source](https://whc.unesco.org/en/list/1427/)');
    await fireEvent.press(screen.getByRole('link', { name: 'Read the source' }));
    expect(open).toHaveBeenCalledWith('https://whc.unesco.org/en/list/1427/');
    open.mockRestore();
  });
  it('leaves escaped task markers and unclosed reveal fences as ordinary text', () => {
    const nodes = parseMarkdown('- \\[ ] literal marker\n\n::: reveal Unclosed\n\nKeep this text.');
    expect(nodes[0].children[0].attrs.task).toBeUndefined();
    expect(markdownText(nodes)).toContain('Keep this text.');
  });
});
