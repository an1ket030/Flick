import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import BottomSheetLib, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Colors, Typography, Spacing, Radius } from '../tokens.js';

interface BottomSheetProps {
  title?: string;
  children: React.ReactNode;
  snapPoints?: string[];
  onClose?: () => void;
  style?: ViewStyle;
  handleComponent?: React.ReactNode;
}

export type BottomSheetRef = BottomSheetLib;

export const BottomSheet = React.forwardRef<BottomSheetLib, BottomSheetProps>(
  (
    { title, children, snapPoints = ['50%'], onClose, style },
    ref
  ) => {
    const snaps = useMemo(() => snapPoints, [snapPoints]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.65}
        />
      ),
      []
    );

    return (
      <BottomSheetLib
        ref={ref}
        index={-1}
        snapPoints={snaps}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onClose={onClose}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handle}
      >
        <View style={[styles.content, style]}>
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}
          {children}
        </View>
      </BottomSheetLib>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.background.elevated,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
  },
  handle: {
    backgroundColor: Colors.background.overlay,
    width: 36,
    height: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[8],
  },
  header: {
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.overlay,
    marginBottom: Spacing[4],
  },
  title: {
    fontFamily: Typography.family.bodySemibold,
    fontSize: Typography.size.md,
    color: Colors.text.primary,
    textAlign: 'center',
  },
});
