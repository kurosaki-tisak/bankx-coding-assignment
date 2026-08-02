/**
 * Explicit Android packageName so RN autolinking generates
 * ReactNativeApplicationEntryPoint.java against the correct BuildConfig.
 */
module.exports = {
  project: {
    android: {
      packageName: 'com.bankx.kakaobankapp',
    },
  },
};
