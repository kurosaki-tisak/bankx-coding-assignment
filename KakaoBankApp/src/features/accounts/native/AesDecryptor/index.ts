import AesCryptoModule from '@/modules/aes-crypto';

/**
 * Native AES-128-ECB decrypt bridge (accounts feature).
 * - iOS: CommonCrypto (CCCrypt, ECB + PKCS7)
 * - Android: javax.crypto (AES/ECB/PKCS5Padding)
 *
 * Ciphertext is Base64. Key may be UTF-8 (16 bytes) or hex (32 chars).
 */
export function decryptAes128Ecb(
  ciphertextBase64: string,
  secretKey: string,
): string {
  if (!ciphertextBase64) {
    throw new Error('Ciphertext is required');
  }
  if (!secretKey) {
    throw new Error('Secret key is required');
  }

  return AesCryptoModule.decryptAes128Ecb(ciphertextBase64, secretKey);
}
