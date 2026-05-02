import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import {
  View, Text, StyleSheet, ViewStyle, Modal, Animated,
  TouchableWithoutFeedback, Dimensions, Platform,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../tokens';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const ANIMATION_DURATION = 280;

interface BottomSheetProps {
  title?: string;
  children: React.ReactNode;
  snapPoints?: string[];
  onClose?: () => void;
  style?: ViewStyle;
  handleComponent?: React.ReactNode;
}

export interface BottomSheetRef {
  expand: () => void;
  close: () => void;
  snapToIndex: (index: number) => void;
}

export const BottomSheet = React.forwardRef<BottomSheetRef, BottomSheetProps>(
  ({ title, children, snapPoints = ['50%'], onClose, style }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    const open = useCallback(() => {
      setVisible(true);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.65,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }, [translateY, backdropOpacity]);

    const close = useCallback(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
        onClose?.();
      });
    }, [translateY, backdropOpacity, onClose]);

    useImperativeHandle(ref, () => ({
      expand: open,
      close,
      snapToIndex: (index: number) => {
        if (index < 0) close();
        else open();
      },
    }), [open, close]);

    // Parse snap point height
    const snapHeight = React.useMemo(() => {
      const pt = snapPoints[0] ?? '50%';
      if (typeof pt === 'string' && pt.endsWith('%')) {
        return SCREEN_HEIGHT * (parseFloat(pt) / 100);
      }
      return SCREEN_HEIGHT * 0.5;
    }, [snapPoints]);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={close}
        statusBarTranslucent
      >
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={close}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            { height: snapHeight, transform: [{ translateY }] },
          ]}
        >
          {/* Handle indicator */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}

          <View style={[styles.content, style]}>
            {children}
          </View>
        </Animated.View>
      </Modal>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.elevated,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    paddingBottom: Platform.OS === 'ios' ? 34 : 24, // safe area approx
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing[3],
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.background.overlay,
  },
  header: {
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[5],
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[8],
  },
});
