import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, Radius, Spacing } from '../tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[`size_${size}`],
        styles[`variant_${variant}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Colors.text.inverse : Colors.brand.primary}
        />
      ) : (
        <Text
          style={[
            styles.label,
            styles[`label_${size}`],
            styles[`labelColor_${variant}`],
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },

  // Sizes
  size_sm: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    minHeight: 36,
  },
  size_md: {
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[6],
    minHeight: 48,
  },
  size_lg: {
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[8],
    minHeight: 56,
  },

  // Variants
  variant_primary: {
    backgroundColor: Colors.brand.primary,
  },
  variant_secondary: {
    backgroundColor: Colors.background.surface,
    borderWidth: 1.5,
    borderColor: Colors.background.overlay,
  },
  variant_ghost: {
    backgroundColor: Colors.transparent,
  },
  variant_danger: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1.5,
    borderColor: Colors.status.error,
  },

  // Label base
  label: {
    fontFamily: Typography.family.bodySemibold,
    letterSpacing: 0.3,
  },
  label_sm: {
    fontSize: Typography.size.sm,
  },
  label_md: {
    fontSize: Typography.size.base,
  },
  label_lg: {
    fontSize: Typography.size.md,
  },

  // Label colours by variant
  labelColor_primary: {
    color: Colors.text.inverse,
    fontFamily: Typography.family.bodyBold,
  },
  labelColor_secondary: {
    color: Colors.text.primary,
  },
  labelColor_ghost: {
    color: Colors.brand.primary,
  },
  labelColor_danger: {
    color: Colors.status.error,
  },
});
