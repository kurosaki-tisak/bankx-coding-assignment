import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { useAccountViewModel } from '@/src/features/accounts/hooks/useAccountViewModel';
import {
  AccountListPresenter,
  type AccountSortKey,
} from '@/src/features/accounts/presenters/AccountListPresenter';
import type { Account } from '@/src/features/accounts/types/account';

function resolveUserName(): string {
  return process.env.EXPO_PUBLIC_USER_DISPLAY_NAME?.trim() || 'คุณลูกค้า';
}

export default function HomeScreen() {
  const {
    accounts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    refresh,
    loadMore,
  } = useAccountViewModel();

  const [sortKey, setSortKey] = useState<AccountSortKey>('balance_desc');

  const handleAccountPress = useCallback((account: Account) => {
    Alert.alert(
      account.name,
      [
        `id: ${account.id}`,
        `name: ${account.name}`,
        `balance: ${account.balance.toLocaleString('th-TH')} วอน`,
        `เลขบัญชี: ${account.account_number}`,
        `encrytedAccountNumber: ${account.encrytedAccountNumber}`,
      ].join('\n'),
    );
  }, []);

  const handleTransferPress = useCallback((account: Account) => {
    Alert.alert('โอนเงิน', `กำลังเตรียมโอนไปยังบัญชี ${account.name}`);
  }, []);

  return (
    <AccountListPresenter
      accounts={accounts}
      sortKey={sortKey}
      onSortChange={setSortKey}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      isLoadingMore={isLoadingMore}
      onRefresh={refresh}
      onLoadMore={loadMore}
      onRetry={refresh}
      onAccountPress={handleAccountPress}
      onTransferPress={handleTransferPress}
      userName={resolveUserName()}
      error={error}
    />
  );
}
