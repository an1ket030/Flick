import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';

interface ConvinceMeCardProps {
  hook: string;
  twist: string;
  personal_reason: string;
}

export default function ConvinceMeCard({ hook, twist, personal_reason }: ConvinceMeCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sparkleIcon}>✨</Text>
        <Text style={styles.title}>Convince Me</Text>
      </View>
      
      <View style={styles.item}>
        <View style={styles.bullet} />
        <View style={styles.content}>
          <Text style={styles.label}>The Hook</Text>
          <Text style={styles.text}>{hook}</Text>
        </View>
      </View>

      <View style={styles.item}>
        <View style={styles.bullet} />
        <View style={styles.content}>
          <Text style={styles.label}>The Twist</Text>
          <Text style={styles.text}>{twist}</Text>
        </View>
      </View>

      <View style={styles.item}>
        <View style={styles.bullet} />
        <View style={styles.content}>
          <Text style={styles.label}>Why You'll Love It</Text>
          <Text style={styles.text}>{personal_reason}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 107, 44, 0.05)',
    borderRadius: Radius.lg,
    padding: Spacing[5],
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 44, 0.2)',
    marginBottom: Spacing[6],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  sparkleIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.headingSemi,
    color: Colors.brand.primary,
    letterSpacing: -0.5,
  },
  item: {
    flexDirection: 'row',
    marginBottom: Spacing[4],
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brand.primary,
    marginTop: 6,
    marginRight: Spacing[3],
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  text: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.primary,
    lineHeight: 20,
  },
});
