import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: 'none' | 'low' | 'medium' | 'high';
  padding?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
}

export default function Card({
  children,
  style,
  elevation = 'medium',
  padding = 'medium',
  borderRadius = 'medium',
}: CardProps) {
  const elevationStyle = {
    none: {},
    low: styles.elevationLow,
    medium: styles.elevationMedium,
    high: styles.elevationHigh,
  }[elevation];

  const paddingStyle = {
    none: {},
    small: { padding: Spacing.sm },
    medium: { padding: Spacing.md },
    large: { padding: Spacing.lg },
  }[padding];

  const borderRadiusStyle = {
    none: {},
    small: { borderRadius: 8 },
    medium: { borderRadius: 16 },
    large: { borderRadius: 24 },
  }[borderRadius];

  return (
    <View
      style={[
        styles.card,
        elevationStyle,
        paddingStyle,
        borderRadiusStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  elevationLow: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  elevationMedium: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  elevationHigh: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
});