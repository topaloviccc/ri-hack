export type MockFeedItem = { id: string; userId: string; courseId: string; hoursAgo: number };

export const MOCK_FEED: MockFeedItem[] = [
  { id: 'f1', userId: 'u5', courseId: 'c14', hoursAgo: 1 },
  { id: 'f2', userId: 'u3', courseId: 'c36', hoursAgo: 3 },
  { id: 'f3', userId: 'u6', courseId: 'c43', hoursAgo: 8 },
  { id: 'f4', userId: 'u1', courseId: 'c33', hoursAgo: 15 },
  { id: 'f5', userId: 'u2', courseId: 'c41', hoursAgo: 30 },
  { id: 'f6', userId: 'u7', courseId: 'c32', hoursAgo: 52 },
  { id: 'f7', userId: 'u4', courseId: 'c11', hoursAgo: 88 },
  { id: 'f8', userId: 'u6', courseId: 'c29', hoursAgo: 120 },
];

export const MOCK_WEEKLY_COMPLETIONS: Record<string, number> = {
  u0: 3,
  u1: 5,
  u2: 2,
  u3: 5,
  u4: 0,
  u5: 7,
  u6: 1,
  u7: 9,
};
