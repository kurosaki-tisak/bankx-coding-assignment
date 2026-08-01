export type TabRouteName = 'index' | 'benefits' | 'products' | 'more';

export type TabIconName = 'home' | 'benefits' | 'products' | 'more';

export type TabBarItemConfig = {
  route: TabRouteName;
  title: string;
  icon: TabIconName;
  showBadge: boolean;
};

export type TabBadgeState = Record<
  Extract<TabRouteName, 'benefits' | 'more'>,
  boolean
>;
