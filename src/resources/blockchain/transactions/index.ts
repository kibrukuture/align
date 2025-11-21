/**
 * Transactions Module
 *
 * This module provides functionality for managing blockchain transactions.
 * It includes the main resource class, type definitions, validators, and low-level handlers.
 *
 * **Key Components:**
 * - {@link Transactions}: The main facade for transaction operations.
 * - {@link Transaction}: Type definition for a submitted transaction.
 * - {@link TransactionStatus}: Type definition for transaction states.
 *
 * @module Transactions
 *
 * Usage:
 * ```typescript
 * import { Transactions } from '@/resources/blockchain/transactions';
 * import type { Transaction, TransactionStatus } from '@/resources/blockchain/transactions';
 * ```
 */

// Export the transactions resource class
export { Transactions } from '@/resources/blockchain/transactions/transactions.resource';

// Export transaction types
export * from '@/resources/blockchain/transactions/transactions.types';

// Export transaction validators
export * from '@/resources/blockchain/transactions/transactions.validator';

// Export handlers (for advanced use cases)

