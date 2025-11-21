/**
 * Wallet Creation Handler
 *
 * This file contains the complex business logic for creating cryptocurrency wallets.
 * Uses ethers.js to generate wallets from various sources:
 * - Random wallet generation
 * - Mnemonic phrase derivation
 * - Private key import
 * - Encrypted wallet decryption
 *
 * All wallet creation logic is isolated here, separate from validation and orchestration.
 */

import { HDNodeWallet, Wallet } from "ethers";
import type { Wallet as SDKWallet, EncryptedWallet } from "@/resources/blockchain/wallets/wallets.types";
import {
  decryptPrivateKey,
  decryptWallet,
} from "@/resources/blockchain/wallets/handlers/encrypt.handler";

/**
 * Creates a new random cryptocurrency wallet
 *
 * Generates a brand new wallet with a cryptographically secure random private key and mnemonic phrase.
 * This wallet can be used across all EVM-compatible blockchains (Ethereum, Polygon, Base, Arbitrum, etc.)
 * since they all use the same address format.
 *
 * The wallet is generated using ethers.js's `Wallet.createRandom()` which uses the Web Crypto API
 * for secure random number generation.
 *
 * @returns {Promise<SDKWallet>} A promise that resolves to a new wallet object containing:
 *   - `address`: The public wallet address (e.g., "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")
 *   - `privateKey`: The private key used to sign transactions (keep this secret!)
 *   - `mnemonic`: Optional 12-word recovery phrase that can restore the wallet
 *
 * @throws {Error} Rarely throws, but may fail if the system's random number generator is unavailable
 *
 * @example
 * Basic wallet creation
 * ```typescript
 * const wallet = await createWallet();
 * console.log("Address:", wallet.address);
 * console.log("Private Key:", wallet.privateKey);
 * // Output:
 * // Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
 * // Private Key: 0x1234567890abcdef...
 * ```
 *
 * @example
 * Creating a wallet for a new user
 * ```typescript
 * async function createUserWallet(userId: string) {
 *   const wallet = await createWallet();
 *   
 *   // Encrypt before storing in database
 *   const encrypted = await encryptWallet(wallet, userPassword);
 *   
 *   await database.wallets.create({
 *     userId,
 *     address: wallet.address,
 *     encrypted: encrypted.encrypted,
 *     iv: encrypted.iv,
 *     salt: encrypted.salt,
 *   });
 *   
 *   return wallet.address;
 * }
 * ```
 *
 * @see {@link createFromMnemonic} To restore a wallet from a mnemonic phrase
 * @see {@link createFromPrivateKey} To import a wallet from a private key
 * @see {@link encryptWallet} To securely encrypt the wallet before storage
 */
export async function createWallet(): Promise<SDKWallet> {
  // Create random wallet using ethers.js
  const ethersWallet = Wallet.createRandom();

  // Convert to our SDK wallet format
  return {
    address: ethersWallet.address,
    privateKey: ethersWallet.privateKey,
  };
}

/**
 * Recovers a wallet from a BIP39 mnemonic phrase
 *
 * Derives a wallet from a 12 or 24-word mnemonic phrase using the standard BIP44 derivation path
 * (m/44'/60'/0'/0/0). This is useful for importing existing wallets from MetaMask, hardware wallets,
 * or other cryptocurrency applications.
 *
 * The same mnemonic will always generate the same wallet address, making it a reliable way to
 * restore access to funds.
 *
 * @param {string} mnemonic - A valid BIP39 mnemonic phrase (12 or 24 words separated by spaces)
 *   Example: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
 *
 * @returns {Promise<SDKWallet>} A promise that resolves to a wallet object containing:
 *   - `address`: The wallet address derived from the mnemonic
 *   - `privateKey`: The private key derived from the mnemonic
 *   - `mnemonic`: Object containing the phrase and derivation path
 *
 * @throws {Error} If the mnemonic phrase is invalid or doesn't conform to BIP39 standards
 *
 * @example
 * Importing a wallet from MetaMask
 * ```typescript
 * const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
 * const wallet = await createFromMnemonic(mnemonic);
 * 
 * console.log("Address:", wallet.address);
 * console.log("Derivation Path:", wallet.mnemonic?.path);
 * // Output:
 * // Address: 0x9858EfFD232B4033E47d90003D41EC34EcaEda94
 * // Derivation Path: m/44'/60'/0'/0/0
 * ```
 *
 * @example
 * Restoring a user's wallet from backup
 * ```typescript
 * async function restoreWallet(userId: string, mnemonic: string) {
 *   try {
 *     const wallet = await createFromMnemonic(mnemonic);
 *     
 *     // Verify this is the correct wallet
 *     const existingAddress = await database.getWalletAddress(userId);
 *     if (wallet.address !== existingAddress) {
 *       throw new Error("Mnemonic doesn't match the wallet on file");
 *     }
 *     
 *     return wallet;
 *   } catch (error) {
 *     throw new Error("Invalid mnemonic phrase");
 *   }
 * }
 * ```
 *
 * @see {@link createWallet} To generate a new random wallet
 * @see {@link createFromPrivateKey} To import from a private key instead
 */
export async function createFromMnemonic(
  mnemonic: string
): Promise<SDKWallet> {
  // Create wallet from mnemonic using ethers.js
  // HDNodeWallet.fromPhrase() creates a wallet from mnemonic with default path
  const ethersWallet = HDNodeWallet.fromPhrase(mnemonic);

  // Convert to our SDK wallet format
  return {
    address: ethersWallet.address,
    privateKey: ethersWallet.privateKey,
    mnemonic: {
      phrase: mnemonic,
      path: ethersWallet.path || "m/44'/60'/0'/0/0",
    },
  };
}

/**
 * Imports a wallet from an existing private key
 *
 * Creates a wallet object from a 64-character hexadecimal private key. This is useful when you have
 * a private key from another source (like a hardware wallet export, another application, or a backup)
 * and want to use it with this SDK.
 *
 * The private key can be provided with or without the "0x" prefix - both formats are accepted.
 *
 * @param {string} privateKey - A 64-character hexadecimal private key (with or without "0x" prefix)
 *   Example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *   or: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *
 * @returns {Promise<SDKWallet>} A promise that resolves to a wallet object containing:
 *   - `address`: The wallet address derived from the private key
 *   - `privateKey`: The same private key (normalized with "0x" prefix)
 *   - `mnemonic`: undefined (no mnemonic since wallet was created from private key)
 *
 * @throws {Error} If the private key is invalid (wrong length, invalid hex characters, etc.)
 *
 * @example
 * Basic private key import
 * ```typescript
 * const privateKey = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
 * const wallet = await createFromPrivateKey(privateKey);
 * 
 * console.log("Address:", wallet.address);
 * console.log("Private Key:", wallet.privateKey);
 * ```
 *
 * @example
 * Importing from external key management system
 * ```typescript
 * async function importWalletFromKMS(userId: string) {
 *   // Retrieve private key from secure key management system
 *   const privateKey = await kms.getPrivateKey(userId);
 *   
 *   // Create wallet from the private key
 *   const wallet = await createFromPrivateKey(privateKey);
 *   
 *   // Use the wallet to sign transactions
 *   const tx = await sendNativeToken(wallet, recipientAddress, "0.1", "polygon");
 *   
 *   return tx.hash;
 * }
 * ```
 *
 * @example
 * Handling both formats (with and without 0x prefix)
 * ```typescript
 * const key1 = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
 * const key2 = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
 * 
 * const wallet1 = await createFromPrivateKey(key1); // Works
 * const wallet2 = await createFromPrivateKey(key2); // Also works
 * 
 * console.log(wallet1.address === wallet2.address); // true
 * ```
 *
 * @see {@link createWallet} To generate a new random wallet
 * @see {@link createFromMnemonic} To import from a mnemonic phrase instead
 */
export async function createFromPrivateKey(
  privateKey: string
): Promise<SDKWallet> {
  // Normalize private key (ensure 0x prefix)
  const normalizedKey = privateKey.startsWith("0x")
    ? privateKey
    : `0x${privateKey}`;

  // Create wallet from private key using ethers.js
  const ethersWallet = new Wallet(normalizedKey);

  // Convert to our SDK wallet format
  return {
    address: ethersWallet.address,
    privateKey: ethersWallet.privateKey,
  };
}

/**
 * Decrypts and restores a wallet from encrypted data
 *
 * Decrypts an encrypted wallet using the provided password and returns a usable wallet object.
 * This supports two encryption formats:
 * 1. Ethers.js JSON wallet format (standard Ethereum keystore format)
 * 2. Custom SDK EncryptedWallet format (using AES-256-GCM encryption)
 *
 * This is useful for retrieving a user's wallet from secure storage when they need to sign a transaction.
 *
 * @param {string | EncryptedWallet} encrypted - The encrypted wallet data, either as:
 *   - A JSON string (ethers.js format or SDK format)
 *   - An EncryptedWallet object with `encrypted`, `iv`, `salt`, and `address` properties
 *
 * @param {string} password - The password that was used to encrypt the wallet
 *   Must match the password used during encryption, or decryption will fail
 *
 * @returns {Promise<SDKWallet>} A promise that resolves to a decrypted wallet object containing:
 *   - `address`: The wallet address
 *   - `privateKey`: The decrypted private key
 *   - `mnemonic`: The decrypted mnemonic (if it was encrypted)
 *
 * @throws {Error} If:
 *   - The password is incorrect
 *   - The encrypted data is corrupted or invalid
 *   - The encryption format is not recognized
 *
 * @example
 * Decrypting a wallet from database
 * ```typescript
 * // Retrieve encrypted wallet from database
 * const encryptedWallet = await database.wallets.findOne({ userId });
 * 
 * // Decrypt with user's password
 * const wallet = await createFromEncrypted(encryptedWallet, userPassword);
 * 
 * // Now you can use the wallet to sign transactions
 * const tx = await sendNativeToken(wallet, recipientAddress, "0.1", "polygon");
 * 
 * // Clear sensitive data from memory
 * wallet.privateKey = "";
 * ```
 *
 * @example
 * Handling decryption errors
 * ```typescript
 * async function unlockWallet(userId: string, password: string) {
 *   try {
 *     const encrypted = await database.getEncryptedWallet(userId);
 *     const wallet = await createFromEncrypted(encrypted, password);
 *     return { success: true, wallet };
 *   } catch (error) {
 *     if (error.message.includes("password")) {
 *       return { success: false, error: "Incorrect password" };
 *     }
 *     return { success: false, error: "Failed to decrypt wallet" };
 *   }
 * }
 * ```
 *
 * @example
 * Using ethers.js JSON format
 * ```typescript
 * const jsonWallet = '{"address":"0x...","crypto":{...}}';
 * const wallet = await createFromEncrypted(jsonWallet, "password123");
 * console.log("Decrypted address:", wallet.address);
 * ```
 *
 * @see {@link encryptWallet} To encrypt a wallet for secure storage
 * @see {@link decryptWallet} Lower-level decryption function
 */
export async function createFromEncrypted(
  encrypted: string | EncryptedWallet,
  password: string
): Promise<SDKWallet> {
  // Try to parse as JSON (ethers.js encrypted wallet format)
  if (typeof encrypted === "string") {
    try {
      const encryptedJson = JSON.parse(encrypted);
      const ethersWallet = await Wallet.fromEncryptedJson(
        encryptedJson,
        password
      );

      return {
        address: ethersWallet.address,
        privateKey: ethersWallet.privateKey,
      };
    } catch {
      // If not JSON format, try as our custom encrypted format
      // Parse the string as our EncryptedWallet format
      try {
        const encryptedWallet: EncryptedWallet = JSON.parse(encrypted);
        return decryptWallet(encryptedWallet, password);
      } catch {
        throw new Error(
          "Invalid encrypted format. Must be ethers.js JSON format or our EncryptedWallet format."
        );
      }
    }
  } else {
    // Already EncryptedWallet object, use our decrypt handler
    return decryptWallet(encrypted, password);
  }
}
