import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export type BiometricCapability = {
  isHardwareAvailable: boolean;
  isEnrolled: boolean;
  canAuthenticate: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
};

/**
 * Biometric auth for revealing sensitive account numbers (Face ID / Touch ID / fingerprint).
 */
export async function getBiometricCapability(): Promise<BiometricCapability> {
  if (Platform.OS === 'web') {
    return {
      isHardwareAvailable: false,
      isEnrolled: false,
      canAuthenticate: false,
      supportedTypes: [],
    };
  }

  const [isHardwareAvailable, isEnrolled, supportedTypes] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
  ]);

  return {
    isHardwareAvailable,
    isEnrolled,
    canAuthenticate: isHardwareAvailable && isEnrolled,
    supportedTypes,
  };
}

export type BiometricAuthResult =
  | { success: true }
  | { success: false; reason: 'unavailable' | 'cancelled' | 'failed' };

/**
 * Prompts the user for biometric (or device passcode fallback when allowed).
 */
export async function authenticateWithBiometrics(
  promptMessage = 'ยืนยันตัวตนเพื่อดูเลขบัญชี',
): Promise<BiometricAuthResult> {
  const capability = await getBiometricCapability();

  if (!capability.canAuthenticate) {
    return { success: false, reason: 'unavailable' };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'ยกเลิก',
    disableDeviceFallback: false,
    biometricsSecurityLevel: 'strong',
  });

  if (result.success) {
    return { success: true };
  }

  if (result.error === 'user_cancel' || result.error === 'system_cancel') {
    return { success: false, reason: 'cancelled' };
  }

  return { success: false, reason: 'failed' };
}
