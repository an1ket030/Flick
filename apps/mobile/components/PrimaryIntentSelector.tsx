import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';

export type IntentType = 'transported' | 'think' | 'feel' | 'fun';

const INTENTS: { id: IntentType; title: string; desc: string }[] = [
  { id: 'transported', title: 'To be completely transported', desc: 'World-building, immersion, visual spectacle.' },
  { id: 'think', title: 'To think for days afterwards', desc: 'Complex themes, mind-bending plots, ambiguity.' },
  { id: 'feel', title: 'To feel genuine emotion', desc: 'Catharsis, heartbreak, intense empathy.' },
  { id: 'fun', title: 'To turn my brain off', desc: 'Pure entertainment, laughter, thrills.' },
];

export default function PrimaryIntentSelector({ 
  selected, 
  onSelect 
}: { 
  selected: IntentType | null; 
  onSelect: (id: IntentType) => void; 
}) {
  return (
    <View style={styles.container}>
      {INTENTS.map(intent => {
        const isSelected = selected === intent.id;
        return (
          <TouchableOpacity
            key={intent.id}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => onSelect(intent.id)}
            activeOpacity={0.8}
          >
            <View style={styles.textContainer}>
              <Text style={[styles.title, isSelected && styles.textSelected]}>
                {intent.title}
              </Text>
              <Text style={[styles.desc, isSelected && styles.textSelected]} numberOfLines={2}>
                {intent.desc}
              </Text>
            </View>
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing[3],
    marginTop: Spacing[4],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[4],
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: Colors.brand.primary,
    backgroundColor: 'rgba(255, 107, 44, 0.05)',
  },
  textContainer: {
    flex: 1,
    paddingRight: Spacing[4],
  },
  title: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.headingSemi,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  desc: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
  },
  textSelected: {
    color: Colors.text.primary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.background.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.brand.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.brand.primary,
  },
});
