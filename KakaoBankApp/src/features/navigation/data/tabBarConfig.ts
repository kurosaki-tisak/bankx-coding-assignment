import type {
  TabBadgeState,
  TabBarItemConfig,
  TabIconName,
  TabRouteName,
} from './models/tab';

type TabBarDefinition = {
  route: TabRouteName;
  title: string;
  icon: TabIconName;
  badgeKey?: keyof TabBadgeState;
  /** Initial badge visibility when `badgeKey` is set */
  defaultBadge?: boolean;
};

/** Static tab definitions — Model layer (not ViewModel). */
export const TAB_BAR_DEFINITIONS: readonly TabBarDefinition[] = [
  {
    route: 'index',
    title: 'หน้าแรก',
    icon: 'home',
  },
  {
    route: 'benefits',
    title: 'สิทธิ์',
    icon: 'benefits',
    badgeKey: 'benefits',
    defaultBadge: true,
  },
  {
    route: 'products',
    title: 'สินค้า',
    icon: 'products',
  },
  {
    route: 'more',
    title: 'ทั้งหมด',
    icon: 'more',
    badgeKey: 'more',
    defaultBadge: true,
  },
] as const;

/** Initial badge visibility derived from tab definitions. */
export function getDefaultTabBadges(): TabBadgeState {
  const badges = {} as TabBadgeState;

  for (const def of TAB_BAR_DEFINITIONS) {
    if (def.badgeKey) {
      badges[def.badgeKey] = def.defaultBadge ?? false;
    }
  }

  return badges;
}

/** Merge static definitions with runtime badge state. */
export function buildTabBarItems(badges: TabBadgeState): TabBarItemConfig[] {
  return TAB_BAR_DEFINITIONS.map((def) => ({
    route: def.route,
    title: def.title,
    icon: def.icon,
    showBadge: def.badgeKey ? badges[def.badgeKey] : false,
  }));
}
