import { type ColorValue, Platform, Text, View } from 'react-native';
import { Tabs } from 'expo-router';

import { colors, spacing, typography } from '@/src/theme';

function TabIcon({
  label,
  color,
  showBadge,
}: {
  label: string;
  color: ColorValue;
  showBadge?: boolean;
}) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color, fontSize: 18, fontWeight: '600' }}>{label}</Text>
      {showBadge ? (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -10,
            width: 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: colors.notification,
          }}
        />
      ) : null}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.icon.active,
        tabBarInactiveTintColor: colors.icon.default,
        tabBarLabelStyle: {
          fontSize: typography.size.caption,
          fontWeight: typography.weight.medium,
          marginBottom: Platform.OS === 'ios' ? 0 : spacing.xs,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border.subtle,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingTop: spacing.xs,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'หน้าแรก',
          tabBarIcon: ({ color }) => <TabIcon label="⌂" color={color} />,
        }}
      />
      <Tabs.Screen
        name="benefits"
        options={{
          title: 'สิทธิประโยชน์',
          tabBarIcon: ({ color }) => (
            <TabIcon label="🎁" color={color} showBadge />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'ผลิตภัณฑ์',
          tabBarIcon: ({ color }) => <TabIcon label="▦" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'ทั้งหมด',
          tabBarIcon: ({ color }) => (
            <TabIcon label="⋯" color={color} showBadge />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
