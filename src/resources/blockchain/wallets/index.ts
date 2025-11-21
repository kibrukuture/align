/**
 * Wallets Module Exports
 * 
 * This file exports the WalletsResource class and all related types and validators.
 * Provides a clean API for importing wallet functionality.
 * 
 * Usage:
 * ```typescript
 * import { WalletsResource } from './wallets';
 * import type { Wallet, EncryptedWallet } from './wallets';
 * ```
 */

// Export the wallets resource class
export { WalletsResource } from './wallets.resource';

// Export wallet types
export * from './wallets.types';

// Export wallet validators
export * from './wallets.validator';

// Export handlers (for advanced use cases)
export * from './handlers';

