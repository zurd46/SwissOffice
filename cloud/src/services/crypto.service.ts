import { env } from '../config/env'

const ALGORITHM = 'AES-GCM'
const IV_LENGTH = 12
const KEY_LENGTH = 256

let cachedKey: CryptoKey | null = null

async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey
  const rawKey = hexToBuffer(env.CREDENTIAL_ENCRYPTION_KEY)
  cachedKey = await crypto.subtle.importKey('raw', rawKey, { name: ALGORITHM, length: KEY_LENGTH }, false, [
    'encrypt',
    'decrypt',
  ])
  return cachedKey
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes.buffer
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function encryptCredentials(plaintext: string): Promise<string> {
  const key = await getKey()
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encoded = new TextEncoder().encode(plaintext)
  const ciphertext = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encoded)
  // Format: hex(iv):hex(ciphertext)
  return `${bufferToHex(iv.buffer)}:${bufferToHex(ciphertext)}`
}

export async function decryptCredentials(encrypted: string): Promise<string> {
  const key = await getKey()
  const [ivHex, ciphertextHex] = encrypted.split(':')
  const iv = new Uint8Array(hexToBuffer(ivHex))
  const ciphertext = hexToBuffer(ciphertextHex)
  const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, ciphertext)
  return new TextDecoder().decode(decrypted)
}
