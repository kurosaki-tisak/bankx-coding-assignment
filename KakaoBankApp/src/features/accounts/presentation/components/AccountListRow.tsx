import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { memo, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Account } from '@/src/features/accounts/data/models/account';
import {
  colors,
  pressable,
  radius,
  size,
  spacing,
  typography,
} from '@/src/core/theme';

export type AccountListRowProps = {
  account: Account;
  index: number;
  isFavorite?: boolean;
  onPress?: (account: Account) => void;
  onToggleFavorite?: (account: Account) => void;
};

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const ROW_ICONS: MaterialIconName[] = [
  'favorite',
  'event',
  'folder',
  'credit-card',
  'account-balance',
  'savings',
];

function formatBalance(balance: number): string {
  return `₩${new Intl.NumberFormat('en-US').format(balance)}`;
}

export const AccountListRow = memo(function AccountListRow({
  account,
  index,
  isFavorite = false,
  onPress,
  onToggleFavorite,
}: AccountListRowProps) {
  const iconName = ROW_ICONS[index % ROW_ICONS.length];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(account)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <MaterialIcons
          name={iconName}
          size={typography.size.title}
          color={colors.icon.active}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {account.name}
          </Text>
          <Text style={styles.indexBadge}>{index + 1}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? 'นำออกจากบัญชีโปรด' : 'ตั้งเป็นบัญชีโปรด'
            }
            hitSlop={spacing.sm}
            onPress={() => onToggleFavorite?.(account)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <MaterialIcons
              name={isFavorite ? 'star' : 'star-border'}
              size={typography.size.bodyLarge}
              color={isFavorite ? colors.text.primary : colors.icon.muted}
            />
          </Pressable>
        </View>
        <Text style={styles.balance}>{formatBalance(account.balance)}</Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: pressable.opacity.pressed,
  },
  iconWrap: {
    width: size.avatar,
    height: size.avatar,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    flexShrink: 1,
    color: colors.text.primary,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.medium,
  },
  indexBadge: {
    color: colors.viewAllBadge,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },
  balance: {
    color: colors.text.primary,
    fontSize: typography.size.subtitle,
    fontWeight: typography.weight.bold,
  },
});
