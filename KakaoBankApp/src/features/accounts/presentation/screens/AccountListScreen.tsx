import { useCallback } from 'react';
import { Alert } from 'react-native';

import type { Account } from '../../data/models/account';
import { USER_DISPLAY_NAME } from '../../data/models/accountConfig';
import { AccountList } from '../components/AccountList';
import { useAccountViewModel } from '../hooks/useAccountViewModel';

/**
 * Accounts screen — wires ViewModel → AccountList (View).
 */
export default function AccountListScreen() {
  const {
    favoriteAccount,
    topBalanceAccounts,
    viewAllAccounts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    refresh,
    loadMore,
    toggleFavorite,
    isFavorite,
    getFeaturedAccountNumberLabel,
    isFeaturedAccountNumberRevealed,
    isBiometricPromptPendingFor,
    toggleFeaturedAccountNumberVisibility,
  } = useAccountViewModel();

  const handleAccountPress = useCallback((account: Account) => {
    Alert.alert(
      account.name,
      [
        `id: ${account.id}`,
        `name: ${account.name}`,
        `balance: ₩${account.balance.toLocaleString('en-US')}`,
        `เลขบัญชี: ${account.account_number}`,
        `encrytedAccountNumber: ${account.encrytedAccountNumber}`,
      ].join('\n'),
    );
  }, []);

  const handleTransferPress = useCallback((account: Account) => {
    Alert.alert('โอนเงิน', `กำลังเตรียมโอนไปยังบัญชี ${account.name}`);
  }, []);

  return (
    <AccountList
      favoriteAccount={favoriteAccount}
      topBalanceAccounts={topBalanceAccounts}
      viewAllAccounts={viewAllAccounts}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      isLoadingMore={isLoadingMore}
      onRefresh={refresh}
      onLoadMore={loadMore}
      onRetry={refresh}
      onAccountPress={handleAccountPress}
      onTransferPress={handleTransferPress}
      onToggleFavorite={toggleFavorite}
      isFavorite={isFavorite}
      getFeaturedAccountNumberLabel={getFeaturedAccountNumberLabel}
      isFeaturedAccountNumberRevealed={isFeaturedAccountNumberRevealed}
      isBiometricPromptPendingFor={isBiometricPromptPendingFor}
      onToggleFeaturedAccountNumberVisibility={
        toggleFeaturedAccountNumberVisibility
      }
      userName={USER_DISPLAY_NAME}
      error={error}
    />
  );
}
