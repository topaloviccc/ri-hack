import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useThemeColors } from '@/lib/theme';

/** Home's "Continue with…" row before any course is started: a dashed card that leads to Courses. */
export function ContinuePlaceholder() {
  const colors = useThemeColors();
  return (
    <View className="px-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="No courses started yet. Browse courses"
        onPress={() => router.push('/courses')}
        className="min-h-40 flex-row items-center gap-4 rounded-card border-2 border-dashed border-border bg-surface p-4 active:opacity-80"
      >
        <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/15">
          <Ionicons name="compass-outline" size={28} color={colors.primary} />
        </View>
        <View className="flex-1 gap-1">
          <Text variant="label" className="text-base">
            No courses started yet
          </Text>
          <Text variant="caption">Pick a course and your progress will wait for you here.</Text>
          <Text variant="label" className="mt-1 text-primary">
            Browse courses
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
