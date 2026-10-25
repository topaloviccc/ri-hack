import { useRef, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/ui/Text';
import { useCoursesQuery } from '@/features/courses/api/courses.queries';
import { ReelCard } from '@/features/courses/components/ReelCard';
import { SwipeableReel } from '@/features/courses/components/SwipeableReel';
import { useOpenCourse } from '@/features/courses/hooks/useOpenCourse';
import { useUndoableDismiss } from '@/features/courses/hooks/useUndoableDismiss';
import type { Course } from '@/features/courses/types';
import { cn } from '@/lib/cn';

const REEL_GAP = 12;

type FeedItem = Course | { id: 'end' };

export function CourseFeed() {
  const { data, isPending, isError, refetch } = useCoursesQuery({ collection: 'feed' });
  const { openCourse } = useOpenCourse();
  const insets = useSafeAreaInsets();
  const [height, setHeight] = useState(0);
  const { hiddenIds, toast, dismiss, undo } = useUndoableDismiss();
  const feedRef = useRef<FlatList<FeedItem>>(null);

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (data.length === 0) return <EmptyState title="No courses to show yet" />;

  const items: FeedItem[] = [...data.filter((c) => !hiddenIds.includes(c.id)), { id: 'end' }];

  return (
    <View
      testID="course-feed"
      className="flex-1"
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
    >
      {height > 0 ? (
        <FlatList
          ref={feedRef}
          data={items}
          keyExtractor={(item) => item.id}
          pagingEnabled
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
          renderItem={({ item, index }) => (
            <View
              style={{ height, paddingTop: insets.top + REEL_GAP, padding: REEL_GAP }}
              className="bg-background"
            >
              {'title' in item ? (
                <SwipeableReel
                  onDismiss={() => dismiss(item.id)}
                  onOpen={() => openCourse(item.id)}
                  onNext={() => {
                    feedRef.current?.scrollToIndex({ index: index + 1, animated: true });
                  }}
                  onPrevious={() => {
                    if (index > 0)
                      feedRef.current?.scrollToIndex({ index: index - 1, animated: true });
                  }}
                >
                  <ReelCard course={item} />
                </SwipeableReel>
              ) : (
                <EmptyState title="You're all caught up" message="Check back later for more." />
              )}
            </View>
          )}
        />
      ) : null}
      {toast ? (
        <View
          accessibilityLiveRegion="polite"
          className={cn(
            'absolute bottom-6 min-h-11 flex-row items-center gap-2 self-center rounded-full bg-text pl-4',
            toast === 'dismissed' ? 'pr-1' : 'pr-4',
          )}
        >
          <Text variant="label" className="text-background">
            {toast === 'dismissed' ? 'We’ll show less like this' : 'Couldn’t save your preference'}
          </Text>
          {toast === 'dismissed' ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Undo, keep showing this course"
              onPress={undo}
              className="min-h-11 justify-center px-3 active:opacity-70"
            >
              <Text variant="label" className="text-primary">
                Undo
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
