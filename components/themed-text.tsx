import { Text, type TextProps } from 'react-native';
import { useTheme } from '@react-navigation/native';
import type { WalkmanThemeType } from '@/constants/walkman-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const theme = useTheme() as WalkmanThemeType;

  const getStyle = () => {
    switch (type) {
      case 'title':
        return {
          fontSize: 24,
          fontWeight: '700',
          color: theme.colors.text,
        };
      case 'defaultSemiBold':
        return {
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.text,
        };
      case 'subtitle':
        return {
          fontSize: 18,
          fontWeight: '500',
          color: theme.colors.text,
        };
      case 'link':
        return {
          fontSize: 16,
          color: theme.colors.primary,
          textDecorationLine: 'underline',
        };
      default:
        return {
          fontSize: 16,
          color: theme.colors.text,
        };
    }
  };

  return (
    <Text style={[getStyle(), style]} {...rest} />
  );
}
