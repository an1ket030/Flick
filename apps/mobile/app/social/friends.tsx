import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Image } from 'expo-image';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';
import { api } from '../../lib/api';

type Friend = {
  friendship_id: string;
  friend: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
};

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await api.get('/api/social/friends');
      if (response.data?.data) {
        setFriends(response.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const navigateToSearch = () => router.push('/social/search' as any);
  const navigateToRequests = () => router.push('/social/requests' as any);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Friends',
          headerStyle: { backgroundColor: Colors.background.base },
          headerTintColor: Colors.text.primary,
          headerShadowVisible: false,
          headerRight: () => (
             <View style={{ flexDirection: 'row', gap: 16 }}>
               <TouchableOpacity onPress={navigateToRequests}>
                 <Text style={{ color: Colors.brand.primary, fontWeight: '600' }}>Requests</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={navigateToSearch}>
                 <Text style={{ color: Colors.brand.primary, fontWeight: '600' }}>Add Friend</Text>
               </TouchableOpacity>
             </View>
          )
        }} 
      />

      {loading ? (
        <ActivityIndicator color={Colors.brand.primary} style={{ marginTop: 40 }} />
      ) : friends.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No friends yet</Text>
          <Text style={styles.emptySubtitle}>Find your friends by their username to start building your network.</Text>
          <TouchableOpacity style={styles.addButton} onPress={navigateToSearch}>
             <Text style={styles.addButtonText}>Find Friends</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.friendship_id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.friendCard}
              onPress={() => router.push(`/social/privacy?id=${item.friendship_id}` as any)}
            >
              <Image 
                  source={item.friend.avatar_url ? { uri: item.friend.avatar_url } : require('../../assets/images/default-avatar.png')} 
                  style={styles.avatar} 
               />
              <View style={styles.info}>
                <Text style={styles.displayName}>{item.friend.display_name || item.friend.username}</Text>
                <Text style={styles.username}>@{item.friend.username}</Text>
              </View>
               <Text style={styles.privacyLink}>Privacy</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.base,
  },
  list: {
    padding: Spacing.md,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.secondary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.tertiary,
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  displayName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  username: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  privacyLink: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    padding: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  addButton: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  addButtonText: {
    color: Colors.text.inverse,
    fontWeight: 'bold',
  }
});
