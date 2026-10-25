import { createContext, useContext, useState, type ReactNode } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { useThemeColors } from '@/lib/theme';

type Interactions = {
  values: Record<string, boolean>;
  toggle: (key: string, current: boolean) => void;
};
const InteractionContext = createContext<Interactions | undefined>(undefined);

/** Keep reflection state for the open lesson even when FlatList unmounts an offscreen card. */
export function MarkdownInteractions({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<Record<string, boolean>>({});
  return (
    <InteractionContext.Provider
      value={{
        values,
        toggle: (key, current) =>
          setValues((previous) => ({ ...previous, [key]: !(previous[key] ?? current) })),
      }}
    >
      {children}
    </InteractionContext.Provider>
  );
}

export function MarkdownDisclosure({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  const interactions = useContext(InteractionContext);
  const [localExpanded, setExpanded] = useState(false);
  const expanded = interactions?.values[`reveal:${id}`] ?? localExpanded;
  const colors = useThemeColors();
  return (
    <View className="overflow-hidden rounded-xl border border-border bg-background/50">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded }}
        onPress={() =>
          interactions
            ? interactions.toggle(`reveal:${id}`, expanded)
            : setExpanded((value) => !value)
        }
        className="min-h-12 flex-row items-center gap-3 p-4 active:opacity-70"
      >
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} color={colors.text} size={18} />
        <Text variant="label" className="flex-1 leading-6">
          {title}
        </Text>
      </Pressable>
      {expanded ? <View className="border-t border-border p-4">{children}</View> : null}
    </View>
  );
}

export function MarkdownTask({
  id,
  label,
  checked: initial,
  children,
}: {
  id: string;
  label: string;
  checked: boolean;
  children: ReactNode;
}) {
  const interactions = useContext(InteractionContext);
  const [localChecked, setChecked] = useState(initial);
  const checked = interactions?.values[`task:${id}`] ?? localChecked;
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      onPress={() =>
        interactions ? interactions.toggle(`task:${id}`, checked) : setChecked((value) => !value)
      }
      className="min-h-11 flex-row items-start gap-3 py-2 active:opacity-70"
    >
      <Ionicons name={checked ? 'checkbox' : 'square-outline'} size={22} color={colors.text} />
      <View className="min-w-0 flex-1">{children}</View>
    </Pressable>
  );
}
