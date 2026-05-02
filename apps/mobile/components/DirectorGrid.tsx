import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';

// 30 well-known and niche global directors
const DIRECTORS = [
  'Christopher Nolan', 'Martin Scorsese', 'Quentin Tarantino', 'Stanley Kubrick', 'Steven Spielberg',
  'David Fincher', 'Denis Villeneuve', 'Alfred Hitchcock', 'Francis Ford Coppola', 'Ridley Scott',
  'Paul Thomas Anderson', 'Bong Joon-ho', 'Akira Kurosawa', 'Hayao Miyazaki', 'Wong Kar-wai',
  'Wes Anderson', 'Greta Gerwig', 'Jordan Peele', 'Edgar Wright', 'Ari Aster',
  'David Lynch', 'Celine Sciamma', 'Agnes Varda', 'Park Chan-wook', 'Satyajit Ray',
  'Takeshi Kitano', 'Wim Wenders', 'Andrei Tarkovsky', 'Pedro Almodovar', 'Yorgos Lanthimos'
];

export default function DirectorGrid({ 
  selected, 
  onToggle 
}: { 
  selected: string[]; 
  onToggle: (name: string) => void; 
}) {
  return (
    <View style={styles.container}>
      {DIRECTORS.map(director => {
        const isSelected = selected.includes(director);
        return (
          <TouchableOpacity
            key={director}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onToggle(director)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {director}
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
    gap: Spacing[2],
    marginTop: Spacing[4],
  },
  chip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    backgroundColor: Colors.background.overlay,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: 'rgba(255, 107, 44, 0.1)',
    borderColor: Colors.brand.primary,
  },
  chipText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
  },
  chipTextSelected: {
    color: Colors.brand.primary,
    fontFamily: Typography.family.bodyBold,
  },
});
