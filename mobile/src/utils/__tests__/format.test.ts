import {
  formatBytes,
  formatCount,
  formatDuration,
  listWithMore,
  pluralize,
} from '@/utils/format';

describe('listWithMore', () => {
  it('lists everything up to the cap, then counts the rest', () => {
    expect(listWithMore(['A', 'B'], 2)).toBe('A\nB');
    expect(listWithMore(['A', 'B', 'C', 'D'], 2)).toBe('A\nB\n+ 2 more');
  });
});

describe('formatCount', () => {
  it.each([
    [950, '950'],
    [1000, '1k'],
    [1234, '1.2k'],
    [48000, '48k'],
  ])('%i -> %s', (n, expected) => expect(formatCount(n)).toBe(expected));
});

describe('formatDuration', () => {
  it.each([
    [45, '45 min'],
    [60, '1 h'],
    [95, '1 h 35 min'],
  ])('%i -> %s', (n, expected) => expect(formatDuration(n)).toBe(expected));
});

describe('formatBytes', () => {
  it.each([
    [500, '1 KB'],
    [820_000, '801 KB'],
    [1_480_000, '1.4 MB'],
    [2 * 1024 * 1024, '2 MB'],
  ])('%i -> %s', (n, expected) => expect(formatBytes(n)).toBe(expected));
});

describe('pluralize', () => {
  it.each([
    [1, 'course', undefined, '1 course'],
    [0, 'course', undefined, '0 courses'],
    [1240, 'coin', undefined, '1,240 coins'],
    [2, 'quiz', 'quizzes', '2 quizzes'],
  ])('%i %s -> %s', (n, singular, plural, expected) =>
    expect(pluralize(n, singular, plural)).toBe(expected),
  );
});
