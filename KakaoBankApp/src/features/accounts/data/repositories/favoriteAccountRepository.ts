import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITE_ACCOUNT_ID_KEY = '@kakaobank/favorite_account_id';

/**
 * Persists the user's favourite account id (local device).
 */
export async function getFavoriteAccountId(): Promise<string | null> {
  try {
    const value = await AsyncStorage.getItem(FAVORITE_ACCOUNT_ID_KEY);
    return value && value.trim() !== '' ? value : null;
  } catch {
    return null;
  }
}

export async function setFavoriteAccountId(
  accountId: string | null,
): Promise<void> {
  try {
    if (accountId === null) {
      await AsyncStorage.removeItem(FAVORITE_ACCOUNT_ID_KEY);
      return;
    }
    await AsyncStorage.setItem(FAVORITE_ACCOUNT_ID_KEY, String(accountId));
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to save favourite account');
  }
}
