import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import Text from '@/components/typography/Text';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

type StatusType = 'success' | 'warning' | 'error' | 'info';

interface StatusPillProps {
  label: string;
  type?: StatusType;
  style?: StyleProp<ViewStyle>;
}

export default function StatusPill({
  label,
  type = 'info',
  style,
}: StatusPillProps) {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return Colors.success[100];
      case 'warning':
        return Colors.warning[100];
      case 'error':
        return Colors.error[100];
      case 'info':
      default:
        return Colors.primary[100];
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return Colors.success[700];
      case 'warning':
        return Colors.warning[700];
      case 'error':
        return Colors.error[700];
      case 'info':
      default:
        return Colors.primary[700];
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
    >
      <Text
        variant="bodySmall"
        color={getTextColor()}
        style={styles.text}
        bold
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  text: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});