import { lessonSections } from '../lesson-sections';
import { markdownText } from '@/components/shared/markdown/parse-markdown';

describe('long lesson sections', () => {
  it('keeps existing plain-text lessons readable', () => {
    const sections = lessonSections('First paragraph.\n\nSecond paragraph.');
    expect(sections).toHaveLength(1);
    expect(markdownText(sections[0].nodes)).toBe('First paragraph.Second paragraph.');
  });
  it('splits lesson headings and highlights reflection activities without losing paragraphs', () => {
    const sections = lessonSections(
      '## A landscape\n\nRead this.\n\n## Try a comparison\n\nThink for two minutes.',
    );
    expect(sections).toHaveLength(2);
    expect(sections.map((section) => section.activity)).toEqual([false, true]);
    expect(markdownText(sections[1].nodes)).toBe('Try a comparisonThink for two minutes.');
  });
  it('does not render blank cards for empty content', () => {
    expect(lessonSections(' \n\n')).toEqual([]);
  });
});
