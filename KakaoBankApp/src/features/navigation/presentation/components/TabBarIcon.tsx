import { memo } from 'react';
import { type ColorValue, StyleSheet, View } from 'react-native';

import { colors, size } from '@/src/core/theme';

import type { TabIconName } from '../../data/models/tab';
import { renderTabIcon } from './TabBarIcons';

export type TabBarIconProps = {
  name: TabIconName;
  color: ColorValue;
  focused: boolean;
  showBadge?: boolean;
};

/**
 * Bottom-tab icon View — props only (badge + icon glyph).
 */
export const TabBarIcon = memo(function TabBarIcon({
  name,
  color,
  focused,
  showBadge = false,
}: TabBarIconProps) {
  return (
    <View style={styles.wrap}>
      {renderTabIcon(name, color, focused)}
      {showBadge ? <View style={styles.badge} /> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    width: size.tabIconHit,
    height: size.tabIconHit,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 4,
    width: size.badgeDot,
    height: size.badgeDot,
    borderRadius: size.badgeDot,
    backgroundColor: colors.notification,
  },
});
