import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { memo, type ComponentProps } from 'react';
import { type ColorValue } from 'react-native';

import { size } from '@/src/core/theme';

import type { TabIconName } from '../../data/models/tab';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const TAB_MATERIAL_ICONS: Record<
  TabIconName,
  { focused: MaterialIconName; idle: MaterialIconName }
> = {
  home: { focused: 'home', idle: 'home' },
  benefits: { focused: 'card-giftcard', idle: 'card-giftcard' },
  products: { focused: 'apps', idle: 'apps' },
  more: { focused: 'more-horiz', idle: 'more-horiz' },
};

type IconProps = {
  color: ColorValue;
  focused?: boolean;
};

function MaterialTabGlyph({
  name,
  color,
  focused,
}: IconProps & { name: TabIconName }) {
  const icons = TAB_MATERIAL_ICONS[name];
  const iconName = focused ? icons.focused : icons.idle;

  return (
    <MaterialIcons
      name={iconName}
      size={size.tabIcon}
      color={color}
    />
  );
}

export const HomeTabIcon = memo(function HomeTabIcon(props: IconProps) {
  return <MaterialTabGlyph name="home" {...props} />;
});

export const BenefitsTabIcon = memo(function BenefitsTabIcon(props: IconProps) {
  return <MaterialTabGlyph name="benefits" {...props} />;
});

export const ProductsTabIcon = memo(function ProductsTabIcon(props: IconProps) {
  return <MaterialTabGlyph name="products" {...props} />;
});

export const MoreTabIcon = memo(function MoreTabIcon(props: IconProps) {
  return <MaterialTabGlyph name="more" {...props} />;
});

export function renderTabIcon(
  name: TabIconName,
  color: ColorValue,
  focused: boolean,
) {
  return <MaterialTabGlyph name={name} color={color} focused={focused} />;
}
