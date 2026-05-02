import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export default function TagInput({ tags, onChange, maxTags = 10 }: TagInputProps) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const freshVal = input.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (freshVal && !tags.includes(freshVal) && tags.length < maxTags) {
      onChange([...tags, freshVal]);
      setInput('');
    }
  };

  const handleRemove = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Custom Tags</Text>
      
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleAdd}
          placeholder="e.g. mind-bending, rainy-day"
          placeholderTextColor={Colors.text.tertiary}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
        />
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={handleAdd}
          disabled={!input.trim() || tags.length >= maxTags}
        >
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {tags.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
          <View style={styles.tagRow}>
            {tags.map(tag => (
              <TouchableOpacity key={tag} style={styles.tagChip} onPress={() => handleRemove(tag)}>
                <Text style={styles.tagText}>#{tag}</Text>
                <Text style={styles.tagRemove}>×</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
      
      {tags.length >= maxTags && (
        <Text style={styles.limitText}>Maximum {maxTags} tags allowed.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing[4],
  },
  label: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginBottom: Spacing[2],
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.background.surface,
    color: Colors.text.primary,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.background.overlay,
    paddingHorizontal: Spacing[3],
    fontFamily: Typography.family.body,
    fontSize: Typography.size.base,
  },
  addBtn: {
    height: 48,
    paddingHorizontal: Spacing[4],
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: Colors.text.inverse,
    fontFamily: Typography.family.bodyBold,
    fontSize: Typography.size.sm,
  },
  tagScroll: {
    marginTop: Spacing[1],
  },
  tagRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 44, 0.1)',
    borderWidth: 1,
    borderColor: Colors.brand.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
    gap: 4,
  },
  tagText: {
    color: Colors.brand.primary,
    fontFamily: Typography.family.bodyMedium,
    fontSize: Typography.size.xs,
  },
  tagRemove: {
    color: Colors.brand.primary,
    fontFamily: Typography.family.bodyBold,
    fontSize: Typography.size.sm,
    marginTop: -2,
  },
  limitText: {
    color: Colors.text.tertiary,
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    marginTop: 4,
  },
});
