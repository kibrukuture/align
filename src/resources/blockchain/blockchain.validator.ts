/**
 * Blockchain Resource - Main Validation Schemas
 * 
 * This file re-exports all validation schemas from blockchain sub-modules.
 * Provides a single import point for all blockchain-related validators.
 * 
 * Usage:
 * ```typescript
 * import { WalletAddressSchema, TransactionHashSchema } from './blockchain.validator';
 * ```
 */

// Re-export all wallet validators
export * from '@/resources/blockchain/wallets/wallets.validator';

// Re-export all transaction validators
export * from '@/resources/blockchain/transactions/transactions.validator';

// Re-export all token validators
export * from '@/resources/blockchain/tokens/tokens.validator';

