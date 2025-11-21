/**
 * Blockchain Resource - Main Module Exports
 * 
 * This file exports the main BlockchainResource class and all related types.
 * This is the entry point for the blockchain functionality in the SDK.
 * 
 * Usage:
 * ```typescript
 * import { BlockchainResource } from './blockchain';
 * // or
 * import type { Wallet, Transaction } from './blockchain';
 * ```
 */

// Export main blockchain resource class
export { BlockchainResource } from './blockchain.resource';

// Export all blockchain types
export * from './blockchain.types';

// Export all blockchain validators
export * from './blockchain.validator';

