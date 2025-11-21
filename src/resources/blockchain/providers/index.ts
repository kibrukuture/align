/**
 * Providers Module Exports
 * 
 * This file exports the ProvidersResource class and all related types and configurations.
 * Provides a clean API for importing provider functionality.
 * 
 * Usage:
 * ```typescript
 * import { ProvidersResource } from '@/resources/blockchain/providers';
 * import type { Network, NetworkConfig } from '@/resources/blockchain/providers';
 * ```
 */

// Export the providers resource class
export { ProvidersResource } from '@/resources/blockchain/providers/providers.resource';

// Export provider types
export * from '@/resources/blockchain/providers/providers.types';

