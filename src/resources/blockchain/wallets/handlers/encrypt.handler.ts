/**
 * Wallet Encryption Handler
 *
 * This file contains the complex business logic for encrypting and decrypting wallets.
 * Uses AES-256-GCM encryption with IV (Initialization Vector) for secure storage.
 *
 * Handles:
 * - Private key encryption/decryption
 * - Full wallet object encryption/decryption
 * - IV generation and management
 * - Password-based key derivation
 *
 * All encryption/decryption logic is isolated here.
 * Uses Web Crypto API which is available in both Node.js and Cloudflare Workers.
 */

import type { Wallet as SDKWallet, EncryptedWallet } from "@/resources/blockchain/wallets/wallets.types";

/**
 * Derive encryption key from password using PBKDF2
 *
 * @param password - The password to derive the key from
 * @param salt - The salt for key derivation
 * @returns Promise resolving to the encryption key
 */
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  // Derive key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000, // Industry standard
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Generate random IV (Initialization Vector) for encryption
 *
 * @returns A random 12-byte IV (standard for AES-GCM)
 */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Convert Uint8Array to base64 string
 *
 * @param bytes - The bytes to convert
 * @returns Base64 encoded string
 */
function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    // Node.js environment
    return Buffer.from(bytes).toString("base64");
  } else {
    // Browser/Cloudflare Workers environment
    const binary = String.fromCharCode(...bytes);
    return btoa(binary);
  }
}

/**
 * Convert base64 string to Uint8Array
 *
 * @param base64 - The base64 string to convert
 * @returns Uint8Array of bytes
 */
function base64ToBytes(base64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    // Node.js environment
    return new Uint8Array(Buffer.from(base64, "base64"));
  } else {
    // Browser/Cloudflare Workers environment
    const binary = atob(base64);
    return new Uint8Array(binary.split("").map((char) => char.charCodeAt(0)));
  }
}

/**
 * Encrypt private key with password using AES-256-GCM
 *
 * @param privateKey - The private key to encrypt
 * @param password - The password for encryption
 * @returns Promise resolving to encrypted wallet data
 *
 * @throws {Error} If encryption fails
 *
 * @example
 * ```typescript
 * const encrypted = await encryptPrivateKey('0x1234...abcd', 'password123');
 * console.log(encrypted.encrypted); // Encrypted data
 * console.log(encrypted.iv); // IV needed for decryption
 * ```
 */
export async function encryptPrivateKey(
  privateKey: string,
  password: string
): Promise<EncryptedWallet> {
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = generateIV();

  // Derive encryption key from password
  const key = await deriveKey(password, salt);

  // Encrypt private key
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    new TextEncoder().encode(privateKey)
  );

  // Convert to base64 for storage
  return {
    encrypted: bytesToBase64(new Uint8Array(encryptedData)),
    iv: bytesToBase64(iv),
    salt: bytesToBase64(salt),
    algorithm: "aes-256-gcm",
  };
}

/**
 * Decrypt private key with password
 *
 * @param encrypted - The encrypted wallet data
 * @param password - The password used for encryption
 * @returns Promise resolving to the decrypted private key
 *
 * @throws {Error} If decryption fails or password is incorrect
 *
 * @example
 * ```typescript
 * const privateKey = await decryptPrivateKey(encrypted, 'password123');
 * console.log(privateKey); // "0x1234...abcd"
 * ```
 */
export async function decryptPrivateKey(
  encrypted: EncryptedWallet,
  password: string
): Promise<string> {
  // Convert base64 strings back to Uint8Array
  const encryptedBytes = base64ToBytes(encrypted.encrypted);
  const iv = base64ToBytes(encrypted.iv);
  const salt = encrypted.salt
    ? base64ToBytes(encrypted.salt)
    : crypto.getRandomValues(new Uint8Array(16));

  // Derive encryption key from password
  const key = await deriveKey(password, salt);

  try {
    // Decrypt private key
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encryptedBytes
    );

    // Convert back to string
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    throw new Error("Decryption failed. Incorrect password or corrupted data.");
  }
}

/**
 * Encrypt entire wallet object with password
 *
 * @param wallet - The wallet object to encrypt
 * @param password - The password for encryption
 * @returns Promise resolving to encrypted wallet data
 *
 * @throws {Error} If encryption fails
 *
 * @example
 * ```typescript
 * const encrypted = await encryptWallet(wallet, 'password123');
 * ```
 */
export async function encryptWallet(
  wallet: SDKWallet,
  password: string
): Promise<EncryptedWallet> {
  // Serialize wallet to JSON
  const walletJson = JSON.stringify(wallet);

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = generateIV();

  // Derive encryption key from password
  const key = await deriveKey(password, salt);

  // Encrypt wallet JSON
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    new TextEncoder().encode(walletJson)
  );

  // Convert to base64 for storage
  return {
    encrypted: bytesToBase64(new Uint8Array(encryptedData)),
    iv: bytesToBase64(iv),
    salt: bytesToBase64(salt),
    algorithm: "aes-256-gcm",
  };
}

/**
 * Decrypt wallet object with password
 *
 * @param encrypted - The encrypted wallet data
 * @param password - The password used for encryption
 * @returns Promise resolving to the decrypted wallet object
 *
 * @throws {Error} If decryption fails or password is incorrect
 *
 * @example
 * ```typescript
 * const wallet = await decryptWallet(encrypted, 'password123');
 * ```
 */
export async function decryptWallet(
  encrypted: EncryptedWallet,
  password: string
): Promise<SDKWallet> {
  // Convert base64 strings back to Uint8Array
  const encryptedBytes = base64ToBytes(encrypted.encrypted);
  const iv = base64ToBytes(encrypted.iv);
  const salt = encrypted.salt
    ? base64ToBytes(encrypted.salt)
    : crypto.getRandomValues(new Uint8Array(16));

  // Derive encryption key from password
  const key = await deriveKey(password, salt);

  try {
    // Decrypt wallet JSON
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encryptedBytes
    );

    // Parse JSON back to wallet object
    const walletJson = new TextDecoder().decode(decryptedData);
    return JSON.parse(walletJson) as SDKWallet;
  } catch (error) {
    throw new Error("Decryption failed. Incorrect password or corrupted data.");
  }
}
