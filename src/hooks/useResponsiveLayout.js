import { useWindowDimensions, Platform } from 'react-native';
import { Layout } from '@/constants/theme';

export function useResponsiveLayout() {
  const { width } = useWindowDimensions();
  const isTablet = width >= Layout.tabletBreakpoint || Platform.isPad;
  return {
    isTablet,
    screenWidth: width,
    contentMaxWidth: isTablet ? Layout.maxContentWidth : undefined,
  };
}
