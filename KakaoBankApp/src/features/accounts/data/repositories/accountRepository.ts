import { decryptAes128Ecb } from '../../native/AesDecryptor';
import {
  fetchAccountById,
  fetchAccountsPage,
  fetchTopAccountsByBalance,
} from '../api/accountApi';
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

function decryptMany(items: AccountApiItem[], secretKey: string): Account[] {
  return items.map((item) => decryptAccountItem(item, secretKey));
}

let cachedSecretKey: string | null = null;

async function resolveSecretKey(): Promise<string> {
  if (cachedSecretKey) {
    return cachedSecretKey;
  }
  cachedSecretKey = await fetchEncryptionSecretKey();
  return cachedSecretKey;
}

async function resolveBaseUrlAndKey(): Promise<{
  baseUrl: string;
  secretKey: string;
}> {
  const [baseUrl, secretKey] = await Promise.all([
    fetchAccountsApiUrl(),
    resolveSecretKey(),
  ]);
  return { baseUrl, secretKey };
}

/**
 * Paginated View All list.
 */
export async function fetchDecryptedAccountsPage(
  page: number,
  perPage: number,
): Promise<DecryptedAccountsPage> {
  const { baseUrl, secretKey } = await resolveBaseUrlAndKey();
  const result: AccountsPageResult = await fetchAccountsPage(
    baseUrl,
    page,
    perPage,
  );

  return {
    accounts: decryptMany(result.items, secretKey),
    totalCount: result.totalCount,
  };
}

/** Top N accounts by balance (for featured cards). */
export async function fetchDecryptedTopAccountsByBalance(
  limit: number,
): Promise<Account[]> {
  const { baseUrl, secretKey } = await resolveBaseUrlAndKey();
  const items = await fetchTopAccountsByBalance(baseUrl, limit);
  return decryptMany(items, secretKey);
}

export async function fetchDecryptedAccountById(
  accountId: string,
): Promise<Account | null> {
  const { baseUrl, secretKey } = await resolveBaseUrlAndKey();
  const item = await fetchAccountById(baseUrl, accountId);
  if (!item) {
    return null;
  }
  return decryptAccountItem(item, secretKey);
}

export function clearEncryptionKeyCache(): void {
  cachedSecretKey = null;
}
