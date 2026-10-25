import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/ui/Text';
import { useCoursesQuery } from '@/features/courses/api/courses.queries';
import { useDismissCourse } from '@/features/courses/api/courses.mutations';
import { FeedGestureHints } from '@/features/courses/components/FeedGestureHints';
import { ReelCard } from '@/features/courses/components/ReelCard';
import { SwipeableReel } from '@/features/courses/components/SwipeableReel';
import { useFeedHints } from '@/features/courses/hooks/useFeedHints';
import { useOpenCourse } from '@/features/courses/hooks/useOpenCourse';
import type { Course } from '@/features/courses/types';

const TOAST_DURATION_MS = 2000;
const REEL_GAP = 12;

type FeedItem = Course | { id: 'end' };

export function CourseFeed() {
  const { data, isPending, isError, refetch } = useCoursesQuery({ collection: 'feed' });
  const { openCourse, prefetchCourse } = useOpenCourse();
  const insets = useSafeAreaInsets();
  const [height, setHeight] = useState(0);
  const dismiss = useDismissCourse();
  const hints = useFeedHints();
  const [isToastVisible, setIsToastVisible] = useState(false);
  const feedRef = useRef<FlatList<FeedItem>>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const handleLessLikeThis = (id: string) => {
    if (dismiss.isPending) return;
    dismiss.mutate(id, {
      onSuccess: () => {
        setIsToastVisible(true);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setIsToastVisible(false), TOAST_DURATION_MS);
      },
      onError: (error) => Alert.alert('Could not save your preference', error.message),
    });
  };

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (data.length === 0) return <EmptyState title="No courses to show yet" />;

  const items: FeedItem[] = [...data, { id: 'end' }];

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
          // While the gesture hints are up, screen readers should only reach them.
          accessibilityElementsHidden={hints.isVisible}
          importantForAccessibility={hints.isVisible ? 'no-hide-descendants' : 'auto'}
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
                  disabled={dismiss.isPending}
                  onDismiss={() => handleLessLikeThis(item.id)}
                  onOpen={() => openCourse(item.id)}
                  onSwipeStart={() => prefetchCourse(item.id)}
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
      {isToastVisible ? (
        <View
          accessibilityLiveRegion="polite"
          className="absolute bottom-6 self-center rounded-full bg-text px-4 py-2"
        >
          <Text variant="label" className="text-background">
            We’ll show less like this
          </Text>
        </View>
      ) : null}
      {hints.isVisible ? <FeedGestureHints onDismiss={hints.dismiss} /> : null}
    </View>
  );
}
