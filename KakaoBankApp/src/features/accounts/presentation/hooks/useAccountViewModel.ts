import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, type AppStateStatus } from 'react-native';

import type { Account } from '../../data/models/account';
import { ACCOUNTS_PER_PAGE } from '../../data/models/accountConfig';
import { resolveAccountNumberLabel } from '../../data/models/accountNumberDisplay';
import { authenticateWithBiometrics } from '../../data/repositories/biometricAuthRepository';
import {
  fetchDecryptedAccountById,
  fetchDecryptedAccountsPage,
  fetchDecryptedTopAccountsByBalance,
} from '../../data/repositories/accountRepository';
import {
  getFavoriteAccountId,
  setFavoriteAccountId,
} from '../../data/repositories/favoriteAccountRepository';

export type UseAccountViewModelResult = {
  favoriteAccount: Account | null;
  topBalanceAccounts: Account[];
  viewAllAccounts: Account[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  page: number;
  perPage: number;
  favoriteAccountId: string | null;
  isBiometricPromptPending: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  toggleFavorite: (account: Account) => Promise<void>;
  isFavorite: (accountId: string | number) => boolean;
  isFeaturedAccountNumberRevealed: (accountId: string | number) => boolean;
  isBiometricPromptPendingFor: (accountId: string | number) => boolean;
  getFeaturedAccountNumberLabel: (account: Account) => string;
  toggleFeaturedAccountNumberVisibility: (account: Account) => Promise<void>;
};

function sameId(a: string | number, b: string | number): boolean {
  return String(a) === String(b);
}

/**
 * Accounts ViewModel — favourite + top balances + View All pagination
 * + biometric-gated reveal of featured account numbers.
 */
export function useAccountViewModel(): UseAccountViewModelResult {
  const perPage = ACCOUNTS_PER_PAGE;

  const [favoriteAccountId, setFavoriteIdState] = useState<string | null>(null);
  const [favoriteAccount, setFavoriteAccount] = useState<Account | null>(null);
  const [topBalanceAccounts, setTopBalanceAccounts] = useState<Account[]>([]);
  const [viewAllAccounts, setViewAllAccounts] = useState<Account[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Account ids whose featured account numbers are currently revealed. */
  const [revealedAccountNumberIds, setRevealedAccountNumberIds] = useState<
    ReadonlySet<string>
  >(() => new Set());
  const [pendingBiometricAccountId, setPendingBiometricAccountId] = useState<
    string | null
  >(null);

  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);

  const hideAllFeaturedAccountNumbers = useCallback(() => {
    setRevealedAccountNumberIds(new Set());
    setPendingBiometricAccountId(null);
  }, []);

  useEffect(() => {
    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState !== 'active') {
        hideAllFeaturedAccountNumbers();
      }
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, [hideAllFeaturedAccountNumbers]);

  const resolveFavoriteAccount = useCallback(
    async (
      favoriteId: string | null,
      pool: Account[],
    ): Promise<Account | null> => {
      if (!favoriteId) {
        return null;
      }
      const fromPool = pool.find((item) => sameId(item.id, favoriteId));
      if (fromPool) {
        return fromPool;
      }
      try {
        return await fetchDecryptedAccountById(favoriteId);
      } catch {
        return null;
      }
    },
    [],
  );

  const loadFeatured = useCallback(
    async (favoriteId: string | null) => {
      const topPool = await fetchDecryptedTopAccountsByBalance(5);
      const favorite = await resolveFavoriteAccount(favoriteId, topPool);

      const topExcludingFavorite = topPool
        .filter((item) => (favorite ? !sameId(item.id, favorite.id) : true))
        .slice(0, 2);

      setFavoriteAccount(favorite);
      setTopBalanceAccounts(topExcludingFavorite);
      hideAllFeaturedAccountNumbers();
    },
    [hideAllFeaturedAccountNumbers, resolveFavoriteAccount],
  );

  const loadPage = useCallback(
    async (targetPage: number, mode: 'initial' | 'refresh' | 'more') => {
      if (isFetchingRef.current) {
        return;
      }
      if (mode === 'more' && !hasMoreRef.current) {
        return;
      }

      isFetchingRef.current = true;
      setError(null);

      if (mode === 'initial') {
        setIsLoading(true);
      } else if (mode === 'refresh') {
        setIsRefreshing(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        if (mode === 'initial' || mode === 'refresh') {
          const favoriteId = await getFavoriteAccountId();
          setFavoriteIdState(favoriteId);
          await loadFeatured(favoriteId);
        }

        const { accounts: pageAccounts, totalCount } =
          await fetchDecryptedAccountsPage(targetPage, perPage);

        setViewAllAccounts((prev) =>
          mode === 'more' ? [...prev, ...pageAccounts] : pageAccounts,
        );

        const nextHasMore =
          totalCount !== null
            ? targetPage * perPage < totalCount
            : pageAccounts.length >= perPage;

        hasMoreRef.current = nextHasMore;
        setHasMore(nextHasMore);
        pageRef.current = targetPage;
        setPage(targetPage);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unable to load accounts';

        if (err instanceof Error && /decrypt/i.test(err.message)) {
          Alert.alert('Decryption Error', message);
        }

        setError(message);
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [loadFeatured, perPage],
  );

  useEffect(() => {
    void loadPage(1, 'initial');
  }, [loadPage]);

  const refresh = useCallback(async () => {
    hasMoreRef.current = true;
    await loadPage(1, 'refresh');
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (!hasMoreRef.current || isFetchingRef.current) {
      return;
    }
    await loadPage(pageRef.current + 1, 'more');
  }, [loadPage]);

  const isFavorite = useCallback(
    (accountId: string | number) =>
      favoriteAccountId !== null && sameId(accountId, favoriteAccountId),
    [favoriteAccountId],
  );

  const toggleFavorite = useCallback(
    async (account: Account) => {
      try {
        const currentlyFavorite = isFavorite(account.id);
        const nextId = currentlyFavorite ? null : String(account.id);
        await setFavoriteAccountId(nextId);
        setFavoriteIdState(nextId);

        if (nextId === null) {
          setFavoriteAccount(null);
        } else {
          setFavoriteAccount(account);
        }

        const topPool = await fetchDecryptedTopAccountsByBalance(5);
        const topExcludingFavorite = topPool
          .filter((item) => (nextId ? !sameId(item.id, nextId) : true))
          .slice(0, 2);
        setTopBalanceAccounts(topExcludingFavorite);
        hideAllFeaturedAccountNumbers();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'บันทึกบัญชีโปรดไม่สำเร็จ';
        Alert.alert('เกิดข้อผิดพลาด', message);
      }
    },
    [hideAllFeaturedAccountNumbers, isFavorite],
  );

  const isFeaturedAccountNumberRevealed = useCallback(
    (accountId: string | number) =>
      revealedAccountNumberIds.has(String(accountId)),
    [revealedAccountNumberIds],
  );

  const isBiometricPromptPendingFor = useCallback(
    (accountId: string | number) =>
      pendingBiometricAccountId !== null &&
      sameId(pendingBiometricAccountId, accountId),
    [pendingBiometricAccountId],
  );

  const getFeaturedAccountNumberLabel = useCallback(
    (account: Account) =>
      resolveAccountNumberLabel(
        account.account_number,
        revealedAccountNumberIds.has(String(account.id)),
      ),
    [revealedAccountNumberIds],
  );

  const toggleFeaturedAccountNumberVisibility = useCallback(
    async (account: Account) => {
      const accountId = String(account.id);

      if (revealedAccountNumberIds.has(accountId)) {
        setRevealedAccountNumberIds((prev) => {
          const next = new Set(prev);
          next.delete(accountId);
          return next;
        });
        return;
      }

      if (pendingBiometricAccountId !== null) {
        return;
      }

      setPendingBiometricAccountId(accountId);
      try {
        const result = await authenticateWithBiometrics(
          'ยืนยันตัวตนด้วยชีวมิติเพื่อดูเลขบัญชี',
        );

        if (result.success) {
          setRevealedAccountNumberIds((prev) => {
            const next = new Set(prev);
            next.add(accountId);
            return next;
          });
          return;
        }

        if (result.reason === 'cancelled') {
          return;
        }

        if (result.reason === 'unavailable') {
          Alert.alert(
            'ไม่สามารถยืนยันตัวตนได้',
            'อุปกรณ์นี้ยังไม่ได้ตั้งค่า Face ID / Touch ID / ลายนิ้วมือ',
          );
          return;
        }

        Alert.alert('ยืนยันตัวตนไม่สำเร็จ', 'กรุณาลองอีกครั้ง');
      } finally {
        setPendingBiometricAccountId(null);
      }
    },
    [pendingBiometricAccountId, revealedAccountNumberIds],
  );

  return {
    favoriteAccount,
    topBalanceAccounts,
    viewAllAccounts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    page,
    perPage,
    favoriteAccountId,
    isBiometricPromptPending: pendingBiometricAccountId !== null,
    refresh,
    loadMore,
    toggleFavorite,
    isFavorite,
    isFeaturedAccountNumberRevealed,
    isBiometricPromptPendingFor,
    getFeaturedAccountNumberLabel,
    toggleFeaturedAccountNumberVisibility,
  };
}
