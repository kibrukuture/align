/**
 * Providers Module
 *
 * This module manages connections to blockchain networks via RPC providers.
 * It handles connection pooling, network configuration, and custom RPC URLs.
 *
 * **Key Components:**
 * - {@link Providers}: The singleton resource for managing providers.
 * - {@link NetworkConfig}: Type definition for network configuration.
 *
 * @module Providers
 *
 * **Usage:**
 * ```typescript
 * import { Providers } from '@/resources/blockchain/providers';
 * import type { Network, NetworkConfig } from '@/resources/blockchain/providers';
 * ```
 */

// Export the providers resource class
export { Providers } from '@/resources/blockchain/providers/providers.resource';

// Export provider types
export * from '@/resources/blockchain/providers/providers.types';
