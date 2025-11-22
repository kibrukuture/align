/**
 * Wallet Type Definitions
 *
 * This file contains all TypeScript interfaces and types related to wallets:
 * - Wallet object structure
 * - Encrypted wallet data structure
 * - Wallet creation options
 * - Wallet balance information
 *
 * These types ensure type safety across all wallet operations.
 */

import type { HDNodeWallet, Mnemonic } from "ethers";
import type { Network } from "@/resources/blockchain/constants/networks";
export type { Network };

/**
 * Token identifier for supported tokens
 *
 * @example
 * ```typescript
 * const token: Token = 'usdc';
 * ```
 */
export type Token = "usdc" | "usdt" | "eurc";

/**
 * Wallet object containing address and private key
 *
 * This is a simplified wallet interface that can be created from
 * ethers.js Wallet instances or from mnemonic/private key.
 *
 * @example
 * ```typescript
 * const wallet: Wallet = {
 *   address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   privateKey: '0x1234...abcd'
 *  mnemonic: {
 *    phrase: 'word1 word2 ... word12',
 *    path: 'm/44'/60'/0'/0/0',
 *    locale: 'en',
 *    entropy: '0x1234...abcd'
 *  }
 * };
 * ```
 */
export interface Wallet {
  /**
   * The Ethereum address of the wallet (checksummed)
   */
  address: string;

  /**
   * The private key of the wallet (64 hex characters, optionally prefixed with 0x)
   */
  privateKey: string;

  mnemonic?: Mnemonic;
}

/**
 * Encrypted wallet data structure
 *
 * Contains the encrypted private key and the initialization vector (IV)
 * used for encryption. The IV is needed for decryption.
 *
 * @example
 * ```typescript
 * const encrypted: EncryptedWallet = {
 *   encrypted: 'encrypted_data_here',
 *   iv: 'initialization_vector_here'
 * };
 * ```
 */
export interface EncryptedWallet {
  /**
   * The encrypted private key or wallet data
   */
  encrypted: string;

  /**
   * The initialization vector (IV) used for encryption
   * Required for decryption
   */
  iv: string;

  /**
   * Optional salt used for key derivation (if using PBKDF2)
   */
  salt?: string;

  /**
   * Optional algorithm identifier (default: 'aes-256-gcm')
   */
  algorithm?: string;
}

/**
 * Wallet balance information
 *
 * Contains both native token balance and token balances
 *
 * @example
 * ```typescript
 * const balance: WalletBalance = {
 *   address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   native: '1.5',
 *   tokens: {
 *     usdc: '100.0',
 *     usdt: '50.0'
 *   }
 * };
 * ```
 */
export interface WalletBalance {
  /**
   * The wallet address
   */
  address: string;

  /**
   * The native token balance (ETH, MATIC, etc.) as a string
   */
  native: string;

  /**
   * Token balances indexed by token identifier
   */
  tokens: Record<Token, string>;
}

/**
 * Options for creating a wallet
 *
 * @example
 * ```typescript
 * const options: WalletCreationOptions = {
 *   mnemonic: 'word1 word2 ... word12'
 * };
 * ```
 */
export interface WalletCreationOptions {
  /**
   * Optional mnemonic phrase to create wallet from
   */
  mnemonic?: string;

  /**
   * Optional private key to create wallet from
   */
  privateKey?: string;

  /**
   * Optional encrypted wallet data to decrypt
   */
  encrypted?: EncryptedWallet;

  /**
   * Password for decrypting encrypted wallet (required if encrypted is provided)
   */
  password?: string;
}

/**
 * Internal wallet representation using ethers.js types
 *
 * This is used internally by handlers to work with ethers.js Wallet instances
 * while keeping the public API simple with the Wallet interface above.
 */
export interface InternalWallet {
  /**
   * The ethers.js HDNodeWallet instance
   */
  ethersWallet: HDNodeWallet;

  /**
   * The mnemonic if available
   */
  mnemonic?: Mnemonic;
}
