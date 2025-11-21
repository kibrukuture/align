/**
 * Transactions Module Exports
 * 
 * This file exports the TransactionsResource class and all related types and validators.
 * Provides a clean API for importing transaction functionality.
 * 
 * Usage:
 * ```typescript
 * import { TransactionsResource } from '@/resources/blockchain/transactions';
 * import type { Transaction, TransactionStatus } from '@/resources/blockchain/transactions';
 * ```
 */

// Export the transactions resource class
export { TransactionsResource } from '@/resources/blockchain/transactions/transactions.resource';

// Export transaction types
export * from '@/resources/blockchain/transactions/transactions.types';

// Export transaction validators
export * from '@/resources/blockchain/transactions/transactions.validator';

// Export handlers (for advanced use cases)
export * from '@/resources/blockchain/transactions/handlers';

