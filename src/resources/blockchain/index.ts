/**
 * Blockchain Module
 *
 * The core module for all blockchain-related functionality in the Align SDK.
 * This module aggregates all sub-resources (Wallets, Transactions, Tokens, Providers)
 * and exports the main `Blockchain` class.
 *
 * **Structure:**
 * - **Resources:** High-level classes for interacting with the blockchain.
 * - **Types:** TypeScript interfaces and types used throughout the module.
 * - **Validators:** Zod schemas for runtime input validation.
 *
 * @module Blockchain
 *
 * Usage:
 * ```typescript
 * import { Blockchain } from './blockchain';
 * // or
 * import type { Wallet, Transaction } from './blockchain';
 * ```
 */

// Export main blockchain resource class
export { Blockchain } from '@/resources/blockchain/blockchain.resource';

// Export all blockchain types
export * from '@/resources/blockchain/blockchain.types';

// Export all blockchain validators
export * from '@/resources/blockchain/blockchain.validator';
