import { doc, getDoc } from 'firebase/firestore';
import { Alert } from 'react-native';

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
    const message =
      error instanceof Error ? error.message : 'Failed to fetch encryption key';
    Alert.alert('Firestore Error', message);
    throw error;
  }
}
