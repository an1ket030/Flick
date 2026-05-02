import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuthStore } from '../../stores/auth';
import { Colors, Typography, Spacing } from '@flick/ui';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function ImportProgressScreen() {
  const { uri, name, mimeType } = useLocalSearchParams<{ uri: string, name: string, mimeType: string }>();
  const { session } = useAuthStore();
  const [status, setStatus] = useState('Uploading file...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const processImport = async () => {
      if (!uri || !session?.access_token) {
        if (mounted) setError('Missing file URI or auth session.');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('file', {
          uri,
          name: name || 'export.csv',
          type: mimeType || 'text/csv',
        } as any);

        setStatus('Analyzing your film history...');

        const res = await fetch(`${API_BASE_URL}/api/library/import/letterboxd`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        
        if (mounted) {
          // Go to review screen
          router.replace({
            pathname: '/settings/import-review',
            params: {
              successCount: data.successCount,
              failedCount: data.failedCount,
              failedRows: JSON.stringify(data.failedRows || []),
            }
          });
        }
      } catch (err: any) {
        console.error('Import error:', err);
        if (mounted) {
          setError(err.message || 'An unknown error occurred during import.');
          setStatus('Import failed');
        }
      }
    };

    processImport();

    return () => {
      mounted = false;
    };
  }, [uri, session?.access_token]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {!error ? (
          <>
            <ActivityIndicator size="large" color={Colors.brand.primary} style={styles.loader} />
            <Text style={styles.statusTitle}>Importing</Text>
            <Text style={styles.statusText}>{status}</Text>
          </>
        ) : (
          <>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>!</Text>
            </View>
            <Text style={styles.errorTitle}>Import Failed</Text>
            <Text style={styles.errorText}>{error}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.base,
    padding: Spacing[6],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginBottom: Spacing[6],
    transform: [{ scale: 1.5 }],
  },
  statusTitle: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
  },
  statusText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    maxWidth: '80%',
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,100,100,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[6],
  },
  errorIconText: {
    fontSize: 32,
    color: '#ff6666',
    fontFamily: Typography.family.heading,
  },
  errorTitle: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
  },
  errorText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: '#ff6666',
    textAlign: 'center',
  },
});
