/**
 * Transactions Module Exports
 * 
 * This file exports the TransactionsResource class and all related types and validators.
 * Provides a clean API for importing transaction functionality.
 * 
 * Usage:
 * ```typescript
 * import { TransactionsResource } from './transactions';
 * import type { Transaction, TransactionStatus } from './transactions';
 * ```
 */

// Export the transactions resource class
export { TransactionsResource } from './transactions.resource';

// Export transaction types
export * from './transactions.types';

// Export transaction validators
export * from './transactions.validator';

// Export handlers (for advanced use cases)
export * from './handlers';

