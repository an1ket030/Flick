import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';
import { Smile, Brain, HeartCrack, Zap, EyeOff, Coffee, Popcorn, Sparkles } from 'lucide-react-native';

export type MoodId = 
  | 'laugh' 
  | 'mind_bending' 
  | 'heartbreak' 
  | 'adrenaline' 
  | 'disturbed' 
  | 'warm' 
  | 'brain_off' 
  | 'visual';

interface MoodType {
  id: MoodId;
  label: string;
  icon: React.ElementType;
  color: string;
}

const MOODS: MoodType[] = [
  { id: 'laugh', label: 'Laugh out loud', icon: Smile, color: '#FCD34D' }, // Amber 300
  { id: 'mind_bending', label: 'Mind-bending', icon: Brain, color: '#A78BFA' }, // Violet 400
  { id: 'heartbreak', label: 'Heartbroken', icon: HeartCrack, color: '#F87171' }, // Red 400
  { id: 'adrenaline', label: 'Adrenaline', icon: Zap, color: '#F97316' }, // Orange 500
  { id: 'disturbed', label: 'Genuinely disturbed', icon: EyeOff, color: '#9CA3AF' }, // Gray 400
  { id: 'warm', label: 'Warm & fuzzy', icon: Coffee, color: '#FDBA74' }, // Orange 300
  { id: 'brain_off', label: 'Turn my brain off', icon: Popcorn, color: '#6EE7B7' }, // Emerald 300
  { id: 'visual', label: 'Visually stunning', icon: Sparkles, color: '#38BDF8' }, // Sky 400
];

export default function MoodSelector({ 
  selected, 
  onSelect 
}: { 
  selected: MoodId | null; 
  onSelect: (id: MoodId) => void; 
}) {
  return (
    <View style={styles.container}>
      {MOODS.map(mood => {
        const isSelected = selected === mood.id;
        const Icon = mood.icon;
        return (
          <TouchableOpacity
            key={mood.id}
            style={[
              styles.tile, 
              isSelected && styles.tileSelected,
              { backgroundColor: isSelected ? mood.color : Colors.background.surface }
            ]}
            onPress={() => onSelect(mood.id)}
            activeOpacity={0.8}
          >
            <Icon color={isSelected ? '#000000' : Colors.text.primary} size={32} strokeWidth={1.5} />
            <Text style={[
              styles.label, 
              isSelected && styles.labelSelected
            ]}>
              {mood.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    justifyContent: 'space-between',
  },
  tile: {
    width: '48%',
    aspectRatio: 1.1,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing[2],
  },
  tileSelected: {
    borderColor: 'rgba(255,255,255,0.2)',
  },
  emoji: {
    fontSize: 28,
  },
  label: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.headingSemi,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  labelSelected: {
    color: '#000000', // Dark text on the bright active background
    fontFamily: Typography.family.heading,
  },
});
