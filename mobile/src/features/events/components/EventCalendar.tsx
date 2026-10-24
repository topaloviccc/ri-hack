import { Calendar, type DateData } from 'react-native-calendars';
import type { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';

import { Card } from '@/components/ui/Card';
import { useThemeColors } from '@/lib/theme';

export type EventCalendarProps = {
  selectedDate: string;
  /** 'YYYY-MM-DD' days that get an event dot */
  eventDates: string[];
  onSelectDate: (dateKey: string) => void;
};

export function EventCalendar({ selectedDate, eventDates, onSelectDate }: EventCalendarProps) {
  const colors = useThemeColors();

  const markedDates: Record<string, MarkingProps> = Object.fromEntries(
    eventDates.map((d) => [d, { marked: true, dotColor: colors.primary }]),
  );
  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: colors.primary,
  };

  return (
    <Card>
      <Calendar
        // Remount on scheme change: the calendar caches its theme on mount.
        key={colors.background}
        current={selectedDate}
        markedDates={markedDates}
        onDayPress={(day: DateData) => onSelectDate(day.dateString)}
        theme={{
          calendarBackground: colors.surface,
          dayTextColor: colors.text,
          monthTextColor: colors.text,
          textSectionTitleColor: colors.muted,
          textDisabledColor: colors.border,
          todayTextColor: colors.primary,
          selectedDayTextColor: colors.onPrimary,
          arrowColor: colors.primary,
          textDayFontFamily: 'PlusJakartaSans_500Medium',
          textMonthFontFamily: 'PlusJakartaSans_700Bold',
          textDayHeaderFontFamily: 'PlusJakartaSans_600SemiBold',
        }}
      />
    </Card>
  );
}
