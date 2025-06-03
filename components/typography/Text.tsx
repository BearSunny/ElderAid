import React, { ReactNode } from 'react';
import { Text as RNText, StyleSheet, TextStyle, StyleProp } from 'react-native';
import Colors from '@/constants/Colors';
import { FontSizes, FontWeights, LineHeights } from '@/constants/Fonts';

type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodyLarge'
  | 'bodySmall'
  | 'caption';

interface TextProps {
  children: ReactNode;
  variant?: TextVariant;
  style?: StyleProp<TextStyle>;
  color?: string;
  center?: boolean;
  bold?: boolean;
  medium?: boolean;
  numberOfLines?: number;
  selectable?: boolean;
  onPress?: () => void;
}

export default function Text({
  children,
  variant = 'body',
  style,
  color,
  center = false,
  bold = false,
  medium = false,
  numberOfLines,
  selectable = false,
  onPress,
  ...props
}: TextProps & Omit<React.ComponentProps<typeof RNText>, 'style'>) {
  const variantStyle = styles[variant];
  
  const textStyles = [
    styles.base,
    variantStyle,
    center && styles.center,
    bold && styles.bold,
    medium && styles.medium,
    color ? { color } : null,
    style,
  ];

  return (
    <RNText
      style={textStyles as StyleProp<TextStyle>}
      numberOfLines={numberOfLines}
      selectable={selectable}
      onPress={onPress}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    color: Colors.gray[900],
    fontWeight: '400',
  },
  center: {
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  medium: {
    fontWeight: 'medium',
  },
  display: {
    fontSize: FontSizes.huge,
    fontWeight: 'bold',
    lineHeight: FontSizes.huge * LineHeights.tight,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold',
    lineHeight: FontSizes.xxxl * LineHeights.tight,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    lineHeight: FontSizes.xxl * LineHeights.tight,
  },
  h3: {
    fontSize: FontSizes.xl,
    fontWeight: 'medium',
    lineHeight: FontSizes.xl * LineHeights.normal,
  },
  h4: {
    fontSize: FontSizes.lg,
    fontWeight: 'medium',
    lineHeight: FontSizes.lg * LineHeights.normal,
  },
  body: {
    fontSize: FontSizes.base,
    lineHeight: FontSizes.base * LineHeights.relaxed,
  },
  bodyLarge: {
    fontSize: FontSizes.lg,
    lineHeight: FontSizes.lg * LineHeights.relaxed,
  },
  bodySmall: {
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm * LineHeights.relaxed,
  },
  caption: {
    fontSize: FontSizes.xs,
    color: Colors.gray[500],
    lineHeight: FontSizes.xs * LineHeights.normal,
  },
});