import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';

export default function ImportScreen() {
  const [error, setError] = useState<string | null>(null);

  const handleSelectFile = async () => {
    setError(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Let's pass the file info to the progress screen where upload will occur
        router.push({
          pathname: '/settings/import-progress',
          params: {
            uri: file.uri,
            name: file.name,
            mimeType: file.mimeType || 'text/csv',
            size: file.size?.toString(),
          }
        });
      }
    } catch (err) {
      console.error('File pick error:', err);
      setError('Failed to pick file. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Import from Letterboxd</Text>
        <Text style={styles.subtitle}>
          Bring your existing film history into Flick. Upload your Letterboxd 
          export file (usually named watched.csv or ratings.csv).
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.stepTitle}>Step 1</Text>
          <Text style={styles.stepText}>
            Go to Letterboxd.com / Settings / Data & Export and click "Export Your Data".
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.stepTitle}>Step 2</Text>
          <Text style={styles.stepText}>
            Unzip the downloaded file and select the watched.csv or ratings.csv file below.
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.uploadBtn} onPress={handleSelectFile}>
          <Text style={styles.uploadBtnText}>Select CSV File</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.base,
    padding: Spacing[6],
    paddingTop: 80,
  },
  header: {
    marginBottom: Spacing[6],
  },
  title: {
    fontSize: Typography.size['3xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    letterSpacing: -1,
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.lg,
    padding: Spacing[5],
    marginBottom: Spacing[6],
    borderWidth: 1,
    borderColor: Colors.background.overlay,
  },
  stepTitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.headingSemi,
    color: Colors.brand.primary,
    marginBottom: Spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.background.overlay,
    marginVertical: Spacing[4],
  },
  uploadBtn: {
    backgroundColor: Colors.text.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtnText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.text.inverse,
  },
  errorBox: {
    backgroundColor: 'rgba(255,100,100,0.1)',
    borderRadius: Radius.md,
    padding: Spacing[4],
    marginBottom: Spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(255,100,100,0.3)',
  },
  errorText: {
    color: '#ff6666',
    fontFamily: Typography.family.bodyMedium,
    fontSize: Typography.size.sm,
  },
});
