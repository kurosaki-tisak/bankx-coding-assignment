import { StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, size, spacing, typography } from '@/src/core/theme';
import type { TabRouteName } from '@/src/features/navigation/data/models/tab';
import { useTabBarViewModel } from '@/src/features/navigation/presentation/hooks/useTabBarViewModel';
import { TabBarIcon } from '@/src/features/navigation/presentation/components/TabBarIcon';

export default function TabLayout() {
  const { tabs } = useTabBarViewModel();
  const insets = useSafeAreaInsets();

  const bottomInset = Math.max(insets.bottom, size.tabBarMinBottomInset);
  const tabBarHeight = size.tabBarContentHeight + bottomInset;

  const tabByRoute = Object.fromEntries(
    tabs.map((tab) => [tab.route, tab]),
  ) as Record<TabRouteName, (typeof tabs)[number]>;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.icon.active,
        tabBarInactiveTintColor: colors.icon.default,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: typography.size.micro,
          fontWeight: typography.weight.medium,
          marginTop: spacing.xxs,
        },
        tabBarItemStyle: {
          paddingTop: spacing.xs,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border.subtle,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: tabBarHeight,
          paddingTop: spacing.xs,
          paddingBottom: bottomInset,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: tabByRoute.index.title,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={tabByRoute.index.icon}
              color={color}
              focused={focused}
              showBadge={tabByRoute.index.showBadge}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="benefits"
        options={{
          title: tabByRoute.benefits.title,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={tabByRoute.benefits.icon}
              color={color}
              focused={focused}
              showBadge={tabByRoute.benefits.showBadge}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: tabByRoute.products.title,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={tabByRoute.products.icon}
              color={color}
              focused={focused}
              showBadge={tabByRoute.products.showBadge}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: tabByRoute.more.title,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={tabByRoute.more.icon}
              color={color}
              focused={focused}
              showBadge={tabByRoute.more.showBadge}
            />
          ),
        }}
      />
    </Tabs>
  );
}
