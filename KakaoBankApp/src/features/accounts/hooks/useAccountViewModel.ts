import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { decryptAes128Ecb } from '@/src/services/crypto/cryptoService';
import { fetchEncryptionSecretKey } from '@/src/services/firebase/firestoreService';

import { fetchAccountsPage } from '../services/accountApi';
import type { Account, AccountApiItem } from '../types/account';

const DEFAULT_PER_PAGE = 10;

function resolvePerPage(): number {
  const raw = process.env.EXPO_PUBLIC_ACCOUNTS_PER_PAGE;
  const parsed = raw ? Number(raw) : DEFAULT_PER_PAGE;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PER_PAGE;
}

function decryptAccountItem(
  item: AccountApiItem,
  secretKey: string,
): Account {
  const decryptedNumber = decryptAes128Ecb(
    item.encrytedAccountNumber,
    secretKey,
  );
  return {
    ...item,
    account_number: decryptedNumber,
  };
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
 * Accounts ViewModel — owns fetch, pagination, and AES decryption.
 * Presenters should consume this hook and render state only.
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

  const secretKeyRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);

  const ensureSecretKey = useCallback(async (): Promise<string> => {
    if (secretKeyRef.current) {
      return secretKeyRef.current;
    }
    const key = await fetchEncryptionSecretKey();
    secretKeyRef.current = key;
    return key;
  }, []);

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
        const secretKey = await ensureSecretKey();
        const { items, totalCount } = await fetchAccountsPage(
          targetPage,
          perPage,
        );

        let decrypted: Account[];
        try {
          decrypted = items.map((item) =>
            decryptAccountItem(item, secretKey),
          );
        } catch (decryptError) {
          const message =
            decryptError instanceof Error
              ? decryptError.message
              : 'Failed to decrypt account number';
          Alert.alert('Decryption Error', message);
          throw decryptError;
        }

        setAccounts((prev) =>
          mode === 'more' ? [...prev, ...decrypted] : decrypted,
        );

        const nextHasMore =
          totalCount !== null
            ? targetPage * perPage < totalCount
            : items.length >= perPage;

        hasMoreRef.current = nextHasMore;
        setHasMore(nextHasMore);
        pageRef.current = targetPage;
        setPage(targetPage);
      } catch (err) {
        // Firestore / accountApi already show Alert.alert on their failures.
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
    [ensureSecretKey, perPage],
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
