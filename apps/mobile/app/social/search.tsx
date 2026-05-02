import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/auth';

type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
};

export default function FriendSearchScreen() {
  const { session } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchProfiles();
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const searchProfiles = async () => {
    setLoading(true);
    try {
      // Just hit supabase directly for reads, it's faster and RLS prevents reading sensitive data
      // We exclude ourselves from the results
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .ilike('username', `%${query}%`)
        .neq('id', session?.user?.id)
        .limit(10);

      if (data && !error) {
        setResults(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (username: string, targetId: string) => {
    setSendingId(targetId);
    try {
      await api.post('/api/social/request', { username });
      // Remove them from results so user can't spam
      setResults(prev => prev.filter(p => p.id !== targetId));
      alert('Request sent!');
    } catch (e: any) {
      alert(e.response?.data?.error?.message || 'Failed to send request');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Find Friends',
          headerStyle: { backgroundColor: Colors.background.base },
          headerTintColor: Colors.text.primary,
          headerShadowVisible: false,
        }} 
      />

      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Search by username..."
          placeholderTextColor={Colors.text.tertiary}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {loading && <ActivityIndicator color={Colors.brand.primary} style={{ marginTop: 20 }} />}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.resultCard}>
            <Image 
                source={item.avatar_url ? { uri: item.avatar_url } : require('../../assets/images/default-avatar.png')} 
                style={styles.avatar} 
             />
            <View style={styles.info}>
              <Text style={styles.displayName}>{item.display_name || item.username}</Text>
              <Text style={styles.username}>@{item.username}</Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => sendRequest(item.username, item.id)}
              disabled={sendingId === item.id}
            >
               {sendingId === item.id ? (
                 <ActivityIndicator size="small" color="#fff" />
               ) : (
                 <Text style={styles.addButtonText}>Add</Text>
               )}
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.base,
  },
  searchBox: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.secondary,
  },
  input: {
    height: 48,
    backgroundColor: Colors.background.secondary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    color: Colors.text.primary,
    ...Typography.body,
  },
  list: {
    padding: Spacing.md,
  },
  resultCard: {
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
  addButton: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.md,
    minWidth: 70,
    alignItems: 'center'
  },
  addButtonText: {
    color: Colors.text.inverse,
    fontWeight: '600',
  }
});
