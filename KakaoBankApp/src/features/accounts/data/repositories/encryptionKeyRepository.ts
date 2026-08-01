import { doc, getDoc } from 'firebase/firestore';
import { Alert } from 'react-native';

import { getFirestoreDb } from '@/src/core/firebase';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Firestore key management — loads AES secret for account-number decryption.
 * Path: EXPO_PUBLIC_FIRESTORE_SECRET_* env vars.
 */
export async function fetchEncryptionSecretKey(): Promise<string> {
  try {
    const collectionName = requireEnv('EXPO_PUBLIC_FIRESTORE_SECRET_COLLECTION');
    const documentId = requireEnv('EXPO_PUBLIC_FIRESTORE_SECRET_DOCUMENT');
    const fieldName = requireEnv('EXPO_PUBLIC_FIRESTORE_SECRET_FIELD');

    const db = getFirestoreDb();
    const secretRef = doc(db, collectionName, documentId);
    const snapshot = await getDoc(secretRef);

    if (!snapshot.exists()) {
      throw new Error(
        `Secret document not found: ${collectionName}/${documentId}`,
      );
    }

    const data = snapshot.data();
    const secretKey = data?.[fieldName];

    if (typeof secretKey !== 'string' || secretKey.length === 0) {
      throw new Error(
        `Secret field "${fieldName}" is missing or empty on ${collectionName}/${documentId}`,
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
