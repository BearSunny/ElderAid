import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Colors from '@/constants/Colors';
import { FontSizes, FontWeights } from '@/constants/Fonts';
import Spacing from '@/constants/Spacing';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
type ButtonSize = 'small' | 'medium' | 'large' | 'xlarge';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export default function Button({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
  disabled = false,
  ...props
}: ButtonProps) {
  // Get the appropriate styles based on variant and size
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle = [styles.button, styles[`${size}Button`]] as ViewStyle[];
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledButton);
      return baseStyle;
    }
    
    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.secondaryButton);
        break;
      case 'outline':
        baseStyle.push(styles.outlineButton);
        break;
      case 'danger':
        baseStyle.push(styles.dangerButton);
        break;
      case 'success':
        baseStyle.push(styles.successButton);
        break;
      default:
        baseStyle.push(styles.primaryButton);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText, styles[`${size}Text`]];
    
    if (disabled) {
      baseStyle.push(styles.disabledText);
      return baseStyle;
    }
    
    switch (variant) {
      case 'outline':
        baseStyle.push(styles.outlineText);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryText);
        break;
      default:
        baseStyle.push(styles.defaultText);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || loading}
      {...props}
    >
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'outline' ? Colors.primary[700] : Colors.white} 
          />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create<{
  button: ViewStyle;
  fullWidth: ViewStyle;
  primaryButton: ViewStyle;
  secondaryButton: ViewStyle;
  outlineButton: ViewStyle;
  dangerButton: ViewStyle;
  successButton: ViewStyle;
  disabledButton: ViewStyle;
  smallButton: ViewStyle;
  mediumButton: ViewStyle;
  largeButton: ViewStyle;
  xlargeButton: ViewStyle;
  contentContainer: ViewStyle;
  iconContainer: ViewStyle;
  buttonText: TextStyle;
  smallText: TextStyle;
  mediumText: TextStyle;
  largeText: TextStyle;
  xlargeText: TextStyle;
  defaultText: TextStyle;
  outlineText: TextStyle;
  secondaryText: TextStyle;
  disabledText: TextStyle;
}>({
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: Colors.primary[600],
  },
  secondaryButton: {
    backgroundColor: Colors.secondary[600],
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary[600],
  },
  dangerButton: {
    backgroundColor: Colors.error[600],
  },
  successButton: {
    backgroundColor: Colors.success[600],
  },
  disabledButton: {
    backgroundColor: Colors.gray[300],
  },
  smallButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    minHeight: 36,
  },
  mediumButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  largeButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 56,
  },
  xlargeButton: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    minHeight: 72,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  smallText: {
    fontSize: FontSizes.sm,
  },
  mediumText: {
    fontSize: FontSizes.base,
  },
  largeText: {
    fontSize: FontSizes.lg,
  },
  xlargeText: {
    fontSize: FontSizes.xl,
  },
  defaultText: {
    color: Colors.white,
  },
  outlineText: {
    color: Colors.primary[700],
  },
  secondaryText: {
    color: Colors.white,
  },
  disabledText: {
    color: Colors.gray[500],
  },
});