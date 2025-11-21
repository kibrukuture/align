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
 * Encrypts a private key using AES-256-GCM encryption with password-based key derivation
 *
 * Securely encrypts a wallet's private key using industry-standard AES-256-GCM encryption.
 * The password is used to derive an encryption key using PBKDF2 with 100,000 iterations,
 * making brute-force attacks computationally expensive.
 *
 * This function is useful when you only need to encrypt the private key (not the full wallet object).
 * The encrypted data can be safely stored in a database.
 *
 * **Security Features:**
 * - AES-256-GCM authenticated encryption
 * - PBKDF2 key derivation with 100,000 iterations
 * - Random salt and IV for each encryption
 * - Works in Node.js, browsers, and Cloudflare Workers (Web Crypto API)
 *
 * @param {string} privateKey - The private key to encrypt (with or without "0x" prefix)
 *   Example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *
 * @param {string} password - The password used for encryption
 *   Should be strong and memorable. The same password is required for decryption.
 *
 * @returns {Promise<EncryptedWallet>} A promise that resolves to an object containing:
 *   - `encrypted` (string): Base64-encoded encrypted private key
 *   - `iv` (string): Base64-encoded initialization vector (needed for decryption)
 *   - `salt` (string): Base64-encoded salt (needed for decryption)
 *   - `algorithm` (string): "aes-256-gcm" (encryption algorithm used)
 *
 * @throws {Error} If encryption fails (rare, usually due to system crypto unavailability)
 *
 * @example
 * Basic private key encryption
 * ```typescript
 * const privateKey = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
 * const encrypted = await encryptPrivateKey(privateKey, "myStrongPassword123");
 * 
 * console.log("Encrypted:", encrypted.encrypted);
 * console.log("IV:", encrypted.iv);
 * console.log("Salt:", encrypted.salt);
 * 
 * // Store in database
 * await database.keys.create({
 *   userId: "user123",
 *   encrypted: encrypted.encrypted,
 *   iv: encrypted.iv,
 *   salt: encrypted.salt,
 * });
 * ```
 *
 * @example
 * Encrypting before API response
 * ```typescript
 * async function createAndEncryptKey(password: string) {
 *   const wallet = await createWallet();
 *   const encrypted = await encryptPrivateKey(wallet.privateKey, password);
 *   
 *   return {
 *     address: wallet.address,
 *     encryptedKey: encrypted,
 *   };
 * }
 * ```
 *
 * @see {@link decryptPrivateKey} To decrypt the private key
 * @see {@link encryptWallet} To encrypt the entire wallet object (including mnemonic)
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
 * Decrypts a private key that was encrypted with encryptPrivateKey
 *
 * Decrypts an encrypted private key using the password that was used during encryption.
 * Uses AES-256-GCM decryption with PBKDF2 key derivation.
 *
 * The decryption will fail if:
 * - The password is incorrect
 * - The encrypted data has been tampered with or corrupted
 * - The IV or salt is missing or invalid
 *
 * @param {EncryptedWallet} encrypted - The encrypted wallet data object containing:
 *   - `encrypted`: Base64-encoded encrypted private key
 *   - `iv`: Base64-encoded initialization vector
 *   - `salt`: Base64-encoded salt used for key derivation
 *
 * @param {string} password - The password that was used during encryption
 *   Must exactly match the password used in encryptPrivateKey
 *
 * @returns {Promise<string>} A promise that resolves to the decrypted private key
 *   Example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *
 * @throws {Error} With message "Decryption failed. Incorrect password or corrupted data." if:
 *   - The password is wrong
 *   - The encrypted data is corrupted
 *   - The IV or salt is invalid
 *
 * @example
 * Decrypting a private key from database
 * ```typescript
 * // Retrieve encrypted key from database
 * const encryptedData = await database.keys.findOne({ userId: "user123" });
 * 
 * try {
 *   const privateKey = await decryptPrivateKey(encryptedData, userPassword);
 *   console.log("Decrypted private key:", privateKey);
 *   
 *   // Use the private key to create a wallet
 *   const wallet = await createFromPrivateKey(privateKey);
 *   
 *   // Clear from memory after use
 *   privateKey = "";
 * } catch (error) {
 *   console.error("Failed to decrypt:", error.message);
 * }
 * ```
 *
 * @example
 * Handling incorrect password
 * ```typescript
 * async function unlockPrivateKey(userId: string, password: string) {
 *   const encrypted = await database.getEncryptedKey(userId);
 *   
 *   try {
 *     const privateKey = await decryptPrivateKey(encrypted, password);
 *     return { success: true, privateKey };
 *   } catch (error) {
 *     return { success: false, error: "Incorrect password" };
 *   }
 * }
 * ```
 *
 * @see {@link encryptPrivateKey} To encrypt a private key
 * @see {@link decryptWallet} To decrypt a full wallet object
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
 * Encrypts an entire wallet object (including private key and mnemonic) using AES-256-GCM
 *
 * Securely encrypts a complete wallet object, including the private key and mnemonic phrase (if present).
 * This is more comprehensive than encryptPrivateKey as it preserves the entire wallet structure.
 *
 * The wallet is serialized to JSON, then encrypted using AES-256-GCM with PBKDF2 key derivation.
 * This ensures that both the private key and mnemonic are protected with the same strong encryption.
 *
 * **What gets encrypted:**
 * - Private key
 * - Mnemonic phrase (if present)
 * - Derivation path (if present)
 * - Any other wallet metadata
 *
 * **What stays unencrypted:**
 * - Wallet address (safe to store publicly)
 *
 * @param {SDKWallet} wallet - The complete wallet object to encrypt, containing:
 *   - `address`: The wallet address
 *   - `privateKey`: The private key
 *   - `mnemonic`: Optional mnemonic object with phrase and path
 *
 * @param {string} password - The password used for encryption
 *   Should be strong and memorable. Required for decryption.
 *
 * @returns {Promise<EncryptedWallet>} A promise that resolves to an object containing:
 *   - `encrypted` (string): Base64-encoded encrypted wallet JSON
 *   - `iv` (string): Base64-encoded initialization vector
 *   - `salt` (string): Base64-encoded salt
 *   - `algorithm` (string): "aes-256-gcm"
 *
 * @throws {Error} If encryption fails
 *
 * @example
 * Encrypting a wallet for database storage
 * ```typescript
 * const wallet = await createWallet();
 * const encrypted = await encryptWallet(wallet, "userPassword123");
 * 
 * // Store in database
 * await database.wallets.create({
 *   userId: "user123",
 *   address: wallet.address, // Store address unencrypted for lookups
 *   encrypted: encrypted.encrypted,
 *   iv: encrypted.iv,
 *   salt: encrypted.salt,
 *   algorithm: encrypted.algorithm,
 * });
 * 
 * console.log("Wallet encrypted and stored successfully");
 * ```
 *
 * @example
 * Encrypting after wallet creation
 * ```typescript
 * async function createUserWallet(userId: string, password: string) {
 *   // Create new wallet
 *   const wallet = await createWallet();
 *   
 *   // Encrypt before storing
 *   const encrypted = await encryptWallet(wallet, password);
 *   
 *   // Save to database
 *   await database.wallets.insert({
 *     userId,
 *     address: wallet.address,
 *     ...encrypted,
 *     createdAt: new Date(),
 *   });
 *   
 *   return {
 *     address: wallet.address,
 *     mnemonic: wallet.mnemonic, // Return mnemonic once for user to backup
 *   };
 * }
 * ```
 *
 * @example
 * Encrypting imported wallet
 * ```typescript
 * const mnemonic = "abandon abandon abandon...";
 * const wallet = await createFromMnemonic(mnemonic);
 * const encrypted = await encryptWallet(wallet, "securePassword");
 * 
 * // Wallet with mnemonic is now encrypted
 * console.log("Mnemonic encrypted:", encrypted.encrypted.length > 0);
 * ```
 *
 * @see {@link decryptWallet} To decrypt the wallet
 * @see {@link encryptPrivateKey} To encrypt only the private key
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
 * Decrypts a wallet object that was encrypted with encryptWallet
 *
 * Decrypts an encrypted wallet and returns the complete wallet object with private key and mnemonic.
 * This is the counterpart to encryptWallet and restores the full wallet structure.
 *
 * After decryption, you can use the wallet to sign transactions. For security, always clear
 * the decrypted wallet from memory after use.
 *
 * @param {EncryptedWallet} encrypted - The encrypted wallet data object containing:
 *   - `encrypted`: Base64-encoded encrypted wallet JSON
 *   - `iv`: Base64-encoded initialization vector
 *   - `salt`: Base64-encoded salt
 *
 * @param {string} password - The password that was used during encryption
 *   Must exactly match the password used in encryptWallet
 *
 * @returns {Promise<SDKWallet>} A promise that resolves to the decrypted wallet object:
 *   - `address` (string): The wallet address
 *   - `privateKey` (string): The decrypted private key
 *   - `mnemonic` (object | undefined): The decrypted mnemonic (if it was encrypted)
 *
 * @throws {Error} With message "Decryption failed. Incorrect password or corrupted data." if:
 *   - The password is incorrect
 *   - The encrypted data is corrupted or tampered with
 *   - The IV or salt is missing or invalid
 *
 * @example
 * Decrypting wallet for transaction signing
 * ```typescript
 * // User wants to send a transaction
 * const encryptedWallet = await database.wallets.findOne({ userId });
 * 
 * try {
 *   // Decrypt with user's password
 *   const wallet = await decryptWallet(encryptedWallet, userPassword);
 *   
 *   // Sign and send transaction
 *   const tx = await sendNativeToken(
 *     wallet,
 *     recipientAddress,
 *     "0.1",
 *     "polygon"
 *   );
 *   
 *   console.log("Transaction sent:", tx.hash);
 *   
 *   // IMPORTANT: Clear sensitive data from memory
 *   wallet.privateKey = "";
 *   if (wallet.mnemonic) wallet.mnemonic.phrase = "";
 *   
 * } catch (error) {
 *   console.error("Failed to decrypt wallet:", error.message);
 * }
 * ```
 *
 * @example
 * Handling decryption with error recovery
 * ```typescript
 * async function unlockWallet(userId: string, password: string) {
 *   const encrypted = await database.getEncryptedWallet(userId);
 *   
 *   try {
 *     const wallet = await decryptWallet(encrypted, password);
 *     return {
 *       success: true,
 *       address: wallet.address,
 *       wallet, // Return for immediate use
 *     };
 *   } catch (error) {
 *     return {
 *       success: false,
 *       error: "Incorrect password or corrupted wallet data",
 *     };
 *   }
 * }
 * ```
 *
 * @example
 * Decrypting to export mnemonic
 * ```typescript
 * async function exportMnemonic(userId: string, password: string) {
 *   const encrypted = await database.getEncryptedWallet(userId);
 *   const wallet = await decryptWallet(encrypted, password);
 *   
 *   if (!wallet.mnemonic) {
 *     throw new Error("Wallet has no mnemonic (imported from private key)");
 *   }
 *   
 *   return wallet.mnemonic.phrase;
 * }
 * ```
 *
 * @see {@link encryptWallet} To encrypt a wallet
 * @see {@link createFromEncrypted} Higher-level function that handles both formats
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
