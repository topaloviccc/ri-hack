import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';

import { useThemeColors } from '@/lib/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; title: string; icon: IconName; activeIcon: IconName }[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { name: 'scroll', title: 'Scroll', icon: 'sparkles-outline', activeIcon: 'sparkles' },
  { name: 'events', title: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar' },
  { name: 'network', title: 'Network', icon: 'people-outline', activeIcon: 'people' },
  { name: 'courses', title: 'Courses', icon: 'school-outline', activeIcon: 'school' },
];

export default function TabsLayout() {
  const colors = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.tabBar, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: 'PlusJakartaSans_600SemiBold' },
      }}
    >
      {TABS.map(({ name, title, icon, activeIcon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            // Tab's own `color` is typed as ColorValue, which Ionicons rejects; same values anyway.
            tabBarIcon: ({ size, focused }) => (
              <Ionicons
                name={focused ? activeIcon : icon}
                color={focused ? colors.primary : colors.muted}
                size={size}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
