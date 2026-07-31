import { memo, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AccountCard,
  AccountCardSkeleton,
} from '@/src/components/accounts/AccountCard';
import type { Account } from '@/src/features/accounts/types/account';
import {
  colors,
  layout,
  pressable,
  radius,
  size,
  spacing,
  typography,
} from '@/src/theme';

export type AccountSortKey =
  | 'balance_desc'
  | 'balance_asc'
  | 'name_asc'
  | 'name_desc'
  | 'id_asc'
  | 'id_desc';

export type AccountListPresenterProps = {
  accounts: Account[];
  sortKey: AccountSortKey;
  onSortChange: (key: AccountSortKey) => void;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onRetry?: () => void;
  onAccountPress?: (account: Account) => void;
  onTransferPress?: (account: Account) => void;
  userName?: string;
  error?: string | null;
};

const SORT_OPTIONS: { key: AccountSortKey; label: string }[] = [
  { key: 'balance_desc', label: 'ยอดสูง → ต่ำ' },
  { key: 'balance_asc', label: 'ยอดต่ำ → สูง' },
  { key: 'name_asc', label: 'ชื่อ A-Z' },
  { key: 'id_asc', label: 'รหัส ↑' },
];

function toId(value: string | number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function sortAccounts(
  accounts: Account[],
  sortKey: AccountSortKey,
): Account[] {
  const sorted = [...accounts];

  switch (sortKey) {
    case 'balance_asc':
      return sorted.sort((a, b) => a.balance - b.balance);
    case 'balance_desc':
      return sorted.sort((a, b) => b.balance - a.balance);
    case 'name_asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'th'));
    case 'name_desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name, 'th'));
    case 'id_asc':
      return sorted.sort((a, b) => toId(a.id) - toId(b.id));
    case 'id_desc':
      return sorted.sort((a, b) => toId(b.id) - toId(a.id));
    default:
      return sorted;
  }
}

type ListHeaderProps = {
  userName: string;
  sortKey: AccountSortKey;
  onSortChange: (key: AccountSortKey) => void;
  error?: string | null;
  onRetry?: () => void;
};

const ListHeader = memo(function ListHeader({
  userName,
  sortKey,
  onSortChange,
  error,
  onRetry,
}: ListHeaderProps) {
  return (
    <View style={styles.headerBlock}>
      {/* Top bar — ชื่อ + บัญชีของฉัน + กระดิ่ง */}
      <View style={styles.topBar}>
        <View style={styles.userRow}>
          <Text style={styles.userName} numberOfLines={1}>
            {userName}
          </Text>
          <View style={styles.myAccountChip}>
            <Text style={styles.myAccountChipText}>บัญชีของฉัน</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="การแจ้งเตือน"
          style={({ pressed }) => [
            styles.bellWrap,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.bellIcon}>🔔</Text>
          <View style={styles.bellDot} />
        </Pressable>
      </View>

      {/* Promo banner — flat white card */}
      <View style={styles.promoCard}>
        <View style={styles.promoTextWrap}>
          <Text style={styles.promoLine}>แยกขยะรีไซเคิล</Text>
          <Text style={styles.promoLine}>แล้วรับพอยต์ได้เลย</Text>
        </View>
        <View style={styles.promoMascot}>
          <Text style={styles.promoMascotText}>🐱🐰</Text>
        </View>
        <View style={styles.promoDots} pointerEvents="none">
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* Compact sort — functional, visually quiet */}
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((option) => {
          const selected = option.key === sortKey;
          return (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              onPress={() => onSortChange(option.key)}
              style={({ pressed }) => [
                styles.sortChip,
                selected && styles.sortChipSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.sortChipText,
                  selected && styles.sortChipTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorTitle}>เกิดข้อผิดพลาดชั่วคราว</Text>
          <Text style={styles.errorText}>{error}</Text>
          {onRetry ? (
            <Pressable
              accessibilityRole="button"
              onPress={onRetry}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.retryButtonText}>ลองอีกครั้ง</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});

/**
 * KakaoBank home Presenter — props-only UI matching screenshot UX.
 */
export function AccountListPresenter({
  accounts,
  sortKey,
  onSortChange,
  isLoading,
  isRefreshing,
  isLoadingMore,
  onRefresh,
  onLoadMore,
  onRetry,
  onAccountPress,
  onTransferPress,
  userName = 'คุณลูกค้า',
  error,
}: AccountListPresenterProps) {
  const sortedAccounts = useMemo(
    () => sortAccounts(accounts, sortKey),
    [accounts, sortKey],
  );

  const renderItem = useCallback<ListRenderItem<Account>>(
    ({ item, index }) => (
      <AccountCard
        account={item}
        index={index}
        onPress={onAccountPress}
        onTransferPress={onTransferPress}
        onMorePress={onAccountPress}
      />
    ),
    [onAccountPress, onTransferPress],
  );

  const keyExtractor = useCallback((item: Account) => String(item.id), []);

  const listHeader = (
    <ListHeader
      userName={userName}
      sortKey={sortKey}
      onSortChange={onSortChange}
      error={error}
      onRetry={onRetry}
    />
  );

  if (isLoading && accounts.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.skeletonContainer}>
          {listHeader}
          <AccountCardSkeleton />
          <AccountCardSkeleton />
          <AccountCardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={sortedAccounts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>ยังไม่มีบัญชีให้แสดง</Text>
            <Text style={styles.emptySubtitle}>
              ดึงลงเพื่อรีเฟรชข้อมูลอีกครั้ง
            </Text>
            {onRetry ? (
              <Pressable
                accessibilityRole="button"
                onPress={onRetry}
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.retryButtonText}>โหลดอีกครั้ง</Text>
              </Pressable>
            ) : null}
          </View>
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={colors.text.primary} />
            </View>
          ) : (
            <View style={styles.footerSpacer} />
          )
        }
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.35}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={7}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingX,
  },
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPaddingX,
    paddingBottom: spacing.massive,
  },
  headerBlock: {
    paddingTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  userRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  userName: {
    color: colors.text.primary,
    fontSize: typography.size.headline,
    fontWeight: typography.weight.bold,
  },
  myAccountChip: {
    backgroundColor: colors.chip.background,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  myAccountChipText: {
    color: colors.chip.text,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },
  bellWrap: {
    width: size.bell,
    height: size.bell,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: typography.size.title,
  },
  bellDot: {
    position: 'absolute',
    top: spacing.xxs,
    right: spacing.xxs,
    width: size.badgeDot,
    height: size.badgeDot,
    borderRadius: radius.full,
    backgroundColor: colors.notification,
  },
  promoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    minHeight: size.promoMinHeight,
    justifyContent: 'center',
  },
  promoTextWrap: {
    maxWidth: '68%',
  },
  promoLine: {
    color: colors.text.primary,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.bodyLarge * typography.lineHeight.relaxed,
  },
  promoMascot: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.md,
  },
  promoMascotText: {
    fontSize: typography.size.hero,
  },
  promoDots: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: spacing.xs + spacing.xxs,
    height: spacing.xs + spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.border.default,
  },
  dotActive: {
    backgroundColor: colors.text.primary,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sortChip: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sortChipSelected: {
    backgroundColor: colors.accent,
  },
  sortChipText: {
    color: colors.text.secondary,
    fontSize: typography.size.micro,
    fontWeight: typography.weight.medium,
  },
  sortChipTextSelected: {
    color: colors.text.onAccent,
    fontWeight: typography.weight.semibold,
  },
  errorBanner: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.semantic.error,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  errorTitle: {
    color: colors.semantic.error,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.xs,
  },
  errorText: {
    color: colors.text.secondary,
    fontSize: typography.size.body,
    marginBottom: spacing.md,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryButtonText: {
    color: colors.text.onAccent,
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
  },
  pressed: {
    opacity: pressable.opacity.pressed,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.massive,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.text.primary,
    fontSize: typography.size.subtitle,
    fontWeight: typography.weight.semibold,
  },
  emptySubtitle: {
    color: colors.text.tertiary,
    fontSize: typography.size.body,
    marginBottom: spacing.md,
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  footerSpacer: {
    height: spacing.xl,
  },
});
