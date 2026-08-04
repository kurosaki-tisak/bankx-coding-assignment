import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

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

type FeaturedSnapshot = {
  favoriteAccount: Account | null;
  topBalanceAccounts: Account[];
};

/**
 * Accounts ViewModel — favourite + top balances + View All pagination
 * + biometric-gated reveal of featured account numbers.
 *
 * On fetch errors, previous account data is preserved so the UI does not
 * wipe the favourite card or lose the retry affordance mid-failure.
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
  const [revealedAccountNumberIds, setRevealedAccountNumberIds] = useState<
    ReadonlySet<string>
  >(() => new Set());
  const [pendingBiometricAccountId, setPendingBiometricAccountId] = useState<
    string | null
  >(null);

  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);
  const favoriteAccountRef = useRef<Account | null>(null);

  useEffect(() => {
    favoriteAccountRef.current = favoriteAccount;
  }, [favoriteAccount]);

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
      previousFavorite: Account | null,
    ): Promise<Account | null> => {
      if (!favoriteId) {
        return null;
      }

      const fromPool = pool.find((item) => sameId(item.id, favoriteId));
      if (fromPool) {
        return fromPool;
      }

      if (previousFavorite && sameId(previousFavorite.id, favoriteId)) {
        try {
          return (await fetchDecryptedAccountById(favoriteId)) ?? previousFavorite;
        } catch {
          // Keep last known favourite when by-id fetch fails.
          return previousFavorite;
        }
      }

      try {
        return await fetchDecryptedAccountById(favoriteId);
      } catch {
        return previousFavorite;
      }
    },
    [],
  );

  /** Pure fetch — does not mutate React state (commit only on success). */
  const fetchFeaturedSnapshot = useCallback(
    async (
      favoriteId: string | null,
      previousFavorite: Account | null,
    ): Promise<FeaturedSnapshot> => {
      const topPool = await fetchDecryptedTopAccountsByBalance(5);
      const favorite = await resolveFavoriteAccount(
        favoriteId,
        topPool,
        previousFavorite,
      );

      const topExcludingFavorite = topPool
        .filter((item) => (favorite ? !sameId(item.id, favorite.id) : true))
        .slice(0, 2);

      return {
        favoriteAccount: favorite,
        topBalanceAccounts: topExcludingFavorite,
      };
    },
    [resolveFavoriteAccount],
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

      if (mode === 'initial') {
        setIsLoading(true);
      } else if (mode === 'refresh') {
        setIsRefreshing(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        let nextFavoriteId: string | null = null;
        let featured: FeaturedSnapshot | null = null;

        if (mode === 'initial' || mode === 'refresh') {
          nextFavoriteId = await getFavoriteAccountId();
          featured = await fetchFeaturedSnapshot(
            nextFavoriteId,
            favoriteAccountRef.current,
          );
        }

        const { accounts: pageAccounts, totalCount } =
          await fetchDecryptedAccountsPage(targetPage, perPage);

        const nextHasMore =
          totalCount !== null
            ? targetPage * perPage < totalCount
            : pageAccounts.length >= perPage;

        // Commit only after the full load succeeds — keeps prior UI on failure.
        if (featured) {
          setFavoriteIdState(nextFavoriteId);
          setFavoriteAccount(featured.favoriteAccount);
          setTopBalanceAccounts(featured.topBalanceAccounts);
          hideAllFeaturedAccountNumbers();
        }

        setViewAllAccounts((prev) =>
          mode === 'more' ? [...prev, ...pageAccounts] : pageAccounts,
        );
        hasMoreRef.current = nextHasMore;
        setHasMore(nextHasMore);
        pageRef.current = targetPage;
        setPage(targetPage);
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unable to load accounts';
        setError(message);
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [fetchFeaturedSnapshot, hideAllFeaturedAccountNumbers, perPage],
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
      const currentlyFavorite = isFavorite(account.id);
      const nextId = currentlyFavorite ? null : String(account.id);

      try {
        await setFavoriteAccountId(nextId);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'บันทึกบัญชีโปรดไม่สำเร็จ';
        setError(message);
        return;
      }

      // Apply favourite locally first so the star always responds,
      // even when a previous load error left the API unavailable.
      setFavoriteIdState(nextId);
      setFavoriteAccount(nextId ? account : null);
      setTopBalanceAccounts((prev) => {
        const pool = new Map<string, Account>();
        for (const item of [
          ...prev,
          ...(favoriteAccountRef.current ? [favoriteAccountRef.current] : []),
          ...viewAllAccounts,
          account,
        ]) {
          if (nextId && sameId(item.id, nextId)) {
            continue;
          }
          pool.set(String(item.id), item);
        }
        return [...pool.values()]
          .sort((a, b) => b.balance - a.balance)
          .slice(0, 2);
      });
      hideAllFeaturedAccountNumbers();

      // Best-effort sync of featured cards; ignore network failures.
      void fetchFeaturedSnapshot(nextId, nextId ? account : null)
        .then((featured) => {
          setFavoriteAccount(featured.favoriteAccount);
          setTopBalanceAccounts(featured.topBalanceAccounts);
        })
        .catch(() => {
          // Keep the optimistic favourite / top-balance state.
        });
    },
    [
      fetchFeaturedSnapshot,
      hideAllFeaturedAccountNumbers,
      isFavorite,
      viewAllAccounts,
    ],
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
        }
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
