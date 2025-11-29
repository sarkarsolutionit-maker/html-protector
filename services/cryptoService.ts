// Configuration for strong encryption
const PBKDF2_ITERATIONS = 250000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12; // Standard for GCM
const ALGORITHM_NAME = 'AES-GCM';
const HASH_NAME = 'SHA-256';

/**
 * Derives a cryptographic key from a password and salt using PBKDF2.
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_NAME,
    },
    passwordKey,
    { name: ALGORITHM_NAME, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts file content using AES-GCM.
 * Output Format: [Salt (16B)] [IV (12B)] [Ciphertext]
 */
export async function encryptFileContent(content: ArrayBuffer, password: string): Promise<ArrayBuffer> {
  // 1. Generate random Salt and IV
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // 2. Derive Key
  const key = await deriveKey(password, salt);

  // 3. Encrypt
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM_NAME,
      iv: iv,
    },
    key,
    content
  );

  // 4. Pack the data: Salt + IV + Ciphertext
  const result = new Uint8Array(salt.byteLength + iv.byteLength + ciphertext.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.byteLength);
  result.set(new Uint8Array(ciphertext), salt.byteLength + iv.byteLength);

  return result.buffer;
}

/**
 * Decrypts file content.
 * Expects Input Format: [Salt (16B)] [IV (12B)] [Ciphertext]
 */
export async function decryptFileContent(content: ArrayBuffer, password: string): Promise<ArrayBuffer> {
  try {
    const inputView = new Uint8Array(content);

    // 1. Validate length
    if (inputView.length < SALT_LENGTH + IV_LENGTH) {
      throw new Error("File is too short to be a valid encrypted file.");
    }

    // 2. Extract Salt, IV, and Ciphertext
    const salt = inputView.slice(0, SALT_LENGTH);
    const iv = inputView.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const ciphertext = inputView.slice(SALT_LENGTH + IV_LENGTH);

    // 3. Derive Key
    const key = await deriveKey(password, salt);

    // 4. Decrypt
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: ALGORITHM_NAME,
        iv: iv,
      },
      key,
      ciphertext
    );

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Decryption failed. Incorrect password or corrupted file.");
  }
}