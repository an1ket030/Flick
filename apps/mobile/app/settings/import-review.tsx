import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';

export default function ImportReviewScreen() {
  const { successCount, failedCount, failedRows } = useLocalSearchParams<{ 
    successCount: string,
    failedCount: string,
    failedRows: string
  }>();

  const success = parseInt(successCount || '0', 10);
  const failed = parseInt(failedCount || '0', 10);
  
  let failures: { row: number, error: string }[] = [];
  try {
    failures = JSON.parse(failedRows || '[]');
  } catch (e) {}

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{failed === 0 && success > 0 ? '✨' : '📝'}</Text>
        </View>

        <Text style={styles.title}>Import Complete</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{success}</Text>
            <Text style={styles.statLabel}>Added</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 1, borderColor: Colors.background.overlay }]}>
            <Text style={[styles.statNum, failed > 0 && { color: '#ff6666' }]}>{failed}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
        </View>

        {failed > 0 && (
          <View style={styles.failuresContainer}>
            <Text style={styles.failuresTitle}>Issues</Text>
            {failures.slice(0, 10).map((f, i) => (
              <View key={i} style={styles.failureRow}>
                <Text style={styles.failureText}>Row {f.row}: {f.error}</Text>
              </View>
            ))}
            {failures.length > 10 && (
              <Text style={styles.moreFailures}>+ {failures.length - 10} more rows failed.</Text>
            )}
          </View>
        )}

      </ScrollView>

      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => {
          // Keep it simple and push to library to refresh entries
          router.replace('/(tabs)/library');
        }}
      >
        <Text style={styles.btnText}>View Library</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.base,
  },
  scrollContent: {
    padding: Spacing[6],
    paddingTop: 80,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: Colors.background.surface,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[6],
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: Typography.size['3xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    marginBottom: Spacing[8],
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing[6],
    width: '100%',
    marginBottom: Spacing[8],
    borderWidth: 1,
    borderColor: Colors.background.overlay,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 48,
    fontFamily: Typography.family.heading,
    color: Colors.brand.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  failuresContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,100,100,0.05)',
    borderRadius: Radius.md,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(255,100,100,0.2)',
  },
  failuresTitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.headingSemi,
    color: '#ff6666',
    marginBottom: Spacing[3],
  },
  failureRow: {
    marginBottom: Spacing[2],
  },
  failureText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
  },
  moreFailures: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.bodySemibold,
    color: '#ff6666',
    marginTop: Spacing[2],
  },
  btn: {
    margin: Spacing[6],
    backgroundColor: Colors.text.primary,
    paddingVertical: Spacing[4],
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  btnText: {
    color: Colors.text.inverse,
    fontFamily: Typography.family.bodySemibold,
    fontSize: Typography.size.base,
  },
});
