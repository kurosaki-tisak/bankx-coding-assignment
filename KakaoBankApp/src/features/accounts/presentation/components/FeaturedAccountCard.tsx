import { memo } from 'react';
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

export type FeaturedCardVariant = 'favorite' | 'top1' | 'top2';

export type FeaturedAccountCardProps = {
  account: Account;
  variant: FeaturedCardVariant;
  onPress?: (account: Account) => void;
  onTransferPress?: (account: Account) => void;
  onCardPress?: (account: Account) => void;
  onMorePress?: (account: Account) => void;
  onToggleFavorite?: (account: Account) => void;
};

type Palette = {
  background: string;
  primaryText: string;
  secondaryText: string;
  chipBackground: string;
  chipText: string;
  iconGlyph: string;
  showCardButton: boolean;
  showTransferButton: boolean;
};

function paletteFor(variant: FeaturedCardVariant): Palette {
  switch (variant) {
    case 'favorite':
      return {
        background: colors.accountCard.favorite,
        primaryText: colors.text.primary,
        secondaryText: colors.text.secondary,
        chipBackground: 'rgba(25,25,25,0.08)',
        chipText: colors.text.primary,
        iconGlyph: 'B',
        showCardButton: true,
        showTransferButton: true,
      };
    case 'top1':
      return {
        background: colors.accountCard.coral,
        primaryText: colors.text.inverse,
        secondaryText: colors.textOnDark.secondary,
        chipBackground: colors.chip.onDark,
        chipText: colors.text.inverse,
        iconGlyph: '🏛',
        showCardButton: false,
        showTransferButton: true,
      };
    case 'top2':
    default:
      return {
        background: colors.accountCard.purple,
        primaryText: colors.text.inverse,
        secondaryText: colors.textOnDark.secondary,
        chipBackground: colors.chip.onDark,
        chipText: colors.text.inverse,
        iconGlyph: '☺',
        showCardButton: false,
        showTransferButton: false,
      };
  }
}

function formatBalance(balance: number): string {
  return `₩${new Intl.NumberFormat('en-US').format(balance)}`;
}

export const FeaturedAccountCard = memo(function FeaturedAccountCard({
  account,
  variant,
  onPress,
  onTransferPress,
  onCardPress,
  onMorePress,
  onToggleFavorite,
}: FeaturedAccountCardProps) {
  const palette = paletteFor(variant);
  const isFavorite = variant === 'favorite';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${account.name}, ${formatBalance(account.balance)}`}
      onPress={() => onPress?.(account)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: palette.background },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconGlyph}>{palette.iconGlyph}</Text>
          </View>
          <View style={styles.nameRow}>
            <Text
              style={[styles.name, { color: palette.primaryText }]}
              numberOfLines={1}
            >
              {account.name}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isFavorite ? 'นำออกจากบัญชีโปรด' : 'ตั้งเป็นบัญชีโปรด'
              }
              hitSlop={spacing.sm}
              onPress={() => onToggleFavorite?.(account)}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text
                style={[
                  styles.star,
                  {
                    color: isFavorite
                      ? colors.text.primary
                      : palette.secondaryText,
                  },
                ]}
              >
                {isFavorite ? '★' : '☆'}
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="ตัวเลือกเพิ่มเติม"
          hitSlop={spacing.sm}
          onPress={() => onMorePress?.(account)}
          style={({ pressed }) => [styles.moreHit, pressed && styles.pressed]}
        >
          <Text style={[styles.moreDots, { color: palette.secondaryText }]}>
            ···
          </Text>
        </Pressable>
      </View>

      <View style={styles.balanceRow}>
        <Text style={[styles.balance, { color: palette.primaryText }]}>
          {formatBalance(account.balance)}
        </Text>

        {palette.showCardButton || palette.showTransferButton ? (
          <View style={styles.actions}>
            {palette.showCardButton ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => onCardPress?.(account)}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: palette.chipBackground },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.chipText, { color: palette.chipText }]}>
                  บัตร
                </Text>
              </Pressable>
            ) : null}
            {palette.showTransferButton ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => onTransferPress?.(account)}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: palette.chipBackground },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.chipText, { color: palette.chipText }]}>
                  โอนเงิน
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: pressable.opacity.pressed,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  titleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  iconCircle: {
    width: size.avatar,
    height: size.avatar,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: {
    color: colors.text.primary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },
  nameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    flexShrink: 1,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.medium,
  },
  star: {
    fontSize: typography.size.subtitle,
    fontWeight: typography.weight.bold,
  },
  moreHit: {
    width: size.moreHit,
    height: size.moreHit,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreDots: {
    fontSize: typography.size.title,
    fontWeight: typography.weight.bold,
    letterSpacing: 1,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  balance: {
    flex: 1,
    fontSize: typography.size.headline,
    fontWeight: typography.weight.bold,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xxs,
  },
  chip: {
    minWidth: size.actionChipMinWidth,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  chipText: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },
});
