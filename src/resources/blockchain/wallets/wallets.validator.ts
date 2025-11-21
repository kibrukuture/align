/**
 * Wallet Validation Schemas
 *
 * This file contains Zod schemas for validating wallet-related data:
 * - Wallet address validation (Ethereum-style addresses)
 * - Private key format validation (64 hex characters)
 * - Mnemonic phrase validation (BIP39 standard)
 * - Encryption/decryption input validation
 *
 * Used to ensure data integrity before wallet operations.
 */

import { z } from "zod/v4";
import { isAddress } from "ethers";
import { validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

/**
 * Validates Ethereum-style addresses using ethers.js
 *
 * @param address - The address string to validate
 * @returns true if valid Ethereum address, false otherwise
 */
const isValidEthereumAddress = (address: string): boolean => {
  return isAddress(address);
};

/**
 * Validates private key format (64 hex characters, optionally prefixed with 0x)
 *
 * @param privateKey - The private key string to validate
 * @returns true if valid private key format, false otherwise
 */
const isValidPrivateKey = (privateKey: string): boolean => {
  // Remove 0x prefix if present
  const cleaned = privateKey.startsWith("0x")
    ? privateKey.slice(2)
    : privateKey;
  // Must be exactly 64 hex characters
  return /^[0-9a-fA-F]{64}$/.test(cleaned);
};

/**
 * Validates BIP39 mnemonic phrase using @scure/bip39
 *
 * @param mnemonic - The mnemonic phrase to validate
 * @returns true if valid BIP39 mnemonic, false otherwise
 */
const isValidMnemonic = (mnemonic: string): boolean => {
  try {
    return validateMnemonic(mnemonic, wordlist);
  } catch {
    return false;
  }
};

/**
 * Schema for validating Ethereum-style wallet addresses
 *
 * Uses ethers.js isAddress() function for validation
 *
 * @example
 * ```typescript
 * const address = WalletAddressSchema.parse('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
 * ```
 */
export const WalletAddressSchema = z
  .string()
  .min(1, "Address cannot be empty")
  .refine(isValidEthereumAddress, {
    message: "Invalid Ethereum address format",
  });

/**
 * Schema for validating private keys
 *
 * Validates that the private key is exactly 64 hex characters
 * (optionally prefixed with 0x)
 *
 * @example
 * ```typescript
 * const privateKey = PrivateKeySchema.parse('0x1234...abcd');
 * ```
 */
export const PrivateKeySchema = z
  .string()
  .min(1, "Private key cannot be empty")
  .refine(isValidPrivateKey, {
    message:
      "Invalid private key format. Must be 64 hex characters (optionally prefixed with 0x)",
  });

/**
 * Schema for validating BIP39 mnemonic phrases
 *
 * Uses @scure/bip39 validateMnemonic() function for validation
 * Supports 12 or 24 word mnemonics
 *
 * @example
 * ```typescript
 * const mnemonic = MnemonicSchema.parse('word1 word2 ... word12');
 * ```
 */
export const MnemonicSchema = z
  .string()
  .min(1, "Mnemonic cannot be empty")
  .refine(isValidMnemonic, {
    message:
      "Invalid BIP39 mnemonic phrase. Must be a valid 12 or 24 word mnemonic",
  });

/**
 * Schema for validating encrypted wallet data structure
 *
 * Encrypted data should contain:
 * - encrypted: The encrypted data string
 * - iv: The initialization vector (IV) used for encryption
 *
 * @example
 * ```typescript
 * const encrypted = EncryptedDataSchema.parse({
 *   encrypted: 'encrypted_string_here',
 *   iv: 'iv_string_here'
 * });
 * ```
 */
export const EncryptedDataSchema = z.object({
  encrypted: z.string().min(1, "Encrypted data cannot be empty"),
  iv: z.string().min(1, "Initialization vector (IV) cannot be empty"),
});

/**
 * Schema for validating wallet creation requests
 *
 * Used when creating wallets from mnemonic or private key
 */
export const CreateWalletSchema = z
  .object({
    mnemonic: MnemonicSchema.optional(),
    privateKey: PrivateKeySchema.optional(),
    encrypted: z.string().optional(),
    password: z.string().min(1).optional(),
  })
  .refine(
    (data) =>
      data.mnemonic || data.privateKey || (data.encrypted && data.password),
    {
      message:
        "Must provide either mnemonic, privateKey, or encrypted data with password",
    }
  );

/**
 * Schema for validating encryption/decryption requests
 *
 * Used when encrypting or decrypting wallet data
 */
export const EncryptSchema = z
  .object({
    privateKey: PrivateKeySchema.optional(),
    wallet: z
      .object({
        address: WalletAddressSchema,
        privateKey: PrivateKeySchema,
      })
      .optional(),
    encrypted: z.string().optional(),
    password: z.string().min(1, "Password is required"),
  })
  .refine((data) => data.privateKey || data.wallet || data.encrypted, {
    message: "Must provide either privateKey, wallet object, or encrypted data",
  });
