import { router } from 'expo-router';
import { FlatList, View } from 'react-native';
import { DemoNotice } from '@/components/shared/DemoNotice';
import { Text } from '@/components/ui/Text';
import type { LearningLesson } from '@/features/learning/api/learning.dto';
import { useCompleteLesson } from '@/features/learning/api/learning.mutations';
import { LearningAction } from './LearningAction';
import { LearningBackLink } from './LearningBackLink';
import { StepStatus } from './StepStatus';
import { lessonSections } from '../lesson-sections';
import { cn } from '@/lib/cn';
import { MarkdownBlocks, MarkdownInteractions } from '@/components/shared/markdown';

export type LessonReaderProps = { course: string; lesson: LearningLesson };
export function LessonReader({ course, lesson }: LessonReaderProps) {
  const complete = useCompleteLesson(course);
  const sections = lesson.unlocked
    ? lessonSections(lesson.text || 'No lesson text has been supplied yet.')
    : [];
  return (
    <MarkdownInteractions key={lesson.id}>
      <FlatList
        data={sections}
        keyExtractor={(_section, index) => String(index)}
        contentContainerClassName="gap-4 px-4 pb-12"
        ListHeaderComponent={
          <View className="gap-4">
            <LearningBackLink disabled={complete.isPending} />
            <View className="flex-row items-center justify-between">
              <Text variant="mono" className="text-xs text-text">
                LESSON {String(lesson.position + 1).padStart(2, '0')}
              </Text>
              <StepStatus
                state={!lesson.unlocked ? 'locked' : lesson.completed ? 'completed' : 'ready'}
                label={lesson.completed ? 'Read' : undefined}
              />
            </View>
            <Text variant="title" className="text-2xl" accessibilityRole="header">
              {lesson.title}
            </Text>
            {lesson.estimatedMinutes ? (
              <Text variant="caption">
                About {lesson.estimatedMinutes} min · reading and reflection
              </Text>
            ) : null}
            {lesson.demo ? <DemoNotice>lesson content</DemoNotice> : null}
            {!lesson.unlocked ? (
              <Text>Submit the preceding quiz to unlock this lesson.</Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <View
            className={cn(
              'gap-4 rounded-card border border-border bg-surface p-5',
              item.activity && 'bg-secondary/15',
            )}
          >
            {item.activity ? (
              <Text variant="mono" className="text-xs">
                PAUSE & THINK
              </Text>
            ) : null}
            <MarkdownBlocks nodes={item.nodes} />
          </View>
        )}
        ListFooterComponent={
          lesson.unlocked ? (
            <View className="gap-3 rounded-card bg-secondary/20 p-4">
              {complete.isError ? (
                <Text accessibilityRole="alert">{complete.error.message}</Text>
              ) : null}
              <Text variant="label">Ready to check what you learned?</Text>
              <Text variant="caption">
                {lesson.quiz.questionCount} questions · Unlimited retries
              </Text>
              <LearningAction
                label={complete.isPending ? 'Saving...' : 'Continue to quiz'}
                disabled={complete.isPending || !lesson.text}
                onPress={() =>
                  complete.mutate(lesson.id, {
                    onSuccess: () => router.setParams({ lesson: undefined, quiz: lesson.quiz.id }),
                  })
                }
              />
            </View>
          ) : undefined
        }
      />
    </MarkdownInteractions>
  );
}
