import { decryptAes128Ecb } from '../../native/AesDecryptor';
import { fetchAccountsPage } from '../api/accountApi';
import type { Account, AccountApiItem, AccountsPageResult } from '../models/account';
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
 * Data sync — fetch a page from json-server and decrypt account numbers.
 */
export async function fetchDecryptedAccountsPage(
  page: number,
  perPage: number,
): Promise<DecryptedAccountsPage> {
  const secretKey = await resolveSecretKey();
  const result: AccountsPageResult = await fetchAccountsPage(page, perPage);

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
