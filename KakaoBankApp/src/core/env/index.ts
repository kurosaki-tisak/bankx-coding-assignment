import Constants from 'expo-constants';

/**
 * Environment helpers — EXPO_PUBLIC_* from:
 * 1) process.env (Metro / expo start)
 * 2) expo-constants extra (baked at prebuild for release APKs)
 */

function readFromExtra(name: string): string | undefined {
  const extra = Constants.expoConfig?.extra as
    | Record<string, unknown>
    | undefined;
  const value = extra?.[name];
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }
  return value.trim();
}

export function getEnv(name: string): string | undefined {
  const fromProcess = process.env[name];
  if (typeof fromProcess === 'string' && fromProcess.trim() !== '') {
    return fromProcess.trim();
  }
  return readFromExtra(name);
}

export function requireEnv(name: string): string {
  const value = getEnv(name);
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `For local runs ensure KakaoBankApp/.env exists (see .env.example). ` +
        `For App Distribution builds set the same key as a GitHub Actions secret and rebuild.`,
    );
  }
  return value;
}

export function getEnvOrDefault(name: string, fallback: string): string {
  return getEnv(name) ?? fallback;
}

/** Firestore path for AES secret — defaults match assignment seed doc. */
export function getFirestoreSecretPath() {
  return {
    collection: getEnvOrDefault(
      'EXPO_PUBLIC_FIRESTORE_SECRET_COLLECTION',
      'secrets',
    ),
    document: getEnvOrDefault(
      'EXPO_PUBLIC_FIRESTORE_SECRET_DOCUMENT',
      'encryption',
    ),
    field: getEnvOrDefault('EXPO_PUBLIC_FIRESTORE_SECRET_FIELD', 'aesKey'),
  };
}
