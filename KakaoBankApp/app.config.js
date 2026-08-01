/**
 * Expo config — loads EXPO_PUBLIC_* from environment / .env (via Expo)
 * and embeds them into `extra` so release APKs can read them via expo-constants
 * even when Metro does not inline process.env.
 */
const appJson = require('./app.json');

const PUBLIC_ENV_KEYS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
  'EXPO_PUBLIC_FIRESTORE_SECRET_COLLECTION',
  'EXPO_PUBLIC_FIRESTORE_SECRET_DOCUMENT',
  'EXPO_PUBLIC_FIRESTORE_SECRET_FIELD',
  'EXPO_PUBLIC_ACCOUNTS_API_URL',
];

function readPublicEnv() {
  /** @type {Record<string, string>} */
  const extra = {};
  for (const key of PUBLIC_ENV_KEYS) {
    const value = process.env[key];
    if (typeof value === 'string' && value.trim() !== '') {
      extra[key] = value.trim();
    }
  }
  return extra;
}

module.exports = () => {
  const publicEnv = readPublicEnv();

  return {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra ?? {}),
      ...publicEnv,
    },
  };
};
