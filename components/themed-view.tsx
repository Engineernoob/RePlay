import { View, type ViewProps } from 'react-native';
import { useTheme } from '@react-navigation/native';
import type { WalkmanThemeType } from '@/constants/walkman-theme';

export type ThemedViewProps = ViewProps;

export function ThemedView({ style, ...rest }: ThemedViewProps) {
  const theme = useTheme() as WalkmanThemeType;

  return (
    <View style={[{ backgroundColor: theme.colors.background }, style]} {...rest} />
  );
}
