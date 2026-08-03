import { Platform } from 'react-native';

import { size } from '@/src/core/theme';

/**
 * Resolves bottom padding for the tab bar.
 * On Android edge-to-edge, insets.bottom can report 0 while the system
 * navigation bar still overlays the UI — fall back to the nav-bar height.
 */
export function resolveTabBarBottomInset(insetsBottom: number): number {
  if (insetsBottom > 0) {
    return insetsBottom;
  }

  return Platform.OS === 'android'
    ? size.tabBarAndroidNavInset
    : size.tabBarMinBottomInset;
}

export function resolveTabBarHeight(bottomInset: number): number {
  return size.tabBarContentHeight + bottomInset;
}
