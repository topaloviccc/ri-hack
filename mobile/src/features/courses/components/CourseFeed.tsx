import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { coursesApi } from '@/features/courses/api/courses.api';
import {
  courseKeys,
  courseListQueryOptions,
  useCoursesQuery,
} from '@/features/courses/api/courses.queries';
import { FeedGestureHints } from '@/features/courses/components/FeedGestureHints';
import { ReelCard } from '@/features/courses/components/ReelCard';
import { SwipeableReel } from '@/features/courses/components/SwipeableReel';
import { useFeedHints } from '@/features/courses/hooks/useFeedHints';
import { useOpenCourse } from '@/features/courses/hooks/useOpenCourse';
import type { Course } from '@/features/courses/types';

const REEL_GAP = 12;
type FeedItem = Course | { id: 'end' };

export function CourseFeed() {
  const query = useCoursesQuery({ collection: 'feed' });
  if (query.isPending) return <LoadingState />;
  if (!query.data) return <ErrorState onRetry={query.refetch} />;
  return <FeedSession initialCourses={query.data} />;
}

function FeedSession({ initialCourses }: { initialCourses: Course[] }) {
  const client = useQueryClient();
  const { openCourse, prefetchCourse } = useOpenCourse();
  const insets = useSafeAreaInsets();
  const [height, setHeight] = useState(0);
  // Pin visited cards. Select each new card from a fresh server ranking after
  // feedback is saved, so recommendations adapt without moving the current card.
  const [history, setHistory] = useState<Course[]>(() => initialCourses.slice(0, 1));
  const [index, setIndex] = useState(0);
  const visited = useRef(new Set(initialCourses.slice(0, 1).map((c) => c.id)));
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const hints = useFeedHints();
  const [isToastVisible, setIsToastVisible] = useState(false);
  const feedRef = useRef<FlatList<FeedItem>>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const currentId = history[index]?.id;
  const visit = useRef({ courseId: currentId, startedAt: null as number | null, elapsed: 0 });

  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useFocusEffect(
    useCallback(() => {
      if (visit.current.courseId !== currentId)
        visit.current = { courseId: currentId, startedAt: null, elapsed: 0 };
      if (hints.isVisible) return;
      const pause = () => {
        if (visit.current.startedAt !== null)
          visit.current.elapsed += Date.now() - visit.current.startedAt;
        visit.current.startedAt = null;
      };
      if (AppState.currentState === 'active') visit.current.startedAt = Date.now();
      const subscription = AppState.addEventListener('change', (state) => {
        pause();
        if (state === 'active') visit.current.startedAt = Date.now();
      });
      return () => {
        pause();
        subscription.remove();
      };
    }, [currentId, hints.isVisible]),
  );

  useEffect(() => {
    if (height > 0) feedRef.current?.scrollToIndex({ index, animated: true });
  }, [index, history, height]);

  const dwellMs = useCallback(
    () =>
      Math.min(
        120000,
        Math.max(
          0,
          visit.current.elapsed +
            (visit.current.startedAt === null ? 0 : Date.now() - visit.current.startedAt),
        ),
      ),
    [],
  );
  const invalidate = () => {
    void client.invalidateQueries({
      queryKey: courseKeys.list({ collection: 'feed' }),
      refetchType: 'none',
    });
    void client.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === courseKeys.all[0] &&
        (query.queryKey[2] as { collection?: string } | undefined)?.collection !== 'feed',
    });
  };
  const refreshRanking = () =>
    client.fetchQuery({ ...courseListQueryOptions({ collection: 'feed' }), staleTime: 0, retry: false });

  const run = async (action: () => Promise<void>) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    try {
      await action();
    } catch (error) {
      Alert.alert(
        'Could not update your feed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const next = (course?: Course) =>
    run(async () => {
      if (course) await coursesApi.feedback(course.id, 'NEXT', dwellMs());
      invalidate();
      if (index + 1 < history.length) {
        setIndex(index + 1);
        return;
      }
      const ranked = await refreshRanking();
      const candidate = ranked.find((c) => !visited.current.has(c.id));
      if (candidate) {
        visited.current.add(candidate.id);
        setHistory((previous) => [...previous, candidate]);
        setIndex(history.length);
      } else setIndex(history.length);
    });

  const dismiss = (course: Course) =>
    run(async () => {
      await coursesApi.dismiss(course.id);
      client.setQueryData<Course[]>(courseKeys.list({ collection: 'feed' }), (courses) =>
        courses?.filter((item) => item.id !== course.id),
      );
      invalidate();
      // Fetch first: on a transport failure keep the current card retryable.
      const ranked = await refreshRanking();
      const remaining = history.filter((c) => c.id !== course.id);
      if (index >= remaining.length) {
        const candidate = ranked.find((c) => !visited.current.has(c.id));
        if (candidate) {
          visited.current.add(candidate.id);
          remaining.push(candidate);
        }
      }
      setHistory(remaining);
      setIsToastVisible(true);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setIsToastVisible(false), 2000);
    });

  const open = (course: Course) => {
    void coursesApi
      .feedback(course.id, 'OPEN', dwellMs())
      .then(invalidate)
      .catch((error: Error) => Alert.alert('Could not save your preference', error.message));
    openCourse(course.id);
  };

  const items: FeedItem[] = [...history, { id: 'end' }];
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
          extraData={busy}
          keyExtractor={(item) => item.id}
          accessibilityElementsHidden={hints.isVisible}
          importantForAccessibility={hints.isVisible ? 'no-hide-descendants' : 'auto'}
          pagingEnabled
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, i) => ({ length: height, offset: height * i, index: i })}
          renderItem={({ item, index: itemIndex }) => (
            <View
              style={{ height, paddingTop: insets.top + REEL_GAP, padding: REEL_GAP }}
              className="bg-background"
            >
              {'title' in item ? (
                <SwipeableReel
                  disabled={busy || itemIndex !== index}
                  onDismiss={() => void dismiss(item)}
                  onOpen={() => open(item)}
                  onSwipeStart={() => prefetchCourse(item.id)}
                  onNext={() => void next(item)}
                  onPrevious={() => {
                    if (index > 0) setIndex(index - 1);
                  }}
                >
                  <ReelCard course={item} />
                </SwipeableReel>
              ) : (
                <View className="flex-1 justify-center gap-4">
                  <EmptyState
                    title="You're all caught up"
                    message="Check back later for more courses."
                  />
                  <Button
                    label={busy ? 'Checking…' : 'Check for more courses'}
                    disabled={busy}
                    onPress={() => void next()}
                    className="self-center"
                  />
                  {history.length > 0 ? (
                    <Button
                      label="Previous course"
                      variant="soft"
                      disabled={busy}
                      onPress={() => setIndex(history.length - 1)}
                      className="self-center"
                    />
                  ) : null}
                </View>
              )}
            </View>
          )}
        />
      ) : null}
      {busy ? (
        <View
          accessibilityLiveRegion="polite"
          className="absolute bottom-6 self-center rounded-full bg-surface px-4 py-2"
        >
          <Text>Updating your feed…</Text>
        </View>
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
