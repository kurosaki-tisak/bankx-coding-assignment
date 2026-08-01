import { memo } from 'react';
import { type ColorValue, StyleSheet, View } from 'react-native';

import { colors, size } from '@/src/core/theme';

import type { TabIconName } from '../../data/models/tab';

type IconProps = {
  color: ColorValue;
  focused?: boolean;
};

/** KakaoBank home — solid when focused, outline when idle */
export const HomeTabIcon = memo(function HomeTabIcon({
  color,
  focused,
}: IconProps) {
  return (
    <View style={styles.box}>
      <View
        style={[
          styles.homeRoof,
          {
            borderBottomColor: color,
            borderLeftWidth: focused ? 12 : 11,
            borderRightWidth: focused ? 12 : 11,
            borderBottomWidth: focused ? 10 : 9,
          },
        ]}
      />
      <View
        style={[
          focused ? styles.homeBodyFill : styles.homeBodyOutline,
          focused
            ? { backgroundColor: color }
            : { borderColor: color },
        ]}
      >
        {focused ? <View style={styles.homeDoor} /> : null}
      </View>
    </View>
  );
});

/** KakaoBank benefits — gift outline */
export const BenefitsTabIcon = memo(function BenefitsTabIcon({
  color,
}: IconProps) {
  return (
    <View style={styles.box}>
      <View style={styles.giftTopRow}>
        <View style={[styles.giftLoop, { borderColor: color }]} />
        <View style={[styles.giftLoop, { borderColor: color }]} />
      </View>
      <View style={[styles.giftLid, { backgroundColor: color }]} />
      <View style={[styles.giftBody, { borderColor: color }]}>
        <View style={[styles.giftRibbonV, { backgroundColor: color }]} />
        <View style={[styles.giftRibbonH, { backgroundColor: color }]} />
      </View>
    </View>
  );
});

/** KakaoBank products — rounded square + 2×2 cells */
export const ProductsTabIcon = memo(function ProductsTabIcon({
  color,
}: IconProps) {
  return (
    <View style={[styles.productsFrame, { borderColor: color }]}>
      <View style={styles.productsGrid}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.productsCell, { backgroundColor: color }]}
          />
        ))}
      </View>
    </View>
  );
});

/** KakaoBank more (전체) — ellipsis in rounded rect */
export const MoreTabIcon = memo(function MoreTabIcon({ color }: IconProps) {
  return (
    <View style={[styles.moreFrame, { borderColor: color }]}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[styles.moreDot, { backgroundColor: color }]}
        />
      ))}
    </View>
  );
});

export function renderTabIcon(
  name: TabIconName,
  color: ColorValue,
  focused: boolean,
) {
  switch (name) {
    case 'home':
      return <HomeTabIcon color={color} focused={focused} />;
    case 'benefits':
      return <BenefitsTabIcon color={color} focused={focused} />;
    case 'products':
      return <ProductsTabIcon color={color} focused={focused} />;
    case 'more':
      return <MoreTabIcon color={color} focused={focused} />;
    default:
      return null;
  }
}

const ICON = size.tabIcon;

const styles = StyleSheet.create({
  box: {
    width: ICON,
    height: ICON,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftColor: colors.transparent,
    borderRightColor: colors.transparent,
    marginBottom: -1,
  },
  homeBodyFill: {
    width: 17,
    height: 13,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 1,
  },
  homeBodyOutline: {
    width: 17,
    height: 13,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  homeDoor: {
    width: 5,
    height: 7,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  giftTopRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: -2,
    zIndex: 1,
  },
  giftLoop: {
    width: 6,
    height: 5,
    borderWidth: 1.5,
    borderRadius: 3,
    borderBottomWidth: 0,
  },
  giftLid: {
    width: 20,
    height: 3,
    borderRadius: 1,
    marginBottom: 1,
  },
  giftBody: {
    width: 18,
    height: 12,
    borderWidth: 1.5,
    borderRadius: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftRibbonV: {
    position: 'absolute',
    width: 1.5,
    height: '100%',
  },
  giftRibbonH: {
    position: 'absolute',
    width: '100%',
    height: 1.5,
  },
  productsFrame: {
    width: ICON,
    height: ICON,
    borderWidth: 1.6,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productsGrid: {
    width: 12,
    height: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  productsCell: {
    width: 5,
    height: 5,
    borderRadius: 1,
  },
  moreFrame: {
    width: ICON + 2,
    height: ICON - 6,
    borderWidth: 1.6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  moreDot: {
    width: 3,
    height: 3,
    borderRadius: 999,
  },
});
