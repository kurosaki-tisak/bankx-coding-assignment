import { decryptAes128Ecb } from '../../native/AesDecryptor';
import { fetchAccountsPage } from '../api/accountApi';
import type { Account, AccountApiItem, AccountsPageResult } from '../models/account';
import { fetchAccountsApiUrl } from './accountsEndpointRepository';
import { fetchEncryptionSecretKey } from './encryptionKeyRepository';

export type DecryptedAccountsPage = {
  accounts: Account[];
  totalCount: number | null;
};

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

let cachedSecretKey: string | null = null;

async function resolveSecretKey(): Promise<string> {
  if (cachedSecretKey) {
    return cachedSecretKey;
  }
  cachedSecretKey = await fetchEncryptionSecretKey();
  return cachedSecretKey;
}

/**
 * Data sync — resolve API URL + AES key from Firestore, fetch page, decrypt.
 */
export async function fetchDecryptedAccountsPage(
  page: number,
  perPage: number,
): Promise<DecryptedAccountsPage> {
  const [baseUrl, secretKey] = await Promise.all([
    fetchAccountsApiUrl(),
    resolveSecretKey(),
  ]);

  const result: AccountsPageResult = await fetchAccountsPage(
    baseUrl,
    page,
    perPage,
  );

  const accounts = result.items.map((item) =>
    decryptAccountItem(item, secretKey),
  );

  return {
    accounts,
    totalCount: result.totalCount,
  };
}

/** Clears cached Firestore AES key (e.g. after logout / key rotation). */
export function clearEncryptionKeyCache(): void {
  cachedSecretKey = null;
}
