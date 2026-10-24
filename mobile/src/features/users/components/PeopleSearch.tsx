import { router } from 'expo-router';
import { useDeferredValue, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform } from 'react-native';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useUsersQuery } from '@/features/users/api/users.queries';
import { AddFriendButton } from '@/features/users/components/AddFriendButton';
import { UserListItem } from '@/features/users/components/UserListItem';

const openProfile = (id: string) => router.push({ pathname: '/user/[id]', params: { id } });

/** Search everyone; with an empty query, show suggested people. */
export function PeopleSearch() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim());
  const { data, isPending, isError, refetch } = useUsersQuery(
    deferredQuery ? { query: deferredQuery } : { suggested: true },
  );

  const renderEmpty = () => {
    if (isPending) return <LoadingState />;
    if (isError) return <ErrorState onRetry={refetch} />;
    return <EmptyState title="No people found" message="Try another name." />;
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={data ?? []}
        keyExtractor={(u) => u.id}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-3 p-4"
        ListHeaderComponent={
          <>
            <TextField
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name or @handle"
              accessibilityLabel="Search people"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            <Text variant="heading" className="mt-4">
              {deferredQuery ? 'Results' : 'Suggested for you'}
            </Text>
          </>
        }
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <UserListItem
            id={item.id}
            name={item.name}
            avatarUrl={item.avatarUrl}
            subtitle={item.relation === 'friend' ? 'Friend' : `@${item.handle}`}
            trailing={<AddFriendButton user={item} />}
            onPress={openProfile}
          />
        )}
      />
    </KeyboardAvoidingView>
  );
}
