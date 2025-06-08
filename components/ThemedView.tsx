import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'white');
  const backgroundColor = typeof color === 'string' ? color : color[100] ?? '#fff';

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
