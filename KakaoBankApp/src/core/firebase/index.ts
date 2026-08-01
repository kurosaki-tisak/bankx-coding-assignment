import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

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

/** Shared Firestore instance for the app. */
export function getFirestoreDb(): Firestore {
  return getFirestore(getFirebaseApp());
}
