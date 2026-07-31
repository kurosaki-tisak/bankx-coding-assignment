import { NativeModule, registerWebModule } from 'expo';

class AesCryptoModule extends NativeModule<{
  decryptAes128Ecb(ciphertextBase64: string, secretKey: string): string;
}> {
  decryptAes128Ecb(_ciphertextBase64: string, _secretKey: string): string {
    throw new Error('AesCrypto native decryption is not available on web');
  }
}

export default registerWebModule(AesCryptoModule, 'AesCrypto');
