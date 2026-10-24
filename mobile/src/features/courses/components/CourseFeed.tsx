import { useEffect, useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/ui/Text';
import { useCoursesQuery } from '@/features/courses/api/courses.queries';
import { ReelCard } from '@/features/courses/components/ReelCard';
import { SwipeableReel } from '@/features/courses/components/SwipeableReel';
import { useOpenCourse } from '@/features/courses/hooks/useOpenCourse';
import type { Course } from '@/features/courses/types';

const TOAST_DURATION_MS = 2000;
const REEL_GAP = 12;

type FeedItem = Course | { id: 'end' };

export function CourseFeed() {
  const { data, isPending, isError, refetch } = useCoursesQuery({ collection: 'feed' });
  const { openCourse } = useOpenCourse();
  const insets = useSafeAreaInsets();
  const [height, setHeight] = useState(0);
  // TODO(hack): "less like this" only hides the reel locally; send it to the backend later. See BACKLOG.md.
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const handleLessLikeThis = (id: string) => {
    setHiddenIds((ids) => [...ids, id]);
    setIsToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setIsToastVisible(false), TOAST_DURATION_MS);
  };

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
          data={items}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
          renderItem={({ item }) => (
            <View
              style={{ height, paddingTop: insets.top + REEL_GAP, padding: REEL_GAP }}
              className="bg-background"
            >
              {'title' in item ? (
                <SwipeableReel
                  onDismiss={() => handleLessLikeThis(item.id)}
                  onOpen={() => openCourse(item.id)}
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
    </View>
  );
}
