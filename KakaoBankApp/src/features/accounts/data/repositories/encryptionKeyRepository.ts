import { doc, getDoc } from 'firebase/firestore';

import { getFirestoreSecretPath } from '@/src/core/env';
import { getFirestoreDb } from '@/src/core/firebase';

/**
 * Firestore key management — loads AES secret for account-number decryption.
 * Path from EXPO_PUBLIC_FIRESTORE_SECRET_* with safe defaults for local/dev.
 */
export async function fetchEncryptionSecretKey(): Promise<string> {
  try {
    const { collection, document, field } = getFirestoreSecretPath();

    const db = getFirestoreDb();
    const secretRef = doc(db, collection, document);
    const snapshot = await getDoc(secretRef);

    if (!snapshot.exists()) {
      throw new Error(
        `Secret document not found: ${collection}/${document}`,
      );
    }

    const data = snapshot.data();
    const secretKey = data?.[field];

    if (typeof secretKey !== 'string' || secretKey.length === 0) {
      throw new Error(
        `Secret field "${field}" is missing or empty on ${collection}/${document}`,
      );
    }

    return secretKey;
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch encryption key');
  }
}
