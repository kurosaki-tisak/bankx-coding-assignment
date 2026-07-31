import { NativeModule, requireNativeModule } from 'expo';

declare class AesCryptoModule extends NativeModule<{
  decryptAes128Ecb(ciphertextBase64: string, secretKey: string): string;
}> {
  decryptAes128Ecb(ciphertextBase64: string, secretKey: string): string;
}

export default requireNativeModule<AesCryptoModule>('AesCrypto');
