import CommonCrypto
import ExpoModulesCore
import Foundation

internal final class AesCryptoException: Exception {
  private let message: String

  init(_ message: String) {
    self.message = message
    super.init()
  }

  override var reason: String {
    message
  }
}

public class AesCryptoModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AesCrypto")

    /// Decrypts Base64 ciphertext with AES-128-ECB (PKCS7) using iOS CommonCrypto.
    Function("decryptAes128Ecb") { (ciphertextBase64: String, secretKey: String) -> String in
      try Self.decrypt(ciphertextBase64: ciphertextBase64, secretKey: secretKey)
    }
  }

  private static func decrypt(ciphertextBase64: String, secretKey: String) throws -> String {
    guard !ciphertextBase64.isEmpty else {
      throw AesCryptoException("Ciphertext is required")
    }
    guard let cipherData = Data(base64Encoded: ciphertextBase64) else {
      throw AesCryptoException("Ciphertext must be valid Base64")
    }

    let keyData = try makeAes128Key(from: secretKey)
    let plainData = try crypt(data: cipherData, key: keyData)
    guard let plainText = String(data: plainData, encoding: .utf8) else {
      throw AesCryptoException("Decrypted payload is not valid UTF-8")
    }
    return plainText
  }

  private static func makeAes128Key(from secretKey: String) throws -> Data {
    let trimmed = secretKey.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else {
      throw AesCryptoException("Secret key is required")
    }

    let isHex = trimmed.count == 32 && trimmed.range(
      of: "^[0-9a-fA-F]+$",
      options: .regularExpression
    ) != nil

    if isHex {
      var bytes = [UInt8]()
      bytes.reserveCapacity(16)
      var index = trimmed.startIndex
      while index < trimmed.endIndex {
        let next = trimmed.index(index, offsetBy: 2)
        let byteString = trimmed[index..<next]
        guard let byte = UInt8(byteString, radix: 16) else {
          throw AesCryptoException("Hex AES key is invalid")
        }
        bytes.append(byte)
        index = next
      }
      guard bytes.count == kCCKeySizeAES128 else {
        throw AesCryptoException("Hex AES key must decode to exactly 16 bytes")
      }
      return Data(bytes)
    }

    guard let utf8Key = trimmed.data(using: .utf8) else {
      throw AesCryptoException("Secret key must be UTF-8")
    }
    guard utf8Key.count == kCCKeySizeAES128 else {
      throw AesCryptoException(
        "AES-128 key must be exactly 16 bytes (got \(utf8Key.count))"
      )
    }
    return utf8Key
  }

  private static func crypt(data: Data, key: Data) throws -> Data {
    let bufferSize = data.count + kCCBlockSizeAES128
    var outBytes = [UInt8](repeating: 0, count: bufferSize)
    var outLength: size_t = 0

    let status = key.withUnsafeBytes { keyBytes in
      data.withUnsafeBytes { dataBytes in
        CCCrypt(
          CCOperation(kCCDecrypt),
          CCAlgorithm(kCCAlgorithmAES),
          CCOptions(kCCOptionECBMode | kCCOptionPKCS7Padding),
          keyBytes.baseAddress,
          key.count,
          nil,
          dataBytes.baseAddress,
          data.count,
          &outBytes,
          bufferSize,
          &outLength
        )
      }
    }

    guard status == kCCSuccess else {
      throw AesCryptoException("AES decrypt failed with status \(status)")
    }

    return Data(bytes: outBytes, count: outLength)
  }
}
