import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import Text from '@/components/typography/Text';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { FontSizes } from '@/constants/Fonts';

interface MenuButtonProps extends TouchableOpacityProps {
  title: string;
  icon: React.ReactNode;
  color?: string;
  route?: '/emergency' | '/medication' | '/memories' | '/family/settings' | '/chat';
  style?: StyleProp<ViewStyle>;
  size?: 'medium' | 'large';
  onPress?: () => void;
}

export default function MenuButton({
  title,
  icon,
  color = Colors.primary[600],
  route,
  style,
  size = 'large',
  onPress,
  ...props
}: MenuButtonProps) {
  const router = useRouter();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (route) {
      router.push(route);
    }
  };

  const sizeStyles = size === 'large' ? styles.largeButton : styles.mediumButton;
  const textSize = size === 'large' ? styles.largeText : styles.mediumText;
  
  return (
    <TouchableOpacity
      style={[styles.container, sizeStyles, { backgroundColor: color }, style]}
      onPress={handlePress}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text variant="h3" style={[styles.title, textSize]} color={Colors.white}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  mediumButton: {
    height: 100,
    padding: Spacing.md,
  },
  largeButton: {
    height: 140,
    padding: Spacing.lg,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  mediumText: {
    fontSize: FontSizes.lg,
  },
  largeText: {
    fontSize: FontSizes.xl,
  },
});