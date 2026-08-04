import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { memo, useCallback } from 'react';
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

import type { Account } from '@/src/features/accounts/data/models/account';
import {
  colors,
  layout,
  pressable,
  radius,
  size,
  spacing,
  typography,
} from '@/src/core/theme';

import { AccountListRow } from './AccountListRow';
import { FeaturedAccountCard } from './FeaturedAccountCard';

export type AccountListProps = {
  favoriteAccount: Account | null;
  topBalanceAccounts: Account[];
  viewAllAccounts: Account[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onRetry?: () => void;
  onAccountPress?: (account: Account) => void;
  onTransferPress?: (account: Account) => void;
  onToggleFavorite?: (account: Account) => void;
  isFavorite?: (accountId: string | number) => boolean;
  getFeaturedAccountNumberLabel: (account: Account) => string;
  isFeaturedAccountNumberRevealed: (accountId: string | number) => boolean;
  isBiometricPromptPendingFor?: (accountId: string | number) => boolean;
  onToggleFeaturedAccountNumberVisibility?: (account: Account) => void;
  userName?: string;
  error?: string | null;
};

type ListHeaderProps = {
  userName: string;
  favoriteAccount: Account | null;
  topBalanceAccounts: Account[];
  onAccountPress?: (account: Account) => void;
  onTransferPress?: (account: Account) => void;
  onToggleFavorite?: (account: Account) => void;
  getFeaturedAccountNumberLabel: (account: Account) => string;
  isFeaturedAccountNumberRevealed: (accountId: string | number) => boolean;
  isBiometricPromptPendingFor?: (accountId: string | number) => boolean;
  onToggleFeaturedAccountNumberVisibility?: (account: Account) => void;
};

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorTitle}>เกิดข้อผิดพลาดชั่วคราว</Text>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
        >
          <Text style={styles.retryButtonText}>ลองอีกครั้ง</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const ListHeader = memo(function ListHeader({
  userName,
  favoriteAccount,
  topBalanceAccounts,
  onAccountPress,
  onTransferPress,
  onToggleFavorite,
  getFeaturedAccountNumberLabel,
  isFeaturedAccountNumberRevealed,
  isBiometricPromptPendingFor,
  onToggleFeaturedAccountNumberVisibility,
}: ListHeaderProps) {
  return (
    <View style={styles.headerBlock}>
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
          <MaterialIcons
            name="notifications-none"
            size={size.bell}
            color={colors.icon.active}
          />
          <View style={styles.bellDot} />
        </Pressable>
      </View>

      {favoriteAccount ? (
        <FeaturedAccountCard
          account={favoriteAccount}
          variant="favorite"
          accountNumberLabel={getFeaturedAccountNumberLabel(favoriteAccount)}
          areAccountNumbersRevealed={isFeaturedAccountNumberRevealed(
            favoriteAccount.id,
          )}
          isBiometricPromptPending={isBiometricPromptPendingFor?.(
            favoriteAccount.id,
          )}
          onPress={onAccountPress}
          onTransferPress={onTransferPress}
          onCardPress={onAccountPress}
          onMorePress={onAccountPress}
          onToggleFavorite={onToggleFavorite}
          onToggleAccountNumberVisibility={
            onToggleFeaturedAccountNumberVisibility
          }
        />
      ) : (
        <View style={styles.emptyFavorite}>
          <Text style={styles.emptyFavoriteTitle}>ยังไม่มีบัญชีโปรด</Text>
          <Text style={styles.emptyFavoriteHint}>
            กดไอคอนดาวที่บัญชีในรายการด้านล่างเพื่อปักหมุดไว้ด้านบน
          </Text>
        </View>
      )}

      {topBalanceAccounts[0] ? (
        <FeaturedAccountCard
          account={topBalanceAccounts[0]}
          variant="top1"
          accountNumberLabel={getFeaturedAccountNumberLabel(
            topBalanceAccounts[0],
          )}
          areAccountNumbersRevealed={isFeaturedAccountNumberRevealed(
            topBalanceAccounts[0].id,
          )}
          isBiometricPromptPending={isBiometricPromptPendingFor?.(
            topBalanceAccounts[0].id,
          )}
          onPress={onAccountPress}
          onTransferPress={onTransferPress}
          onMorePress={onAccountPress}
          onToggleFavorite={onToggleFavorite}
          onToggleAccountNumberVisibility={
            onToggleFeaturedAccountNumberVisibility
          }
        />
      ) : null}

      {topBalanceAccounts[1] ? (
        <FeaturedAccountCard
          account={topBalanceAccounts[1]}
          variant="top2"
          accountNumberLabel={getFeaturedAccountNumberLabel(
            topBalanceAccounts[1],
          )}
          areAccountNumbersRevealed={isFeaturedAccountNumberRevealed(
            topBalanceAccounts[1].id,
          )}
          isBiometricPromptPending={isBiometricPromptPendingFor?.(
            topBalanceAccounts[1].id,
          )}
          onPress={onAccountPress}
          onMorePress={onAccountPress}
          onToggleFavorite={onToggleFavorite}
          onToggleAccountNumberVisibility={
            onToggleFeaturedAccountNumberVisibility
          }
        />
      ) : null}

      <View style={styles.viewAllHeader}>
        <Text style={styles.viewAllTitle}>ดูทั้งหมด</Text>
      </View>
    </View>
  );
});

function FeaturedSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonLineShort} />
      <View style={styles.skeletonLine} />
    </View>
  );
}

/**
 * KakaoBank accounts home — favourite + top balances + View All list.
 */
export function AccountList({
  favoriteAccount,
  topBalanceAccounts,
  viewAllAccounts,
  isLoading,
  isRefreshing,
  isLoadingMore,
  onRefresh,
  onLoadMore,
  onRetry,
  onAccountPress,
  onTransferPress,
  onToggleFavorite,
  isFavorite,
  getFeaturedAccountNumberLabel,
  isFeaturedAccountNumberRevealed,
  isBiometricPromptPendingFor,
  onToggleFeaturedAccountNumberVisibility,
  userName = 'คุณลูกค้า',
  error,
}: AccountListProps) {
  const renderItem = useCallback<ListRenderItem<Account>>(
    ({ item, index }) => (
      <View style={styles.viewAllRowWrap}>
        <AccountListRow
          account={item}
          index={index}
          isFavorite={isFavorite?.(item.id) ?? false}
          onPress={onAccountPress}
          onToggleFavorite={onToggleFavorite}
        />
      </View>
    ),
    [isFavorite, onAccountPress, onToggleFavorite],
  );

  const keyExtractor = useCallback((item: Account) => String(item.id), []);

  const listHeader = (
    <ListHeader
      userName={userName}
      favoriteAccount={favoriteAccount}
      topBalanceAccounts={topBalanceAccounts}
      onAccountPress={onAccountPress}
      onTransferPress={onTransferPress}
      onToggleFavorite={onToggleFavorite}
      getFeaturedAccountNumberLabel={getFeaturedAccountNumberLabel}
      isFeaturedAccountNumberRevealed={isFeaturedAccountNumberRevealed}
      isBiometricPromptPendingFor={isBiometricPromptPendingFor}
      onToggleFeaturedAccountNumberVisibility={
        onToggleFeaturedAccountNumberVisibility
      }
    />
  );

  // Keep error + retry visible even while a first load is retrying.
  if (isLoading && viewAllAccounts.length === 0 && !error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.skeletonContainer}>
          <View style={styles.topBar}>
            <View style={styles.skeletonName} />
          </View>
          <FeaturedSkeleton />
          <FeaturedSkeleton />
          <FeaturedSkeleton />
          <Text style={styles.viewAllTitle}>ดูทั้งหมด</Text>
          <FeaturedSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {error ? (
        <View style={styles.errorBannerWrap}>
          <ErrorBanner message={error} onRetry={onRetry} />
        </View>
      ) : null}
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={viewAllAccounts}
        extraData={{ error, favoriteAccount, topBalanceAccounts }}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>ยังไม่มีบัญชีให้แสดง</Text>
            <Text style={styles.emptySubtitle}>
              {error
                ? 'กดปุ่มลองอีกครั้งด้านบนเพื่อโหลดข้อมูลใหม่'
                : 'ดึงลงเพื่อรีเฟรชข้อมูลอีกครั้ง'}
            </Text>
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
        initialNumToRender={10}
        maxToRenderPerBatch={10}
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
    paddingTop: spacing.sm,
  },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  skeletonName: {
    width: '40%',
    height: spacing.xxxl,
    borderRadius: radius.sm,
    backgroundColor: colors.skeleton.base,
    marginBottom: spacing.lg,
  },
  skeletonLine: {
    width: '55%',
    height: spacing.xxl,
    borderRadius: radius.sm,
    backgroundColor: colors.skeleton.base,
  },
  skeletonLineShort: {
    width: '35%',
    height: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: colors.skeleton.base,
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
    marginBottom: spacing.xs,
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
  bellDot: {
    position: 'absolute',
    top: spacing.xxs,
    right: spacing.xxs,
    width: size.badgeDot,
    height: size.badgeDot,
    borderRadius: radius.full,
    backgroundColor: colors.notification,
  },
  emptyFavorite: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  emptyFavoriteTitle: {
    color: colors.text.primary,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.xs,
  },
  emptyFavoriteHint: {
    color: colors.text.secondary,
    fontSize: typography.size.body,
  },
  viewAllHeader: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
  },
  viewAllTitle: {
    color: colors.text.primary,
    fontSize: typography.size.subtitle,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  viewAllRowWrap: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
  },
  errorBannerWrap: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.sm,
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
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.card,
    borderBottomRightRadius: radius.card,
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
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.card,
    borderBottomRightRadius: radius.card,
  },
  footerSpacer: {
    height: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.card,
    borderBottomRightRadius: radius.card,
  },
});
