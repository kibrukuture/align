/**
 * Blockchain Resource - Main Type Definitions
 * 
 * This file re-exports all type definitions from blockchain sub-modules.
 * Provides a single import point for all blockchain-related types.
 * 
 * Usage:
 * ```typescript
 * import type { Wallet, Transaction, Token, BlockchainConfig } from '@tolbel/align';
 * ```
 */

// Re-export all wallet types
export * from '@/resources/blockchain/wallets/wallets.types';

// Re-export all transaction types
export * from '@/resources/blockchain/transactions/transactions.types';

// Re-export all token types
export * from '@/resources/blockchain/tokens/tokens.types';

// Re-export all provider types
export * from '@/resources/blockchain/providers/providers.types';

/**
 * Blockchain Resource Configuration
 * 
 * Optional configuration for initializing the BlockchainResource.
 */
export interface BlockchainConfig {
  /**
   * Custom RPC URLs for specific networks
   * Overrides default RPC providers
   */
  customRpcUrls?: Record<string, string>;
}

