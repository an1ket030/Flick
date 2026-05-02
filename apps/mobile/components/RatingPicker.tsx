import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slider } from '@miblanchard/react-native-slider';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';

interface RatingPickerProps {
  rating: number | null; // 1-10 scale
  onRatingChange: (rating: number) => void;
  onSlidingComplete?: (rating: number) => void;
}

export default function RatingPicker({ rating, onRatingChange, onSlidingComplete }: RatingPickerProps) {
  // If no rating given, start thumb at 0 visually, but mapped to 1 when touched
  const displayValue = rating === null ? 0 : rating;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Your Rating</Text>
        {rating !== null && (
          <View style={styles.valueBadge}>
            <Text style={styles.valueText}>{rating}</Text>
          </View>
        )}
      </View>
      <Slider
        value={displayValue}
        minimumValue={1}
        maximumValue={10}
        step={1}
        onValueChange={(val) => onRatingChange(Array.isArray(val) ? val[0] : val)}
        onSlidingComplete={(val) => onSlidingComplete?.(Array.isArray(val) ? val[0] : val)}
        minimumTrackTintColor={Colors.brand.primary}
        maximumTrackTintColor={Colors.background.overlay}
        thumbTintColor={Colors.text.primary}
        trackStyle={styles.track}
        thumbStyle={styles.thumb}
      />
      <View style={styles.tickLabels}>
        <Text style={styles.tickText}>1</Text>
        <Text style={styles.tickText}>10</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.surface,
    padding: Spacing[4],
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.background.overlay,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[2],
  },
  label: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.text.primary,
  },
  valueBadge: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  valueText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.inverse,
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.text.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  tickLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 4,
  },
  tickText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
  },
});
