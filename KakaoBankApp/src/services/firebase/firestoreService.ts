import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDoc, type Firestore } from 'firebase/firestore';
import { Alert } from 'react-native';

type FirebaseEnvConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Firebase client config — secrets/config must come from EXPO_PUBLIC_* only.
 */
function getFirebaseConfig(): FirebaseEnvConfig {
  return {
    apiKey: requireEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
    authDomain: requireEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: requireEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: requireEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: requireEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: requireEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),
  };
}

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(getFirebaseConfig());
}

export function getFirestoreDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

/**
 * Fetches the AES encryption secret key from Firestore.
 * Collection / document / field names are read from environment variables.
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
