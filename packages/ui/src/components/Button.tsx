import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors, Typography, Spacing, Radius } from '../tokens.js';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  const isDisabled = disabled || loading;

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.9}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Colors.text.inverse : Colors.text.primary}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              styles[`text_${variant}`],
              styles[`textSize_${size}`],
              isDisabled && styles.textDisabled,
              textStyle,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    borderRadius: Radius.lg,
  },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.4 },

  // Variants
  primary: { backgroundColor: Colors.brand.primary },
  secondary: { backgroundColor: Colors.background.elevated, borderWidth: 1, borderColor: Colors.background.overlay },
  ghost: { backgroundColor: Colors.transparent },
  danger: { backgroundColor: Colors.status.error },

  // Sizes
  size_sm: { paddingHorizontal: Spacing[3], paddingVertical: Spacing[2], minHeight: 36 },
  size_md: { paddingHorizontal: Spacing[5], paddingVertical: Spacing[3], minHeight: 48 },
  size_lg: { paddingHorizontal: Spacing[6], paddingVertical: Spacing[4], minHeight: 56 },

  // Text base
  text: {
    fontFamily: Typography.family.bodyBold,
    letterSpacing: Typography.tracking.wide,
  },
  text_primary: { color: Colors.text.inverse },
  text_secondary: { color: Colors.text.primary },
  text_ghost: { color: Colors.brand.primary },
  text_danger: { color: Colors.text.primary },
  textDisabled: { opacity: 0.6 },

  // Text sizes
  textSize_sm: { fontSize: Typography.size.sm },
  textSize_md: { fontSize: Typography.size.base },
  textSize_lg: { fontSize: Typography.size.md },
});
