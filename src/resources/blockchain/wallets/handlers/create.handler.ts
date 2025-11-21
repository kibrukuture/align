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
 * Create a new random wallet
 *
 * Generates a new wallet with a random private key using cryptographically secure
 * random number generation.
 *
 * @returns Promise resolving to a new wallet object
 *
 * @example
 * ```typescript
 * const wallet = await createWallet();
 * console.log(wallet.address); // "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 * ```
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
 * Create wallet from mnemonic phrase
 *
 * Derives a wallet from a BIP39 mnemonic phrase using the default derivation path.
 *
 * @param mnemonic - The BIP39 mnemonic phrase (12 or 24 words)
 * @returns Promise resolving to a wallet object with mnemonic information
 *
 * @throws {Error} If the mnemonic phrase is invalid
 *
 * @example
 * ```typescript
 * const wallet = await createFromMnemonic('word1 word2 ... word12');
 * console.log(wallet.mnemonic?.phrase); // The mnemonic phrase
 * ```
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
 * Create wallet from private key
 *
 * Creates a wallet from an existing private key.
 *
 * @param privateKey - The private key (64 hex characters, optionally prefixed with 0x)
 * @returns Promise resolving to a wallet object
 *
 * @throws {Error} If the private key is invalid
 *
 * @example
 * ```typescript
 * const wallet = await createFromPrivateKey('0x1234...abcd');
 * console.log(wallet.address);
 * ```
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
 * Create wallet from encrypted data
 *
 * Decrypts an encrypted wallet and creates a wallet object from it.
 * This function will be implemented after the encryption handler is complete.
 *
 * @param encrypted - The encrypted wallet data
 * @param password - The password used for encryption
 * @returns Promise resolving to a wallet object
 *
 * @throws {Error} If decryption fails or password is incorrect
 *
 * @example
 * ```typescript
 * const wallet = await createFromEncrypted(encryptedData, 'password123');
 * ```
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
