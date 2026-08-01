/**
 * Environment helpers — EXPO_PUBLIC_* with optional development fallbacks.
 */

export function getEnv(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    return undefined;
  }
  return value;
}

export function requireEnv(name: string): string {
  const value = getEnv(name);
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `For local runs copy KakaoBankApp/.env.example → .env. ` +
        `For App Distribution builds set the same key as a GitHub Actions secret.`,
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
