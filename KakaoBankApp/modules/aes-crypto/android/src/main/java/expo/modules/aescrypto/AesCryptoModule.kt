package expo.modules.aescrypto

import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.util.Base64
import javax.crypto.Cipher
import javax.crypto.spec.SecretKeySpec

class AesCryptoException(message: String) : CodedException(message)

class AesCryptoModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AesCrypto")

    // Decrypts Base64 ciphertext with AES-128-ECB (PKCS5/PKCS7) using Android javax.crypto.
    Function("decryptAes128Ecb") { ciphertextBase64: String, secretKey: String ->
      decryptAes128Ecb(ciphertextBase64, secretKey)
    }
  }

  private fun decryptAes128Ecb(ciphertextBase64: String, secretKey: String): String {
    if (ciphertextBase64.isEmpty()) {
      throw AesCryptoException("Ciphertext is required")
    }

    val cipherBytes = try {
      Base64.decode(ciphertextBase64, Base64.DEFAULT)
    } catch (error: IllegalArgumentException) {
      throw AesCryptoException("Ciphertext must be valid Base64")
    }

    val keyBytes = makeAes128Key(secretKey)

    return try {
      val cipher = Cipher.getInstance("AES/ECB/PKCS5Padding")
      cipher.init(Cipher.DECRYPT_MODE, SecretKeySpec(keyBytes, "AES"))
      val plainBytes = cipher.doFinal(cipherBytes)
      String(plainBytes, Charsets.UTF_8)
    } catch (error: Exception) {
      throw AesCryptoException(error.message ?: "AES decrypt failed")
    }
  }

  private fun makeAes128Key(secretKey: String): ByteArray {
    val trimmed = secretKey.trim()
    if (trimmed.isEmpty()) {
      throw AesCryptoException("Secret key is required")
    }

    val isHex = trimmed.length == 32 && trimmed.matches(Regex("^[0-9a-fA-F]+$"))
    if (isHex) {
      val bytes = ByteArray(16)
      for (i in 0 until 16) {
        val index = i * 2
        bytes[i] = trimmed.substring(index, index + 2).toInt(16).toByte()
      }
      return bytes
    }

    val utf8Key = trimmed.toByteArray(Charsets.UTF_8)
    if (utf8Key.size != 16) {
      throw AesCryptoException(
        "AES-128 key must be exactly 16 bytes (got ${utf8Key.size})"
      )
    }
    return utf8Key
  }
}
