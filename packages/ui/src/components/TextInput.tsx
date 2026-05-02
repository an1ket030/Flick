import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput as RNTextInput, Animated,
  StyleSheet, ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../tokens';

interface TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  helper?: string;
  error?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  returnKeyType?: 'done' | 'next' | 'search' | 'go';
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
  editable?: boolean;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  rightSlot?: React.ReactNode;
}

export function TextInput({
  label,
  value,
  onChangeText,
  placeholder,
  helper,
  error,
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType = 'default',
  returnKeyType = 'done',
  onSubmitEditing,
  autoFocus,
  editable = true,
  maxLength,
  multiline,
  numberOfLines,
  style,
  rightSlot,
}: TextInputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? Colors.status.error
    : focused
      ? Colors.brand.primary
      : Colors.background.overlay;

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputContainer, { borderColor }]}>
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.tertiary}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          editable={editable}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[
            styles.input,
            !editable && styles.inputDisabled,
            multiline && styles.inputMultiline,
          ]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={Colors.brand.primary}
        />
        {rightSlot && <View style={styles.rightSlot}>{rightSlot}</View>}
      </View>

      {(error || helper) && (
        <Text style={[styles.helper, error && styles.helperError]}>
          {error ?? helper}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing[1] },
  label: {
    fontFamily: Typography.family.bodySemibold,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: Spacing[4],
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontFamily: Typography.family.body,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    paddingVertical: Spacing[3],
  },
  inputDisabled: { opacity: 0.5 },
  inputMultiline: { paddingTop: Spacing[3], textAlignVertical: 'top' },
  rightSlot: { paddingLeft: Spacing[2] },
  helper: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.xs,
    color: Colors.text.tertiary,
  },
  helperError: { color: Colors.status.error },
});
