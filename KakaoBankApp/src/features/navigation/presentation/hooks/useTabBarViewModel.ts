import { useCallback, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  buildTabBarItems,
  getDefaultTabBadges,
} from '../../data/tabBarConfig';
import type { TabBadgeState, TabBarItemConfig } from '../../data/models/tab';
import {
  resolveTabBarBottomInset,
  resolveTabBarHeight,
} from '../../data/models/tabBarSafeArea';

export type UseTabBarViewModelResult = {
  tabs: TabBarItemConfig[];
  badges: TabBadgeState;
  dismissBadge: (key: keyof TabBadgeState) => void;
  /** Bottom inset applied to the tab bar (clears Android system nav). */
  tabBarBottomInset: number;
  tabBarHeight: number;
};

/**
 * Tab bar ViewModel — badge state + safe-area metrics for the bottom tabs.
 */
export function useTabBarViewModel(): UseTabBarViewModelResult {
  const insets = useSafeAreaInsets();
  const [badges, setBadges] = useState<TabBadgeState>(getDefaultTabBadges);

  const tabs = useMemo(() => buildTabBarItems(badges), [badges]);

  const tabBarBottomInset = resolveTabBarBottomInset(insets.bottom);
  const tabBarHeight = resolveTabBarHeight(tabBarBottomInset);

  const dismissBadge = useCallback((key: keyof TabBadgeState) => {
    setBadges((prev) => ({ ...prev, [key]: false }));
  }, []);

  return {
    tabs,
    badges,
    dismissBadge,
    tabBarBottomInset,
    tabBarHeight,
  };
}
