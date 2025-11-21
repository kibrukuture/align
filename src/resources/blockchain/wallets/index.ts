/**
 * Wallets Module
 *
 * This module provides functionality for managing blockchain wallets.
 * It includes the main resource class, type definitions, validators, and low-level handlers.
 *
 * **Key Components:**
 * - {@link Wallets}: The main facade for wallet operations.
 * - {@link Wallet}: Type definition for a wallet object.
 * - {@link EncryptedWallet}: Type definition for encrypted wallet data.
 *
 * Usage:
 * ```typescript
 * import { Wallets } from './wallets';
 * import type { Wallet, EncryptedWallet } from './wallets';
 * ```
 */

// Export the wallets resource class
export { Wallets } from '@/resources/blockchain/wallets/wallets.resource';

// Export wallet types
export * from '@/resources/blockchain/wallets/wallets.types';

// Export wallet validators
export * from '@/resources/blockchain/wallets/wallets.validator';

// Export handlers (for advanced use cases)
export * from '@/resources/blockchain/wallets/handlers';

