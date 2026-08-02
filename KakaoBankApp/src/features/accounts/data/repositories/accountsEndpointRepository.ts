import { doc, getDoc } from 'firebase/firestore';
import { Alert } from 'react-native';

import { getFirestoreDb } from '@/src/core/firebase';

import { ACCOUNTS_ENDPOINT_FIRESTORE } from '../models/accountsEndpoint';

let cachedAccountsApiUrl: string | null = null;

/**
 * Loads accounts API base URL from Firestore node secrets/endpoint (field: accounts).
 */
export async function fetchAccountsApiUrl(): Promise<string> {
  if (cachedAccountsApiUrl) {
    return cachedAccountsApiUrl;
  }

  const { collection, document, field } = ACCOUNTS_ENDPOINT_FIRESTORE;

  try {
    const db = getFirestoreDb();
    const endpointRef = doc(db, collection, document);
    const snapshot = await getDoc(endpointRef);

    if (!snapshot.exists()) {
      throw new Error(
        `Accounts endpoint document not found: ${collection}/${document}`,
      );
    }

    const value = snapshot.data()?.[field];

    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(
        `Field "${field}" is missing or empty on ${collection}/${document}`,
      );
    }

    cachedAccountsApiUrl = value.trim();
    return cachedAccountsApiUrl;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to fetch accounts API endpoint';
    Alert.alert('Firestore Error', message);
    throw error;
  }
}

export function clearAccountsApiUrlCache(): void {
  cachedAccountsApiUrl = null;
}
