import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/** SecureStore key — iOS Keychain / Android EncryptedSharedPreferences */
const FAVORITE_ACCOUNT_SECURE_KEY = 'kakaobank_favorite_account_id';

/** Legacy unencrypted AsyncStorage key — migrated once then removed */
const FAVORITE_ACCOUNT_LEGACY_KEY = '@kakaobank/favorite_account_id';

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  // Only accessible while the device is unlocked
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
};

/** Web has no hardware-backed store — keep in process memory only (never disk). */
let webSessionFavoriteId: string | null = null;

function isSecureStoreAvailable(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

async function migrateLegacyFavoriteIfNeeded(): Promise<string | null> {
  try {
    const legacy = await AsyncStorage.getItem(FAVORITE_ACCOUNT_LEGACY_KEY);
    if (!legacy || legacy.trim() === '') {
      return null;
    }

    const value = legacy.trim();

    if (isSecureStoreAvailable()) {
      await SecureStore.setItemAsync(
        FAVORITE_ACCOUNT_SECURE_KEY,
        value,
        SECURE_STORE_OPTIONS,
      );
    } else {
      webSessionFavoriteId = value;
    }

    await AsyncStorage.removeItem(FAVORITE_ACCOUNT_LEGACY_KEY);
    return value;
  } catch {
    return null;
  }
}

/**
 * Reads favourite account id from encrypted secure storage
 * (iOS Keychain / Android Keystore-backed EncryptedSharedPreferences).
 */
export async function getFavoriteAccountId(): Promise<string | null> {
  try {
    if (!isSecureStoreAvailable()) {
      if (webSessionFavoriteId) {
        return webSessionFavoriteId;
      }
      return migrateLegacyFavoriteIfNeeded();
    }

    const secureValue = await SecureStore.getItemAsync(
      FAVORITE_ACCOUNT_SECURE_KEY,
      SECURE_STORE_OPTIONS,
    );
    if (secureValue && secureValue.trim() !== '') {
      return secureValue.trim();
    }

    return migrateLegacyFavoriteIfNeeded();
  } catch {
    return null;
  }
}

/**
 * Persists favourite account id in encrypted secure storage.
 * Pass `null` to clear. Never writes plaintext ids to AsyncStorage.
 */
export async function setFavoriteAccountId(
  accountId: string | null,
): Promise<void> {
  try {
    // Remove any leftover plaintext copy from older app versions.
    await AsyncStorage.removeItem(FAVORITE_ACCOUNT_LEGACY_KEY).catch(() => {
      // ignore cleanup failures
    });

    if (!isSecureStoreAvailable()) {
      webSessionFavoriteId = accountId === null ? null : String(accountId);
      return;
    }

    if (accountId === null) {
      await SecureStore.deleteItemAsync(
        FAVORITE_ACCOUNT_SECURE_KEY,
        SECURE_STORE_OPTIONS,
      );
      return;
    }

    await SecureStore.setItemAsync(
      FAVORITE_ACCOUNT_SECURE_KEY,
      String(accountId),
      SECURE_STORE_OPTIONS,
    );
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to securely save favourite account');
  }
}
