import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { fetchDecryptedAccountsPage } from '../../data/repositories/accountRepository';
import type { Account } from '../../data/models/account';

const DEFAULT_PER_PAGE = 10;

function resolvePerPage(): number {
  const raw = process.env.EXPO_PUBLIC_ACCOUNTS_PER_PAGE;
  const parsed = raw ? Number(raw) : DEFAULT_PER_PAGE;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PER_PAGE;
}

export type UseAccountViewModelResult = {
  accounts: Account[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  page: number;
  perPage: number;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
};

/**
 * Accounts ViewModel — pagination UI state; data sync via AccountRepository.
 */
export function useAccountViewModel(): UseAccountViewModelResult {
  const perPage = resolvePerPage();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);

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
        const { accounts: pageAccounts, totalCount } =
          await fetchDecryptedAccountsPage(targetPage, perPage);

        setAccounts((prev) =>
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

        if (
          err instanceof Error &&
          /decrypt/i.test(err.message)
        ) {
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
    [perPage],
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

  return {
    accounts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    page,
    perPage,
    refresh,
    loadMore,
  };
}
