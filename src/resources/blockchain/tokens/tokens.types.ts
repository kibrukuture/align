/**
 * Token Type Definitions
 *
 * This file contains all TypeScript interfaces and types related to tokens:
 * - Token identifiers (USDC, USDT, etc.)
 * - Token balance information
 * - Token metadata structure
 * - Token address mappings
 *
 * These types ensure type safety across all token operations.
 */

import type { Network } from "@/resources/blockchain/constants/networks";
import type { Token } from "@/resources/blockchain/wallets/wallets.types";

/**
 * Token balance information
 *
 * Contains the balance for a specific token
 *
 * @example
 * ```typescript
 * const balance: TokenBalance = {
 *   token: 'usdc',
 *   address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
 *   balance: '1000000',
 *   balanceFormatted: '100.0',
 *   decimals: 6,
 *   network: 'polygon'
 * };
 * ```
 */
export interface TokenBalance {
  /**
   * Token identifier
   */
  token: Token;

  /**
   * Token contract address
   */
  address: string;

  /**
   * Raw balance (without decimals, as string to handle large numbers)
   */
  balance: string;

  /**
   * Formatted balance (with decimals applied, human-readable)
   */
  balanceFormatted: string;

  /**
   * Number of decimals for the token
   */
  decimals: number;

  /**
   * Network where the token is located
   */
  network: Network;
}

/**
 * Token information/metadata
 *
 * Contains token name, symbol, decimals, and contract address
 *
 * @example
 * ```typescript
 * const info: TokenInfo = {
 *   token: 'usdc',
 *   name: 'USD Coin',
 *   symbol: 'USDC',
 *   decimals: 6,
 *   address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
 *   network: 'polygon'
 * };
 * ```
 */
export interface TokenInfo {
  /**
   * Token identifier
   */
  token: Token;

  /**
   * Full token name
   */
  name: string;

  /**
   * Token symbol (e.g., USDC, USDT)
   */
  symbol: string;

  /**
   * Number of decimals
   */
  decimals: number;

  /**
   * Token contract address
   */
  address: string;

  /**
   * Network where the token is located
   */
  network: Network;
}

/**
 * Token address mapping
 *
 * Maps token identifiers to their contract addresses per network
 *
 * @example
 * ```typescript
 * const addresses: TokenAddressMap = {
 *   polygon: {
 *     usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
 *     usdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
 *   }
 * };
 * ```
 */
export type TokenAddressMap = Record<Network, Record<Token, string>>;

/**
 * Token balance request parameters
 *
 * @example
 * ```typescript
 * const request: TokenBalanceRequest = {
 *   address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   token: 'usdc',
 *   network: 'polygon'
 * };
 * ```
 */
export interface TokenBalanceRequest {
  /**
   * Wallet address to check balance for
   */
  address: string;

  /**
   * Token identifier
   */
  token: Token;

  /**
   * Network where the token is located
   */
  network: Network;
}

/**
 * Token address lookup request
 *
 * @example
 * ```typescript
 * const request: TokenAddressRequest = {
 *   token: 'usdc',
 *   network: 'polygon'
 * };
 * ```
 */
export interface TokenAddressRequest {
  /**
   * Token identifier
   */
  token: Token;

  /**
   * Network where the token is located
   */
  network: Network;
}

/**
 * Token formatting request
 *
 * @example
 * ```typescript
 * const request: TokenFormatRequest = {
 *   amount: '1000000',
 *   decimals: 6
 * };
 * ```
 */
export interface TokenFormatRequest {
  /**
   * Raw amount (without decimals)
   */
  amount: string;

  /**
   * Number of decimals to apply
   */
  decimals: number;
}
