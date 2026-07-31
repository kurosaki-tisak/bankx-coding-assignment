import { memo, useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Account } from '@/src/features/accounts/types/account';
import {
  colors,
  pressable,
  radius,
  size,
  spacing,
  typography,
} from '@/src/theme';

export type AccountCardProps = {
  account: Account;
  index: number;
  onPress?: (account: Account) => void;
  onTransferPress?: (account: Account) => void;
  onMorePress?: (account: Account) => void;
};

type CardPalette = {
  background: string;
  primaryText: string;
  secondaryText: string;
  chipBackground: string;
  chipText: string;
  divider: string;
  iconGlyph: string;
  showActions: boolean;
  showStar: boolean;
};

const CARD_PALETTES: CardPalette[] = [
  {
    background: colors.accountCard.mint,
    primaryText: colors.text.primary,
    secondaryText: colors.text.secondary,
    chipBackground: colors.chip.onLight,
    chipText: colors.text.primary,
    divider: colors.divider.onLight,
    iconGlyph: 'B',
    showActions: true,
    showStar: true,
  },
  {
    background: colors.accountCard.coral,
    primaryText: colors.text.inverse,
    secondaryText: colors.textOnDark.secondary,
    chipBackground: colors.chip.onDark,
    chipText: colors.text.inverse,
    divider: colors.divider.onDark,
    iconGlyph: '$',
    showActions: false,
    showStar: false,
  },
  {
    background: colors.accountCard.steel,
    primaryText: colors.text.inverse,
    secondaryText: colors.textOnDark.secondary,
    chipBackground: colors.chip.onDark,
    chipText: colors.text.inverse,
    divider: colors.divider.onDark,
    iconGlyph: 'B',
    showActions: false,
    showStar: false,
  },
  {
    background: colors.accountCard.taupe,
    primaryText: colors.text.primary,
    secondaryText: colors.text.secondary,
    chipBackground: colors.chip.onLight,
    chipText: colors.text.primary,
    divider: colors.divider.onLight,
    iconGlyph: '🐰',
    showActions: false,
    showStar: false,
  },
  {
    background: colors.accountCard.lilac,
    primaryText: colors.text.primary,
    secondaryText: colors.text.secondary,
    chipBackground: colors.chip.onLight,
    chipText: colors.text.primary,
    divider: colors.divider.onLight,
    iconGlyph: 'B',
    showActions: false,
    showStar: false,
  },
  {
    background: colors.accountCard.peach,
    primaryText: colors.text.primary,
    secondaryText: colors.text.secondary,
    chipBackground: colors.chip.onLight,
    chipText: colors.text.primary,
    divider: colors.divider.onLight,
    iconGlyph: '₩',
    showActions: false,
    showStar: false,
  },
];

function resolvePalette(index: number): CardPalette {
  if (index === 0) {
    return CARD_PALETTES[0];
  }
  return {
    ...CARD_PALETTES[index % CARD_PALETTES.length],
    showActions: false,
    showStar: false,
  };
}

/** Assignment: balance is always KRW */
function formatBalanceKrw(balance: number): string {
  return `${new Intl.NumberFormat('th-TH').format(balance)} วอน`;
}

function formatAccountNumber(value: string): string {
  const digits = value.replace(/\s+/g, '');
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function maskAccountNumber(value: string): string {
  const digits = value.replace(/\s+/g, '');
  if (digits.length <= 4) {
    return '••••';
  }
  return `•••• •••• ${digits.slice(-4)}`;
}

type MetaRowProps = {
  label: string;
  value: string;
  color: string;
  mutedColor: string;
  trailing?: ReactNode;
};

function MetaRow({ label, value, color, mutedColor, trailing }: MetaRowProps) {
  return (
    <View style={styles.metaRow}>
      <Text style={[styles.metaLabel, { color: mutedColor }]}>{label}</Text>
      <View style={styles.metaValueWrap}>
        <Text style={[styles.metaValue, { color }]} numberOfLines={3}>
          {value}
        </Text>
        {trailing}
      </View>
    </View>
  );
}

function AccountCardComponent({
  account,
  index,
  onPress,
  onTransferPress,
  onMorePress,
}: AccountCardProps) {
  const [revealNumber, setRevealNumber] = useState(false);
  const palette = useMemo(() => resolvePalette(index), [index]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${account.name}, ${formatBalanceKrw(account.balance)}`}
      onPress={() => onPress?.(account)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: palette.background },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconGlyph}>{palette.iconGlyph}</Text>
          </View>
          <View style={styles.titleTextWrap}>
            <View style={styles.nameRow}>
              <Text
                style={[styles.accountName, { color: palette.primaryText }]}
                numberOfLines={1}
              >
                {account.name}
              </Text>
              {palette.showStar ? <Text style={styles.star}>★</Text> : null}
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="ตัวเลือกเพิ่มเติม"
          hitSlop={spacing.sm}
          onPress={() => onMorePress?.(account)}
          style={({ pressed }) => [
            styles.moreButton,
            pressed && styles.chipPressed,
          ]}
        >
          <Text style={[styles.moreDots, { color: palette.secondaryText }]}>
            ···
          </Text>
        </Pressable>
      </View>

      <View style={styles.balanceBlock}>
        <Text style={[styles.balance, { color: palette.primaryText }]}>
          {formatBalanceKrw(account.balance)}
        </Text>

        {palette.showActions ? (
          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onPress?.(account)}
              style={({ pressed }) => [
                styles.actionChip,
                { backgroundColor: palette.chipBackground },
                pressed && styles.chipPressed,
              ]}
            >
              <Text
                style={[styles.actionChipText, { color: palette.chipText }]}
              >
                บัตร
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onTransferPress?.(account)}
              style={({ pressed }) => [
                styles.actionChip,
                { backgroundColor: palette.chipBackground },
                pressed && styles.chipPressed,
              ]}
            >
              <Text
                style={[styles.actionChipText, { color: palette.chipText }]}
              >
                โอนเงิน
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      {/* All fields from mock /accounts response */}
      <View style={[styles.detailsBlock, { borderTopColor: palette.divider }]}>
        <MetaRow
          label="id"
          value={String(account.id)}
          color={palette.primaryText}
          mutedColor={palette.secondaryText}
        />
        <MetaRow
          label="name"
          value={account.name}
          color={palette.primaryText}
          mutedColor={palette.secondaryText}
        />
        <MetaRow
          label="balance"
          value={formatBalanceKrw(account.balance)}
          color={palette.primaryText}
          mutedColor={palette.secondaryText}
        />
        <MetaRow
          label="encrytedAccountNumber"
          value={account.encrytedAccountNumber}
          color={palette.primaryText}
          mutedColor={palette.secondaryText}
        />
        <MetaRow
          label="เลขบัญชี"
          value={
            revealNumber
              ? formatAccountNumber(account.account_number)
              : maskAccountNumber(account.account_number)
          }
          color={palette.primaryText}
          mutedColor={palette.secondaryText}
          trailing={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                revealNumber ? 'ซ่อนเลขบัญชี' : 'แสดงเลขบัญชี'
              }
              hitSlop={spacing.sm}
              onPress={() => setRevealNumber((prev) => !prev)}
              style={({ pressed }) => [
                styles.revealChip,
                { backgroundColor: palette.chipBackground },
                pressed && styles.chipPressed,
              ]}
            >
              <Text
                style={[styles.revealChipText, { color: palette.chipText }]}
              >
                {revealNumber ? 'ซ่อน' : 'ดู'}
              </Text>
            </Pressable>
          }
        />
      </View>
    </Pressable>
  );
}

export const AccountCard = memo(AccountCardComponent);

export function AccountCardSkeleton() {
  return (
    <View style={[styles.card, styles.skeletonCard]}>
      <View style={styles.topRow}>
        <View style={styles.skeletonIcon} />
        <View style={styles.skeletonTitleBlock}>
          <View style={[styles.skeletonBar, styles.skeletonName]} />
        </View>
      </View>
      <View style={[styles.skeletonBar, styles.skeletonBalance]} />
      <View style={styles.detailsBlock}>
        <View style={[styles.skeletonBar, styles.skeletonLine]} />
        <View style={[styles.skeletonBar, styles.skeletonLine]} />
        <View style={[styles.skeletonBar, styles.skeletonLineShort]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    marginBottom: spacing.md,
  },
  cardPressed: {
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
  titleTextWrap: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  accountName: {
    flexShrink: 1,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.medium,
  },
  star: {
    color: colors.star,
    fontSize: typography.size.body,
  },
  moreButton: {
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
  balanceBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  balance: {
    flex: 1,
    fontSize: typography.size.headline,
    fontWeight: typography.weight.bold,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xxs,
  },
  actionChip: {
    minWidth: size.actionChipMinWidth,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  actionChipText: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },
  chipPressed: {
    opacity: pressable.opacity.pressed,
  },
  detailsBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metaLabel: {
    width: 120,
    fontSize: typography.size.micro,
    fontWeight: typography.weight.medium,
  },
  metaValueWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  metaValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: typography.size.body,
    fontWeight: typography.weight.regular,
  },
  revealChip: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  revealChipText: {
    fontSize: typography.size.micro,
    fontWeight: typography.weight.semibold,
  },
  skeletonCard: {
    backgroundColor: colors.surface,
  },
  skeletonIcon: {
    width: size.avatar,
    height: size.avatar,
    borderRadius: radius.full,
    backgroundColor: colors.skeleton.base,
  },
  skeletonTitleBlock: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  skeletonBar: {
    backgroundColor: colors.skeleton.base,
    borderRadius: radius.sm,
  },
  skeletonName: {
    width: '50%',
    height: spacing.lg,
  },
  skeletonBalance: {
    width: '42%',
    height: spacing.xxxl,
    marginBottom: spacing.md,
  },
  skeletonLine: {
    width: '100%',
    height: spacing.md,
  },
  skeletonLineShort: {
    width: '68%',
    height: spacing.md,
  },
});
