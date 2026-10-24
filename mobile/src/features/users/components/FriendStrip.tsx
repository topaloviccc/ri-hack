import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Avatar } from '@/components/ui/Avatar';
import { Text } from '@/components/ui/Text';
import { useUsersQuery } from '@/features/users/api/users.queries';
import { useThemeColors } from '@/lib/theme';

const STRIP_HEIGHT_CLASS = 'h-24';

const openPeople = () => router.push('/people');
const openProfile = (id: string) => router.push({ pathname: '/user/[id]', params: { id } });

function FindFriendsButton() {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Find friends"
      onPress={openPeople}
      className="w-20 items-center gap-1 active:opacity-70"
    >
      <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-primary">
        <Ionicons name="person-add-outline" size={24} color={colors.primary} />
      </View>
      <Text variant="caption" numberOfLines={1}>
        Find friends
      </Text>
    </Pressable>
  );
}

/** "My friends · search" + horizontal avatars, starting with Find friends. */
export function FriendStrip() {
  const { data, isPending, isError, refetch } = useUsersQuery({ relation: 'friend' });

  const renderBody = () => {
    if (isPending) return <LoadingState className={STRIP_HEIGHT_CLASS} />;
    if (isError) return <ErrorState onRetry={refetch} className={STRIP_HEIGHT_CLASS} />;
    return (
      <FlatList
        horizontal
        data={data}
        keyExtractor={(u) => u.id}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-4"
        ListHeaderComponent={<FindFriendsButton />}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.name}'s profile`}
            onPress={() => openProfile(item.id)}
            className="w-20 items-center gap-1 active:opacity-70"
          >
            <Avatar uri={item.avatarUrl} size="md" />
            <Text variant="caption" numberOfLines={1}>
              {item.name.split(' ')[0]}
            </Text>
          </Pressable>
        )}
      />
    );
  };

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between px-4">
        <Text variant="heading" accessibilityRole="header">
          My friends
        </Text>
        <Pressable
          accessibilityRole="link"
          onPress={openPeople}
          className="min-h-11 justify-center active:opacity-70"
        >
          <Text variant="label" className="text-primary">
            search
          </Text>
        </Pressable>
      </View>
      {renderBody()}
    </View>
  );
}
