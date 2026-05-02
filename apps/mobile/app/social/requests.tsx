import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';
import { api } from '../../lib/api';

type RequestObj = {
  friendship_id: string;
  direction: 'inbound' | 'outbound';
  profile: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
};

export default function RequestsScreen() {
  const [requests, setRequests] = useState<RequestObj[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/api/social/requests');
      if (response.data?.data) {
        setRequests(response.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await api.post(`/api/social/request/${id}/accept`);
      setRequests(prev => prev.filter(r => r.friendship_id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await api.delete(`/api/social/friends/${id}`);
      setRequests(prev => prev.filter(r => r.friendship_id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }: { item: RequestObj }) => {
    const isInbound = item.direction === 'inbound';
    
    return (
      <View style={styles.card}>
        <Image 
            source={item.profile.avatar_url ? { uri: item.profile.avatar_url } : require('../../assets/images/default-avatar.png')} 
            style={styles.avatar} 
         />
        <View style={styles.info}>
          <Text style={styles.displayName}>{item.profile.display_name || item.profile.username}</Text>
          <Text style={styles.username}>@{item.profile.username}</Text>
          <Text style={styles.directionText}>{isInbound ? 'Wants to connect' : 'Request sent'}</Text>
        </View>
        <View style={styles.actions}>
          {isInbound ? (
            <>
              <TouchableOpacity style={styles.btnAccept} onPress={() => handleAccept(item.friendship_id)}>
                 <Text style={styles.btnAcceptText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDecline} onPress={() => handleDecline(item.friendship_id)}>
                 <Text style={styles.btnDeclineText}>Decline</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.btnDecline} onPress={() => handleDecline(item.friendship_id)}>
               <Text style={styles.btnDeclineText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Requests',
          headerStyle: { backgroundColor: Colors.background.base },
          headerTintColor: Colors.text.primary,
          headerShadowVisible: false,
        }} 
      />

      {loading ? (
        <ActivityIndicator color={Colors.brand.primary} style={{ marginTop: 20 }} />
      ) : requests.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptySubtitle}>No pending requests.</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.friendship_id}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
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
  card: {
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
  directionText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnAccept: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  btnAcceptText: {
    color: Colors.text.inverse,
    fontWeight: '600',
    fontSize: 13,
  },
  btnDecline: {
    backgroundColor: Colors.background.tertiary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  btnDeclineText: {
    color: Colors.text.primary,
    fontWeight: '600',
    fontSize: 13,
  }
});
