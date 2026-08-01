import { useCallback, useMemo, useState } from 'react';

import {
  buildTabBarItems,
  getDefaultTabBadges,
} from '../../data/tabBarConfig';
import type { TabBadgeState, TabBarItemConfig } from '../../data/models/tab';

export type UseTabBarViewModelResult = {
  tabs: TabBarItemConfig[];
  badges: TabBadgeState;
  dismissBadge: (key: keyof TabBadgeState) => void;
};

/**
 * Tab bar ViewModel — owns badge state only.
 * Tab titles / routes / icons / default badges come from Model (tabBarConfig).
 */
export function useTabBarViewModel(): UseTabBarViewModelResult {
  const [badges, setBadges] = useState<TabBadgeState>(getDefaultTabBadges);

  const tabs = useMemo(() => buildTabBarItems(badges), [badges]);

  const dismissBadge = useCallback((key: keyof TabBadgeState) => {
    setBadges((prev) => ({ ...prev, [key]: false }));
  }, []);

  return { tabs, badges, dismissBadge };
}
